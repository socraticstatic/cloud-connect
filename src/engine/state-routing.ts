// @ts-nocheck
/* Cloud Control - the mid-mile routing control plane (PRD O1 / U3).
   Builds on the existing flow table (CC.flows): collapses it to the
   significant steerable flows, computes candidate PATHS per flow (the
   hyperscaler-native public path vs AT&T mid-mile paths via each on-ramp
   that reaches the region), and lets the operator STEER/override the
   route - including cloud-to-cloud. Everything derives from the same
   substrate so % under control, diversity, and failover reconcile with
   Discovery (attach), Policies (route-private), and Observability. */
(function(CC){
const _=CC._;
const {onramps,regions,vpcs,clouds}=CC;
const PUBLIC_EGRESS=0.09, PRIVATE_EGRESS=0.02;
const FAILOVER={attMs:1800, nativeMs:47000};   // representative; sub-2s vs tens of seconds

const steered={};          // rowId -> pathId (operator override)
const failedPaths=new Set();// pathIds knocked out by failover sim
let lastFailover=null;     // {rowId, from, to, attMs, nativeMs}
const history=[];          // route-change log: {kind, label, detail}
function log(kind,label,detail){history.unshift({kind,label,detail});if(history.length>12)history.pop();}

const DST_LABEL={'ai-endpoints':'AI endpoints','internet':'public internet','storage':'object storage','intra-tag':'intra-app mesh'};

// vpc id -> {cid, rid, lat, attached}
function vpcLoc(){
  const m={};
  clouds.forEach(c=>(regions[c.id]||[]).forEach(r=>(vpcs[r.id]||[]).forEach(v=>{m[v.id]={cid:c.id,rid:r.id,lat:r.lat,attached:r.attached};})));
  return m;
}
function rampsFor(cid,rid){ return onramps.filter(o=>o.targets.some(([c,r])=>c===cid&&r===rid)); }
function regionAttached(cid,rid){const r=(regions[cid]||[]).find(x=>x.id===rid);return !!(r&&r.attached);}

// candidate paths for a flow rooted in cloud/region (lat = region latency)
function pathsForRegion(cid,rid,lat){
  const paths=[{id:'public',label:'Hyperscaler-native',sub:'public internet',via:null,mechanism:'public',
    latencyMs:Math.round(lat*1.7),egressPerGb:PUBLIC_EGRESS,attControlled:false,diversityGroup:'public',available:true}];
  rampsFor(cid,rid).forEach(o=>{
    const id='att-'+o.id;
    paths.push({id,label:'AT&T mid-mile',sub:o.name,via:o.id,
      mechanism:o.active?'native-route':'overlay',
      latencyMs:lat,egressPerGb:PRIVATE_EGRESS,attControlled:true,diversityGroup:o.site.name,
      available:o.active && !failedPaths.has(id)});
  });
  return paths;
}
function defaultPathId(flowViaPublic,paths){
  const att=paths.find(p=>p.attControlled&&p.available);
  return (!flowViaPublic && att)?att.id:'public';
}
function currentPath(row){
  let id=steered[row.id]||row.defaultPathId;
  let p=row.paths.find(x=>x.id===id);
  if(!p||!p.available){ // steered/default path went down -> reroute to best available
    p=row.paths.find(x=>x.attControlled&&x.available)||row.paths.find(x=>x.id==='public');
  }
  return p;
}
function availableAtt(row){return row.paths.filter(p=>p.attControlled&&p.available);}
function isDiverse(row){
  const groups=new Set(availableAtt(row).map(p=>p.diversityGroup));
  return groups.size>=2;
}

// explicit cloud-to-cloud flows (U3) - flows() does not model dst=cloud.
// The steerable hop is the mid-mile (AT&T backbone) vs the public internet.
function cloudToCloud(){
  // two diverse AT&T backbone PoPs (Ashburn / Dallas) -> real multi-path
  // diversity and a failover that reroutes to the diverse path, not to public.
  const c2cPaths=()=>[
    {id:'public',label:'Public internet',sub:'hyperscaler-native peering',via:null,mechanism:'public',
      latencyMs:43,egressPerGb:PUBLIC_EGRESS,attControlled:false,diversityGroup:'public',available:true},
    {id:'att-iad',label:'AT&T mid-mile',sub:'backbone · Ashburn PoP',via:'nb1',mechanism:'native-route',
      latencyMs:18,egressPerGb:PRIVATE_EGRESS,attControlled:true,diversityGroup:'Ashburn',available:!failedPaths.has('att-iad')},
    {id:'att-dal',label:'AT&T mid-mile',sub:'backbone · Dallas PoP',via:'nb2',mechanism:'native-route',
      latencyMs:22,egressPerGb:PRIVATE_EGRESS,attControlled:true,diversityGroup:'Dallas',available:!failedPaths.has('att-dal')},
  ];
  // AI-cloud DCI pairs: the backbone GPU path exists only once the GPU
  // on-ramp (nb2, which attaches CoreWeave + Nebius) is up - so east-west
  // reconciles with Discovery attach the same way north-south does.
  const gpuUp=onramps.find(o=>o.id==='nb2').active;
  const dciPaths=()=>[
    {id:'public',label:'Public internet',sub:'GPU-cloud public peering',via:null,mechanism:'public',
      latencyMs:51,egressPerGb:PUBLIC_EGRESS,attControlled:false,diversityGroup:'public',available:true},
    {id:'att-dal',label:'AT&T mid-mile',sub:'backbone · Dallas PoP · GPU DCI',via:'nb2',mechanism:'native-route',
      latencyMs:24,egressPerGb:PRIVATE_EGRESS,attControlled:true,diversityGroup:'Dallas',available:gpuUp&&!failedPaths.has('att-dal')},
  ];
  return [
    {id:'c2c-aws-azure',kind:'c2c',label:'AWS us-east-1 ↔ Azure West US 2',gbps:6.3,viaPublic:true,paths:c2cPaths()},
    {id:'c2c-aws-gcp',kind:'c2c',label:'AWS us-east-1 ↔ Google Cloud us-central1',gbps:2.4,viaPublic:true,paths:c2cPaths()},
    {id:'c2c-aws-cw',kind:'c2c',label:'AWS us-east-1 ↔ CoreWeave (GPU inference DCI)',gbps:4.1,viaPublic:!gpuUp,paths:dciPaths()},
    {id:'c2c-azure-neb',kind:'c2c',label:'Azure West US 2 ↔ Nebius (classified GPU DCI)',gbps:2.9,viaPublic:!gpuUp,paths:dciPaths()},
  ];
}

// the curated, steerable flow set
function routeFlows(){
  const loc=vpcLoc();
  // aggregate the raw flow table by (tag, dst); keep a representative region (highest-gbps contributor)
  const agg={};
  CC.flows().forEach(f=>{
    if(f.dst==='intra-tag')return; // mesh handled conceptually; keep the list focused
    const l=loc[f.srcVpc]; if(!l)return;
    const key=f.srcTag+'|'+f.dst;
    const a=agg[key]||(agg[key]={tag:f.srcTag,dst:f.dst,gbps:0,viaPublic:false,best:0,cid:l.cid,rid:l.rid,lat:l.lat});
    a.gbps+=f.gbps; a.viaPublic=a.viaPublic||f.viaPublic;
    if(f.gbps>a.best){a.best=f.gbps;a.cid=l.cid;a.rid=l.rid;a.lat=l.lat;}
  });
  const rows=Object.values(agg)
    .filter(a=>a.gbps>=1.5)                 // significant flows only
    .sort((x,y)=>y.gbps-x.gbps)
    .map(a=>{
      const paths=pathsForRegion(a.cid,a.rid,a.lat);
      // default follows the representative region's actual attachment (consistent
      // with Discovery: attached region => already on the AT&T private path).
      const viaPublic=!regionAttached(a.cid,a.rid);
      // `dst` is projected, not just folded into the id/label: callers that
      // need "which flows go to AI endpoints" must not have to parse a string.
      // Discover's AI blurb reads it to check its own claim against this table.
      const row={id:'r-'+a.tag+'-'+a.dst,kind:'app',dst:a.dst,
        label:tagName(a.tag)+' → '+(DST_LABEL[a.dst]||a.dst),
        srcCloud:a.cid,srcRid:a.rid,gbps:Math.round(a.gbps*10)/10,viaPublic,paths};
      row.defaultPathId=defaultPathId(viaPublic,paths);
      return row;
    });
  // attach cloud-to-cloud (set their default = public unless steered)
  cloudToCloud().forEach(c=>{c.defaultPathId=defaultPathId(c.viaPublic,c.paths);rows.push(c);});
  // resolve current path + diversity for each
  rows.forEach(r=>{r.current=currentPath(r);r.diverse=isDiverse(r);r.steered=!!steered[r.id];});
  return rows;
}
function tagName(t){const tg=CC.TAGS[t];return tg?tg.label:(t==='untagged'?'Untagged':t);}

function steerFlow(rowId,pathId){
  steered[rowId]=pathId;
  const r=routeFlows().find(x=>x.id===rowId);
  if(r)log('steer',r.label,'steered onto '+(r.current.label+(r.current.sub?' · '+r.current.sub:'')));
  _.emit({type:'route',rowId,pathId});return true;
}
function clearSteer(rowId){
  const r=routeFlows().find(x=>x.id===rowId);
  delete steered[rowId];
  if(r)log('revert',r.label,'reverted to hyperscaler-native');
  _.emit({type:'route',rowId});return true;
}

function routingKpis(){
  const rows=routeFlows();
  const total=rows.reduce((s,r)=>s+r.gbps,0)||1;
  const controlled=rows.filter(r=>r.current.attControlled);
  const ctrlGbps=controlled.reduce((s,r)=>s+r.gbps,0);
  const diverseGbps=controlled.filter(r=>r.diverse).reduce((s,r)=>s+r.gbps,0);
  // north-south = app egress/storage/AI flows; east-west = cloud-to-cloud
  const ew=rows.filter(r=>r.kind==='c2c'), ns=rows.filter(r=>r.kind!=='c2c');
  const pct=(sub)=>{const t=sub.reduce((s,r)=>s+r.gbps,0)||0;const c=sub.filter(r=>r.current.attControlled).reduce((s,r)=>s+r.gbps,0);return t?Math.round(c/t*100):0;};
  return {
    pctUnderControl:Math.round(ctrlGbps/total*100),
    pctDiverse:ctrlGbps?Math.round(diverseGbps/ctrlGbps*100):0,
    flowsSteered:Object.keys(steered).length,
    controlledGbps:Math.round(ctrlGbps*10)/10,
    totalGbps:Math.round(total*10)/10,
    eastWestGbps:Math.round(ew.reduce((s,r)=>s+r.gbps,0)*10)/10,
    eastWestControlledPct:pct(ew),
    northSouthControlledPct:pct(ns),
    failover:lastFailover?{attMs:lastFailover.attMs,nativeMs:lastFailover.nativeMs}:FAILOVER,
    failoverActive:!!lastFailover,
  };
}

// knock out the flow's current AT&T path; reroute to the diverse path; measure vs native
function routingFailover(rowId){
  const row=routeFlows().find(r=>r.id===rowId);
  if(!row||!row.current.attControlled)return null;
  const downId=row.current.id, downVia=row.current.via;
  failedPaths.add(downId);
  // reflect in Discovery's failure sim too, when this is a real on-ramp path
  if(downVia&&onramps.find(o=>o.id===downVia&&o.active)){try{CC.simulateFailure(downVia);}catch(e){}}
  const after=routeFlows().find(r=>r.id===rowId);
  lastFailover={rowId,from:row.current.sub||row.current.label,to:(after.current.sub||after.current.label),attMs:FAILOVER.attMs,nativeMs:FAILOVER.nativeMs};
  log('failover',row.label,`path down → rerouted ${lastFailover.from} → ${lastFailover.to} in ${(FAILOVER.attMs/1000).toFixed(1)}s (public path: ~${Math.round(FAILOVER.nativeMs/1000)}s)`);
  _.emit({type:'route-failover',rowId});
  return lastFailover;
}
function routingRestore(){failedPaths.clear();lastFailover=null;try{CC.clearSim();}catch(e){}_.emit({type:'route-restore'});}
function routeHistory(){return history.slice();}

/* ---- scene graph for the isometric canvas: edge -> AT&T mid-mile -> clouds ---- */
// First-mile ingress labeled with the AT&T transport product that carries it:
// AVPN (MPLS VPN), ADI (Dedicated Internet), ABF (Business Fiber), plus
// Mobility/Wireless and the public Internet on-ramp.
const EDGE_NODES=[
  {id:'e-hq',label:'HQ · Dallas · AVPN',kind:'edge'},
  {id:'e-dc',label:'DC · Ashburn · ADI',kind:'edge'},
  {id:'e-branch',label:'Branch · ABF',kind:'edge'},
  {id:'e-mob',label:'Mobility · Wireless',kind:'edge'},
  {id:'e-net',label:'Internet',kind:'edge'},
];
function popNodes(){return onramps.map(o=>({id:'p-'+o.id,label:o.name,site:o.site.name,kind:'pop',active:o.active,onramp:o.id}));}
function cloudNodes(){return clouds.map(c=>({id:'c-'+c.id,label:c.name,kind:'cloud',cloud:c.id,ai:!!c.ai,attached:!!c.attached}));}
// map a flow's current path -> the PoP node it rides (or null for public)
function popForPath(p){
  if(!p||!p.attControlled)return null;
  if(p.via&&onramps.find(o=>o.id===p.via))return 'p-'+p.via;
  // c2c backbone PoPs (att-iad/att-dal) map to nb1/nb2 sites
  if(p.id==='att-iad')return 'p-nb1';
  if(p.id==='att-dal')return 'p-nb2';
  return null;
}
function sceneGraph(){
  const edge=EDGE_NODES.map((n,i)=>({...n,gx:0,gy:i*1.6+0.5}));
  const pops=popNodes().map((n,i)=>({...n,gx:4,gy:i*1.6+0.2}));
  const cl=cloudNodes().map((n,i)=>({...n,gx:8.5,gy:i*1.35}));
  const nodes=[...edge,...pops,...cl];
  const flows=routeFlows();
  // curated, readable subset: controlled flows first (so the AT&T-green paths
  // always show), then the largest public ones, plus cloud-to-cloud.
  const appAll=flows.filter(f=>f.kind!=='c2c');
  const ctrl=appAll.filter(f=>f.current.attControlled).sort((a,b)=>b.gbps-a.gbps);
  const pub=appAll.filter(f=>!f.current.attControlled).sort((a,b)=>b.gbps-a.gbps);
  const app=[...ctrl,...pub].slice(0,5);
  const c2c=flows.filter(f=>f.kind==='c2c');
  const edges=[];
  app.forEach((f,i)=>{
    const to='c-'+f.srcCloud;
    const via=popForPath(f.current);
    edges.push({id:'edge-'+f.id,flowId:f.id,from:EDGE_NODES[i%EDGE_NODES.length].id,via,to,
      cls:f.current.attControlled?(f.current.mechanism==='overlay'?'overlay':'controlled'):'public',
      gbps:f.gbps,label:f.label,latencyMs:f.current.latencyMs});
  });
  c2c.forEach(f=>{
    const m=f.label.match(/↔\s*(.+)$/);
    const dstCloud=/Azure/.test(f.label)?'c-azure':/Google/.test(f.label)?'c-gcp':'c-oci';
    const via=popForPath(f.current);
    edges.push({id:'edge-'+f.id,flowId:f.id,from:'c-aws',via,to:dstCloud,kindC2C:true,
      cls:f.current.attControlled?'controlled':'public',gbps:f.gbps,label:f.label,latencyMs:f.current.latencyMs});
  });
  return {nodes,edges};
}

/* ---- agentic advisor (Akira-style): recommendations + auto-events ---- */
function routeAdvisor(){
  const flows=routeFlows();
  const recs=[];
  flows.forEach(f=>{
    if(!f.current.attControlled){
      const att=f.paths.find(p=>p.attControlled&&p.available);
      if(att){
        const pub=f.paths.find(p=>p.id==='public')||f.current;
        const dLat=Math.max(0,(pub.latencyMs||0)-(att.latencyMs||0));
        const dCost=Math.round(((pub.egressPerGb||0.09)-(att.egressPerGb||0.02))*100)/100;
        recs.push({id:'rec-'+f.id,flowId:f.id,pathId:att.id,
          title:f.label+' is on the public internet',
          detail:`Recommend steer to ${att.label}${att.sub?' · '+att.sub:''} — −${dLat}ms, −$${dCost}/GB`,
          action:'steer'});
      }
    } else if(!f.diverse){
      recs.push({id:'rec-div-'+f.id,flowId:f.id,
        title:f.label+' has a single path',
        detail:'Attach a second on-ramp to make this flow diverse (failover without dropping to public).',
        action:'diversify'});
    }
  });
  const events=history.filter(h=>h.kind==='failover').slice(0,3).map(h=>({title:h.label,detail:h.detail}));
  return {recommendations:recs.slice(0,5),events};
}

/* ---- fabric model (Cloud Fabric redesign C1): Sites → AT&T Fabric → Regions ----
   A shaped, deterministic view the fabric UI renders. Everything derives from the
   same substrate (EDGE_NODES / onramps / regions / routeFlows) so reliability,
   private/public and latency reconcile with Discovery attach and Routing steer. */

// Great-circle + fiber-route RTT estimate. Inlined (not imported from
// features/discover/latency.ts) so the engine has no dependency on the feature
// layer; the formula matches latency.ts (fiber factor 1.4, 124 mi/ms, 3ms base).
function _airMiles(aLat,aLon,bLat,bLon){
  const R=3958.8, toRad=d=>d*Math.PI/180;
  const dLat=toRad(bLat-aLat), dLon=toRad(bLon-aLon);
  const h=Math.sin(dLat/2)**2+Math.cos(toRad(aLat))*Math.cos(toRad(bLat))*Math.sin(dLon/2)**2;
  return 2*R*Math.asin(Math.min(1,Math.sqrt(h)));
}
function _estRttMs(aLat,aLon,bLat,bLon){return Math.round(3+_airMiles(aLat,aLon,bLat,bLon)*1.4*2/124);}

// parse the first-mile transport product off an EDGE_NODES label
// ("HQ · Dallas · AVPN" -> "AVPN"; "Internet" -> null)
function _firstMile(label){const m=label.match(/AVPN|ADI|ABF|Wireless/);return m?m[0]:null;}

// locate a region object + its cloud id by region id (region ids are unique)
function _findRegion(rid){
  for(const c of clouds){const r=(regions[c.id]||[]).find(x=>x.id===rid);if(r)return {cid:c.id,cloud:c,r};}
  return null;
}

// shape one region into the fabric view (reliability / path / latency / on-ramps)
function _regionShape(cid,cloud,r){
  const ramps=rampsFor(cid,r.id);
  const active=ramps.filter(o=>o.active);
  /* Reliability counts ACTIVE on-ramps and nothing else. `||r.spof` used to
     force 'single' on an unattached region, so UK South rendered a "Single
     path" pill 40px above two cards reading "Provisionable here" / "Not
     available here" and a Reach line reading "On the public internet - not yet
     attached": a pill asserting a path everything under it denied. `spof` is
     seeded true only on uks and cleared by activateOnramp, so it never added
     information to an ATTACHED region - use1 is 'single' from active.length
     either way. The type already carries 'none' for exactly this state. */
  const reliability = active.length>=2 ? 'dual' : active.length===1 ? 'single' : 'none';
  const path = active.length>=1 ? 'private' : 'public';
  // latency: nearest active on-ramp site -> region.geo; fall back to any capturing
  // on-ramp, then to the seeded region.lat when no geometry is available.
  let latencyMs=r.lat;
  const cand=(active.length?active:ramps).filter(o=>o.site&&typeof o.site.lat==='number');
  if(r.geo&&cand.length){
    latencyMs=Math.min(...cand.map(o=>_estRttMs(o.site.lat,o.site.lon,r.geo[0],r.geo[1])));
  }
  return {
    cloudId:cid, regionId:r.id, name:r.name, cloudName:cloud.name, attached:!!r.attached,
    reliability, path, latencyMs, onrampIds:ramps.map(o=>o.id),
  };
}

function fabricModel(){
  const sites=EDGE_NODES.map(n=>({id:n.id,label:n.label,firstMile:_firstMile(n.label)}));
  const fabricOnramps=onramps.map(o=>({
    id:o.id, name:o.name, type:o.type, site:o.site.name, active:!!o.active,
    targets:o.targets.map(([c,rid])=>[c,rid]),
  }));
  const shaped=[];
  clouds.forEach(c=>(regions[c.id]||[]).forEach(r=>shaped.push(_regionShape(c.id,c,r))));
  const c2c=routeFlows().filter(f=>f.kind==='c2c').map(f=>({
    id:f.id, label:f.label, gbps:f.gbps, viaPublic:!!f.viaPublic, controlled:!!f.current.attControlled,
  }));
  return {sites, onramps:fabricOnramps, regions:shaped, c2c};
}

// simulated provisioning: activate the on-ramp(s) that reach the region (marks it
// attached via activateOnramp), log it, and return the updated region shape.
// opts.onrampId targets a specific on-ramp; opts.resilient/attachType are carried
// for labeling only — the effect is activating the capturing on-ramp(s).
function provisionRegion(regionId,opts){
  opts=opts||{};
  const found=_findRegion(regionId);
  if(!found)return null;
  const {cid,cloud,r}=found;
  const ramps=opts.onrampId?onramps.filter(o=>o.id===opts.onrampId):rampsFor(cid,regionId);
  let activated=[];
  ramps.forEach(o=>{if(!o.active&&CC.activateOnramp(o.id)){activated.push(o.name);}});
  const shape=_regionShape(cid,cloud,r);
  const via=activated.length?activated.join(' + '):(ramps[0]?ramps[0].name:'existing path');
  const label=(opts.attachType?opts.attachType+' · ':'')+cloud.name+' '+r.name;
  log('provision',label,`attached ${r.name} via ${via}${opts.resilient?' (dual)':''} — now ${shape.path}/${shape.reliability}`);
  return shape;
}

Object.assign(CC,{routeFlows,steerFlow,clearSteer,routingKpis,routingFailover,routingRestore,routeHistory,sceneGraph,routeAdvisor,fabricModel,provisionRegion});
})(window.CC);
