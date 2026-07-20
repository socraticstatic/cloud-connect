// @ts-nocheck
/* Cloud Control - shared state model.
   One source of truth for Discovery AND Insights. Every number either
   page shows is computed from here; every action mutates here and both
   pages re-render. No prose-as-data.

   The model spans the js/state*.js files - plain scripts, no build
   step, so each is an IIFE extending window.CC in index.html order.
   This file is the core; cross-file privates live in the CC._ bag and
   are referenced at call time, never at load time, so a module only
   needs to exist by the time someone calls into it. */
window.CC = (function(){

const TAGS={
  'rd-helion':{label:'rd-helion',color:'var(--purple)',hex:'#9a7cff',desc:'R&D · Project Helion — should only talk to each other'},
  'finance-invoices':{label:'finance-invoices',color:'var(--amber)',hex:'#f2a23c',desc:'Finance · invoicing — must not have direct internet access'},
  'classified-helion':{label:'classified-helion',color:'var(--red)',hex:'#ff5c5c',desc:'Classified · Project Helion — all traffic must pass security inspection'},
  'shared-services':{label:'shared-services',color:'var(--teal)',hex:'#42d6c8',desc:'Shared services — cross-BU, baseline policy only'},
  // The three requirements-doc example-policy tags. Non-amber hues (indigo /
  // cyan / teal) so the example policies match real seeded workloads.
  'pci':{label:'pci',color:'#6366f1',hex:'#6366f1',desc:'Cardholder data · PCI-DSS — must ride an AT&T private path, never the public internet'},
  'internet-facing':{label:'internet-facing',color:'#0891b2',hex:'#0891b2',desc:'Public-facing edge — all egress must pass NGFW inspection'},
  'finance':{label:'finance',color:'#0d9488',hex:'#0d9488',desc:'Finance branch — segment to finance-tagged peers only'},
};

const onramps=[
  {id:'nb1',name:'NetBond · PE-IAD-02',type:'NetBond',sub:'Equinix IAD · 10Gbps',ic:'nb',active:true,
    site:{name:'Equinix IAD · Ashburn',lat:39.0,lon:-77.5},
    targets:[['aws','use1']]},
  {id:'dx1',name:'Direct Connect · Equinix DC2',type:'Direct Connect',sub:'Equinix DC2 · 10Gbps · unused capacity',ic:'dx',active:false,
    site:{name:'Equinix DC2 · Ashburn',lat:39.05,lon:-77.46},
    targets:[['aws','usw2'],['aws','euw1'],['gcp','usc1']]},
  {id:'er1',name:'ExpressRoute · Equinix CH1',type:'ExpressRoute',sub:'Equinix CH1 · 10Gbps · unused capacity',ic:'er',active:false,
    site:{name:'Equinix CH1 · Chicago',lat:41.88,lon:-87.63},
    targets:[['azure','wus2'],['azure','uks']]},
  {id:'nb2',name:'NetBond Adv · PE-DAL-01',type:'NetBond Adv',sub:'not yet provisioned',ic:'nb',active:false,planned:true,
    site:{name:'PE-DAL-01 · Dallas',lat:32.78,lon:-96.8},
    targets:[['cw','cwe'],['neb','nbe'],['oci','iad']]},
];

const clouds=[
  {id:'aws',name:'AWS',color:'#ff9900',mk:'aws',workloads:142,attached:true,partial:true},
  {id:'azure',name:'Azure',color:'#3b8bd4',mk:'AZ',workloads:88,attached:false},
  {id:'gcp',name:'Google Cloud',color:'#ea4335',mk:'GCP',workloads:31,attached:false},
  {id:'oci',name:'Oracle Cloud',color:'#f6543e',mk:'OCI',workloads:9,attached:false},
  {id:'cw',name:'CoreWeave',color:'#9a7cff',mk:'CW',workloads:6,attached:false,ai:true},
  {id:'neb',name:'Nebius',color:'#42d6c8',mk:'NB',workloads:8,attached:false,ai:true},
];
const regions={
  aws:[{id:'use1',name:'us-east-1',sub:'N. Virginia',subnets:14,lat:12,attached:true,geo:[38.9,-77.4]},
       {id:'usw2',name:'us-west-2',sub:'Oregon',subnets:8,lat:62,attached:false,geo:[45.6,-121.2]},
       {id:'euw1',name:'eu-west-1',sub:'Ireland',subnets:4,lat:88,attached:false,geo:[53.3,-6.3]}],
  azure:[{id:'wus2',name:'West US 2',sub:'Washington',subnets:9,lat:18,attached:false,geo:[47.2,-119.9]},
         {id:'uks',name:'UK South',sub:'London · single path',subnets:7,lat:42,attached:false,spof:true,geo:[51.5,-0.1]}],
  gcp:[{id:'usc1',name:'us-central1',sub:'Iowa',subnets:6,lat:34,attached:false,geo:[41.9,-93.6]}],
  oci:[{id:'iad',name:'us-ashburn-1',sub:'Ashburn',subnets:3,lat:20,attached:false,geo:[39.0,-77.5]}],
  cw:[{id:'cwe',name:'US-EAST-04A',sub:'GPU region',subnets:2,lat:28,attached:false,ai:true,geo:[40.2,-74.7]}],
  neb:[{id:'nbe',name:'eu-north1',sub:'Finland',subnets:2,lat:44,attached:false,ai:true,geo:[60.6,24.8]}],
};
const vpcs={
  use1:[{id:'vpcprod',name:'vpc-prod-01',cidr:'10.0.0.0/16',azs:3,subnets:6,attached:true,role:'Production · 3-tier',tags:['rd-helion','shared-services'],cloudTags:{Project:'xyz',Env:'prod',Owner:'platform'}},
        {id:'vpcdata',name:'vpc-data-02',cidr:'10.1.0.0/16',azs:2,subnets:4,attached:true,role:'Data lake',tags:['finance-invoices','pci','finance'],cloudTags:{Project:'abc',Env:'prod',Owner:'finance'}},
        {id:'vpcdmz',name:'vpc-dmz-03',cidr:'10.2.0.0/16',azs:2,subnets:4,attached:false,role:'DMZ · public',tags:['classified-helion','internet-facing'],cloudTags:{Project:'xyz',Env:'prod',Owner:'security'}}],
  usw2:[{id:'vpcwest',name:'vpc-west-01',cidr:'10.8.0.0/16',azs:2,subnets:4,attached:false,role:'Edge services',tags:['shared-services'],cloudTags:{Project:'xyz',Env:'prod',Owner:'platform'}},
        {id:'vpcbak',name:'vpc-backup-02',cidr:'10.9.0.0/16',azs:2,subnets:4,attached:false,role:'Backup',cloudTags:{Project:'ops',Env:'prod',Owner:'platform'}}],
  euw1:[{id:'vpceu',name:'vpc-eu-01',cidr:'10.12.0.0/16',azs:1,subnets:4,attached:false,role:'EMEA apps',tags:['shared-services'],cloudTags:{Project:'abc',Env:'prod',Owner:'emea'}}],
  wus2:[{id:'vnetapp',name:'vnet-app-02',cidr:'10.4.0.0/16',azs:2,subnets:5,attached:false,role:'App tier',vnet:true,tags:['rd-helion'],cloudTags:{Project:'xyz',Env:'stage',Owner:'platform'}},
        {id:'vnetdata',name:'vnet-data-03',cidr:'10.5.0.0/16',azs:2,subnets:4,attached:false,role:'Data',vnet:true,cloudTags:{Project:'abc',Env:'stage',Owner:'data'}}],
  uks:[{id:'vnetemea',name:'vnet-emea-01',cidr:'10.6.0.0/16',azs:1,subnets:4,attached:false,role:'EMEA · SPOF',vnet:true,cloudTags:{Project:'abc',Env:'prod',Owner:'emea'}},
       {id:'vnetdmz',name:'vnet-dmz-uk',cidr:'10.7.0.0/16',azs:1,subnets:3,attached:false,role:'DMZ',vnet:true,cloudTags:{Project:'ops',Env:'prod',Owner:'security'}}],
  usc1:[{id:'vpcgcp1',name:'vpc-gke-prod',cidr:'10.16.0.0/16',azs:2,subnets:4,attached:false,role:'GKE',cloudTags:{Project:'xyz',Env:'prod',Owner:'platform'}},
        {id:'vpcgcp2',name:'vpc-svc-02',cidr:'10.4.0.0/16',azs:1,subnets:2,attached:false,role:'Services',cloudTags:{Project:'ops',Env:'prod',Owner:'platform'}}],
  iad:[{id:'ocivcn',name:'vcn-prod-01',cidr:'10.20.0.0/16',azs:1,subnets:3,attached:false,role:'Production',vnet:true,cloudTags:{Project:'abc',Env:'prod',Owner:'platform'}}],
  cwe:[{id:'cwgpu',name:'gpu-cluster-01',cidr:'10.30.0.0/16',azs:1,subnets:2,attached:false,role:'H100 inference',ai:true,vnet:true,tags:['rd-helion'],cloudTags:{Project:'xyz',Env:'prod',Owner:'ml'}}],
  nbe:[{id:'nbgpu',name:'nb-gpu-net',cidr:'10.34.0.0/16',azs:1,subnets:2,attached:false,role:'L40S inference',ai:true,vnet:true,tags:['classified-helion'],cloudTags:{Project:'abc',Env:'prod',Owner:'ml'}}],
};

/* Remediation flags - policies and service insertions applied this session */
const fixes={
  fwInspection:false,   // classified-helion: inline firewall on vpc-dmz-03 + nb-gpu-net
  isolateFinance:false, // finance-invoices: drop public-subnet association on vpc-data-02
  segmentHelion:false,  // rd-helion: cross-cloud segmentation policy authored
  shiftAws:false,       // move AWS workloads onto idle NetBond headroom
  renumbered:false,     // vpc-svc-02 renumbered off the 10.4.0.0/16 collision
  dnsFirewall:false,    // resolver DNS firewall: blocks DNS tunneling on classified-helion egress
  dataPerimeter:false,  // resource perimeter: deny writes to object storage outside the org
};


/* ---------------- audit ----------------
   The audit trail records every mutation with a timestamp and persists
   across reloads - governance products do not forget. */
const AUDIT_KEY='cc-audit';
function auditLog(){try{return JSON.parse(localStorage.getItem(AUDIT_KEY)||'[]');}catch(e){return [];}}
function auditWrite(label,posture){
  try{
    const log=auditLog();
    log.unshift({ts:Date.now(),label,posture});
    localStorage.setItem(AUDIT_KEY,JSON.stringify(log.slice(0,200)));
  }catch(e){}
}
function auditClear(){try{localStorage.removeItem(AUDIT_KEY);}catch(e){}emit({type:'policy',label:'Audit trail cleared'});}

/* ---------------- pub/sub + history ---------------- */
const listeners=[];
const hist=[];
function subscribe(fn){listeners.push(fn);}
function emit(ev){
  if(ev&&(ev.type==='onramp'||ev.type==='fix'))hist.push({label:ev.label||ev.id||ev.key,posture:posture()});
  if(ev&&(ev.type==='onramp'||ev.type==='fix'||ev.type==='policy'))auditWrite(ev.label||ev.id||ev.key,posture());
  listeners.forEach(f=>{try{f(ev);}catch(e){console.error(e);}});
}
function history(){return hist.slice();}

/* ---------------- mutations ---------------- */
const sessionAttached=[]; // region keys attached during THIS session, in order
function activateOnramp(id,silent){
  const o=onramps.find(x=>x.id===id);
  if(!o||o.active)return false;
  if(!silent)pushUndo('Attach '+o.name);
  o.active=true;o.planned=false;
  if(!silent)o.sub=o.sub.replace(' · unused capacity','').replace('not yet provisioned','provisioned this session');
  o.targets.forEach(([cid,rid])=>{
    const cl=clouds.find(c=>c.id===cid); if(cl){cl.attached=true;}
    const r=(regions[cid]||[]).find(x=>x.id===rid);
    if(r){r.attached=true;r.spof=false;(vpcs[rid]||[]).forEach(v=>{v.attached=true;});}
    if(!silent&&!sessionAttached.includes(cid+'/'+rid))sessionAttached.push(cid+'/'+rid);
  });
  if(!silent)emit({type:'onramp',id,label:o.name});
  return true;
}
function applyFix(key,silent){
  if(!(key in fixes)||fixes[key])return false;
  if(!silent)pushUndo('Fix '+key);
  fixes[key]=true;
  if(key==='renumbered'){const v=vpcs.usc1.find(x=>x.id==='vpcgcp2');if(v)v.cidr=nextFreeCidr();}
  if(!silent)emit({type:'fix',key,label:key});
  return true;
}

/* ---------------- projection (preview before commit) ----------------
   Apply a mutation silently against the live model, read the outcome,
   restore from snapshot. Pure function to the caller. */
function snapshot(){
  return {
    onr:onramps.map(o=>({active:o.active,planned:o.planned,sub:o.sub})),
    cl:clouds.map(c=>c.attached),
    reg:Object.fromEntries(Object.entries(regions).map(([k,rs])=>[k,rs.map(r=>({attached:r.attached,spof:r.spof}))])),
    vp:Object.fromEntries(Object.entries(vpcs).map(([k,vs])=>[k,vs.map(v=>({attached:v.attached,cidr:v.cidr}))])),
    fx:{...fixes},
    rl:_.rules.map(r=>({...r,src:{...r.src},chain:r.chain.slice()})),
    cp:_.customPolicies.map(p=>({...p})),
    app:CC.settings.requireApproval,
  };
}
function restore(s){
  onramps.forEach((o,i)=>{o.active=s.onr[i].active;o.planned=s.onr[i].planned;o.sub=s.onr[i].sub;});
  clouds.forEach((c,i)=>{c.attached=s.cl[i];});
  Object.entries(regions).forEach(([k,rs])=>rs.forEach((r,i)=>{r.attached=s.reg[k][i].attached;r.spof=s.reg[k][i].spof;}));
  Object.entries(vpcs).forEach(([k,vs])=>vs.forEach((v,i)=>{v.attached=s.vp[k][i].attached;v.cidr=s.vp[k][i].cidr;}));
  Object.assign(fixes,s.fx);
  if(s.rl){_.rules.length=0;s.rl.forEach(r=>_.rules.push({...r,src:{...r.src},chain:r.chain.slice()}));}
  if(s.cp){_.customPolicies.length=0;s.cp.forEach(p=>_.customPolicies.push({...p}));}
  if(s.app!==undefined)CC.settings.requireApproval=s.app;
}

/* ---------------- undo ----------------
   A snapshot stack: every user mutation pushes the prior state first.
   Undo restores it and emits - all surfaces re-derive. The audit trail
   is a ledger, not a timeline: undo APPENDS an entry rather than
   erasing one. */
const undoStack=[];
function pushUndo(label){
  undoStack.push({label,snap:snapshot()});
  if(undoStack.length>30)undoStack.shift();
}
function undo(){
  const u=undoStack.pop();
  if(!u)return false;
  restore(u.snap);
  emit({type:'policy',label:'Undid · '+u.label});
  return true;
}
function canUndo(){return undoStack.length?undoStack[undoStack.length-1].label:null;}
function project(step){
  const snap=snapshot();
  step();
  const out={posture:posture(),pub:publicVpcs(),violations:violations().length,
    egressPub:CC.egress().pub,savings:CC.egress().savings,scores:scores()};
  restore(snap);
  return out;
}
function previewOnramp(id){const o=onramps.find(x=>x.id===id);if(!o||o.active)return null;return project(()=>activateOnramp(id,true));}
function previewFix(key){if(fixes[key])return null;return project(()=>applyFix(key,true));}

/* ---------------- remediation plan ----------------
   Greedy ordering of every available step by posture gain, with
   cumulative projections - the Advisor playbook concept. */
const STEP_DEFS=[
  {id:'nb2',kind:'onramp',label:'Attach CoreWeave, Nebius & OCI via NetBond Adv · PE-DAL-01'},
  {id:'dx1',kind:'onramp',label:'Attach AWS us-west-2, eu-west-1 + GCP via Direct Connect · DC2'},
  {id:'er1',kind:'onramp',label:'Attach both Azure regions via ExpressRoute · CH1'},
  {id:'fwInspection',kind:'fix',label:'Insert fw-inspect-01 on classified-helion egress'},
  {id:'isolateFinance',kind:'fix',label:'Isolate finance-invoices from internet'},
  {id:'segmentHelion',kind:'fix',label:'Segment rd-helion cross-cloud'},
  {id:'renumbered',kind:'fix',label:'Renumber vpc-svc-02 off the 10.4.0.0/16 collision'},
  {id:'shiftAws',kind:'fix',label:'Shift AWS workloads onto idle NetBond headroom'},
];
function stepAvailable(d){return d.kind==='onramp'?!onramps.find(o=>o.id===d.id).active:!fixes[d.id];}
function runStep(d,silent){return d.kind==='onramp'?activateOnramp(d.id,silent):applyFix(d.id,silent);}
function plan(){
  const avail=STEP_DEFS.filter(stepAvailable);
  if(!avail.length)return {steps:[],from:posture(),to:posture()};
  const snap=snapshot();
  const from=posture();
  // greedy: at each point pick the remaining step with the biggest gain
  const ordered=[];
  const rest=avail.slice();
  while(rest.length){
    let best=null,bestGain=-1,bestPosture=0;
    rest.forEach(d=>{
      const before=posture();
      const s2=snapshot();runStep(d,true);const p=posture();restore(s2);
      if(p-before>bestGain){bestGain=p-before;best=d;bestPosture=p;}
    });
    runStep(best,true);
    ordered.push({...best,projected:posture(),gain:bestGain});
    rest.splice(rest.indexOf(best),1);
  }
  const to=posture();
  restore(snap);
  return {steps:ordered,from,to};
}
function applyStep(id){
  const d=STEP_DEFS.find(x=>x.id===id);
  if(!d||!stepAvailable(d))return false;
  return runStep(d,false);
}

/* ---------------- failure simulation (what-if) ---------------- */
const sim={onrampId:null,defense:true};
function simulateFailure(id){
  const o=onramps.find(x=>x.id===id);
  if(!o||!o.active)return false;
  sim.onrampId=id;emit({type:'sim',id});return true;
}
function clearSim(){sim.onrampId=null;emit({type:'sim-clear'});}
function toggleDefense(){sim.defense=!sim.defense;emit({type:'defense'});}
function simImpact(){
  if(!sim.onrampId)return null;
  const o=onramps.find(x=>x.id===sim.onrampId);
  const vpcIds=[],regionKeys=[];let workloads=0;
  o.targets.forEach(([cid,rid])=>{
    regionKeys.push(cid+'/'+rid);
    (vpcs[rid]||[]).forEach(v=>{vpcIds.push(v.id);workloads+=v.subnets*3;});
  });
  // egress that would fall back to public rates while the path is down
  const atRisk=sim.onrampId==='nb1'?18300:sim.onrampId==='nb2'?11400:sim.onrampId==='dx1'?9500:6000;
  return {onramp:o,vpcIds,regionKeys,workloads,atRisk,defense:sim.defense};
}



/* ---------------- selectors ---------------- */
function allVpcs(){return Object.values(vpcs).flat();}
function counts(){
  const av=allVpcs();
  return {
    clouds:clouds.length,
    regions:Object.values(regions).reduce((s,r)=>s+r.length,0),
    vpcs:av.length,
    subnets:Object.values(regions).flat().reduce((s,r)=>s+r.subnets,0),
    gateways:38,
    workloads:clouds.reduce((s,c)=>s+c.workloads,0),
    attached:av.filter(v=>v.attached).length,
  };
}
/* public-by-design: an INSPECTED DMZ on the public internet is correct
   architecture, not an exposure - once fw-inspect-01 is inline, vpc-dmz-03
   stops counting against the posture and the story can actually close. */
function designedPublic(){
  return fixes.fwInspection&&!vpcs.use1.find(v=>v.id==='vpcdmz').attached?1:0;
}
function publicVpcs(){const c=counts();return Math.max(0,c.vpcs-c.attached-designedPublic());}
function aiExposed(){
  // AI endpoints still riding public internet: CoreWeave + Nebius VPCs (+ OpenAI API, governed when nb2 lands)
  const gpuPublic=allVpcs().filter(v=>v.ai&&!v.attached).length;
  return gpuPublic + (onramps.find(o=>o.id==='nb2').active?0:1);
}
function activeOnramps(){return onramps.filter(o=>o.active).length;}
function reachableUnattached(){
  let n=0;
  onramps.filter(o=>!o.active).forEach(o=>o.targets.forEach(([,rid])=>{n+=(vpcs[rid]||[]).length;}));
  return n;
}
/* Policy violations, the same ones Discovery paints on route tables */
function violations(){
  const v=[];
  if(!fixes.isolateFinance)v.push({tag:'finance-invoices',vpc:'vpcdata',msg:'direct internet path exists'});
  if(!fixes.fwInspection){
    v.push({tag:'classified-helion',vpc:'vpcdmz',msg:'egress bypasses inspection'});
    v.push({tag:'classified-helion',vpc:'nbgpu',msg:'egress bypasses inspection'});
  }
  if(!fixes.segmentHelion)v.push({tag:'rd-helion',vpc:null,msg:'cross-cloud spread unsegmented'});
  _.customPolicies.forEach(p=>{
    CC.evalPolicy(p).violations.forEach(x=>v.push({tag:p.tag,vpc:x.vpc,msg:x.msg,policy:p.id}));
  });
  // the three requirements-doc example policies: matched, tag-carrying
  // workloads are in violation until the policy is enforced (same shape as
  // the seed fixes above - they clear on enforce and re-derive posture).
  if(CC.exampleRules)CC.exampleRules().forEach(r=>{
    CC.evalExample(r).violations.forEach(x=>v.push({tag:r.src.tag,vpc:x.vpc,msg:x.msg,policy:r.id}));
  });
  return v;
}
/* IP address plan - every CIDR, conflicts marked. The Advisor IP Plan. */
function regionName(rid){for(const [cid,rs] of Object.entries(regions)){const r=rs.find(x=>x.id===rid);if(r)return {cloud:clouds.find(c=>c.id===cid),region:r};}return null;}
function addressPlan(){
  const rows=[];
  Object.entries(vpcs).forEach(([rid,vs])=>{
    const loc=regionName(rid);
    vs.forEach(v=>rows.push({vpc:v.id,name:v.name,cidr:v.cidr,cloud:loc.cloud.name,region:loc.region.name}));
  });
  const byCidr={};rows.forEach(r=>{(byCidr[r.cidr]=byCidr[r.cidr]||[]).push(r);});
  rows.forEach(r=>{r.conflict=byCidr[r.cidr].length>1?byCidr[r.cidr].filter(x=>x.vpc!==r.vpc):[];});
  const conflicts=Object.values(byCidr).filter(g=>g.length>1).length;
  return {rows,conflicts,nextFree:nextFreeCidr()};
}
function nextFreeCidr(){
  const used=new Set();Object.values(vpcs).flat().forEach(v=>used.add(+v.cidr.split('.')[1]));
  for(let x=0;x<256;x++){if(!used.has(x))return `10.${x}.0.0/16`;}
  return '172.16.0.0/16';
}


/* Category posture scores - computed, so fixes visibly move them */
function scores(){
  const c=counts();
  const share=c.attached/c.vpcs;
  const e=CC.egress();
  const uks=regions.azure.find(r=>r.id==='uks');
  const usw2=regions.aws.find(r=>r.id==='usw2');
  return {
    reach: Math.min(95,Math.round(46+share*30+activeOnramps()*4)),
    exposure: Math.min(95,87-3*publicVpcs()+(fixes.fwInspection?2:0)+(fixes.dnsFirewall?2:0)+(fixes.dataPerimeter?2:0)),
    policy: 78-5*violations().length,
    cost: Math.min(95,Math.round(90-24*(e.pub/29900))),
    perf: Math.min(95,71+(uks.attached?8:0)+(usw2.attached?5:0)),
    address: addressPlan().conflicts?70:94,
    // the tokens layer is governed too - or it isn't, and the score says so
    ai: aiGovScore(),
  };
}
function aiGovScore(){
  const tp=(_.tokenPolicies)||{};
  const enforced=Object.values(tp).filter(p=>p.enforced).length;
  const classifiedGuard=tp['classified-helion']&&tp['classified-helion'].guardrail;
  const gpuPrivate=regions.cw.find(r=>r.id==='cwe').attached&&regions.neb.find(r=>r.id==='nbe').attached;
  const governedEgress=onramps.find(o=>o.id==='nb2').active;
  return Math.min(95,40+enforced*8+(classifiedGuard?10:0)+(gpuPrivate?15:0)+(governedEgress?6:0));
}
function posture(){
  const s=scores();
  return Math.round((s.reach+s.exposure+s.policy+s.cost+s.perf+s.address+s.ai)/7);
}

/* the internal bag: privates the sibling state*.js modules share.
   Members land here as each module loads; consumers read them at call
   time, so the bag is the only load-order coupling between files. */
const _={emit,hist,sessionAttached,pushUndo};

return {TAGS,onramps,clouds,regions,vpcs,fixes,sim,designedPublic,
  auditLog,auditClear,
  undo,canUndo,
  subscribe,activateOnramp,applyFix,
  previewOnramp,previewFix,plan,applyStep,history,
  simulateFailure,clearSim,toggleDefense,simImpact,
  addressPlan,nextFreeCidr,
  counts,publicVpcs,aiExposed,activeOnramps,reachableUnattached,
  violations,scores,posture,_};
})();
