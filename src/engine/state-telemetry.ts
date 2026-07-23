// @ts-nocheck
/* Cloud Control - telemetry (observability mock data).
   Deterministic seeded series, derived FROM the state model so every
   chart agrees with every page: a region's latency series ends at the
   latency shown in the Discovery tree, attaching this session steps the
   line down to the private envelope, an active failure sim spikes it. */
(function(CC){
const _=CC._;
const {clouds,regions,vpcs}=CC;

function mulberry32(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
function hashStr(str){let h=2166136261;for(const c of str){h^=c.charCodeAt(0);h=Math.imul(h,16777619);}return h>>>0;}
/* the rule engine seeds its flow table from the same generators - one
   PRNG family keeps every derived number reproducible across pages */
_.mulberry32=mulberry32;
_.hashStr=hashStr;
const PRIVATE_LAT=12;

function regionList(){
  const out=[];
  clouds.forEach(cl=>(regions[cl.id]||[]).forEach(r=>out.push({key:cl.id+'/'+r.id,cloud:cl,region:r})));
  return out;
}
/* one seeded anomaly: eu-west-1 transit congestion event in the past */
const ANOMALY={key:'aws/euw1',at:0.62,factor:2.3,
  title:'Transit congestion · eu-west-1',
  explain:()=>`<b>eu-west-1 latency spiked to ~${Math.round(regions.aws.find(r=>r.id==='euw1').lat*2.3)}ms</b> for roughly 4 hours. The signature — latency up, throughput flat, every other region steady — is upstream transit congestion on the public path, not an application change. ${regions.aws.find(r=>r.id==='euw1').attached?'Since attaching over Direct Connect this session, eu-west-1 rides the private envelope (~12-14ms) where transit events like this cannot reach it.':'eu-west-1 still rides public transit — Direct Connect · Equinix DC2 already terminates near it; attaching removes exposure to exactly this class of event.'}`};

function latencySeries(key,N){
  const item=regionList().find(x=>x.key===key); if(!item)return [];
  const r=item.region;
  const rng=mulberry32(hashStr('lat:'+key));
  const wasAttachedAtLoad=key==='aws/use1';
  const attachedNow=r.attached;
  const sessionIdx=_.sessionAttached.indexOf(key); // -1 if not this session
  const stepAt=sessionIdx>=0?Math.floor(N*0.82):-1;
  const pts=[];
  // the PUBLIC baseline for a region is its discovered latency
  const pubBase=wasAttachedAtLoad?34:r.lat||34;
  for(let i=0;i<N;i++){
    let target,variance;
    const isPrivate=wasAttachedAtLoad||(stepAt>=0&&i>=stepAt);
    if(isPrivate){target=PRIVATE_LAT;variance=1.6;}
    else {target=pubBase;variance=pubBase*0.18;}
    let v=target+(rng()-0.5)*2*variance+Math.sin(i/N*6.28*2)*variance*0.4;
    if(ANOMALY.key===key&&!isPrivate){
      const d=Math.abs(i/N-ANOMALY.at);
      if(d<0.04)v*=ANOMALY.factor-(d/0.04)*(ANOMALY.factor-1);
    }
    pts.push(Math.max(8,Math.round(v*10)/10));
  }
  // live failure sim spikes the tail
  const impact=CC.simImpact();
  if(impact&&impact.regionKeys.includes(key)){
    const spike=impact.defense?pubBase*1.6:pubBase*2.6;
    pts[N-2]=Math.round(spike*0.8);pts[N-1]=Math.round(spike);
  } else if(attachedNow){
    pts[N-1]=PRIVATE_LAT+Math.round((rng()-0.5)*3);
  } else {
    pts[N-1]=r.lat; // charts agree with the tree
  }
  return pts;
}
/* packet-loss series, derived the same deterministic way as latency: the
   public path loses ~0.25% (worse during the seeded congestion anomaly),
   the private envelope loses ~0.02%, and attaching this session steps the
   line down. No Math.random / Date.now - one seed per region key. */
const PUBLIC_LOSS=0.25, PRIVATE_LOSS=0.02;
function lossSeries(key,N){
  const item=regionList().find(x=>x.key===key); if(!item)return [];
  const r=item.region;
  const rng=mulberry32(hashStr('loss:'+key));
  const wasAttachedAtLoad=key==='aws/use1';
  const attachedNow=r.attached;
  const sessionIdx=_.sessionAttached.indexOf(key);
  const stepAt=sessionIdx>=0?Math.floor(N*0.82):-1;
  const pts=[];
  for(let i=0;i<N;i++){
    const isPrivate=wasAttachedAtLoad||(stepAt>=0&&i>=stepAt);
    const target=isPrivate?PRIVATE_LOSS:PUBLIC_LOSS;
    const variance=target*0.5;
    let v=target+(rng()-0.5)*2*variance;
    if(ANOMALY.key===key&&!isPrivate){
      const d=Math.abs(i/N-ANOMALY.at);
      if(d<0.04)v*=ANOMALY.factor-(d/0.04)*(ANOMALY.factor-1);
    }
    pts.push(Math.max(0,Math.round(v*1000)/1000));
  }
  const impact=CC.simImpact();
  if(impact&&impact.regionKeys.includes(key)){
    pts[N-1]=Math.round((impact.defense?PUBLIC_LOSS*2:PUBLIC_LOSS*4)*1000)/1000;
  } else if(attachedNow){
    pts[N-1]=Math.max(0,Math.round((PRIVATE_LOSS+(rng()-0.5)*0.01)*1000)/1000);
  } else {
    pts[N-1]=PUBLIC_LOSS;
  }
  return pts;
}
function throughputSeries(key,N){
  const item=regionList().find(x=>x.key===key); if(!item)return [];
  const rng=mulberry32(hashStr('tp:'+key));
  const attached=item.region.attached;
  const base=attached?(2.5+rng()*2.5):(0.4+rng()*1.2);
  const pts=[];
  for(let i=0;i<N;i++){
    const diurnal=Math.sin((i/N)*6.28*(N>30?7:1)-1.4)*0.35+1;
    pts.push(Math.max(0.05,Math.round(base*diurnal*(0.9+rng()*0.2)*100)/100));
  }
  const impact=CC.simImpact();
  if(impact&&impact.regionKeys.includes(key)){pts[N-1]=impact.defense?Math.round(pts[N-1]*0.4*100)/100:0;}
  return pts;
}
function egressSeries(N){
  const rng=mulberry32(hashStr('egress'));
  const e=CC.egress();
  const pub0=29900/30,priv0=18300/30;            // discovered split, per day
  const pubNow=e.pub/30,privNow=e.priv/30;       // current split
  const shiftAt=Math.floor(N*0.8);
  const pts=[];
  for(let i=0;i<N;i++){
    const late=i>=shiftAt;
    const pub=(late?pubNow:pub0)*(0.86+rng()*0.28);
    const priv=(late?privNow:priv0)*(0.9+rng()*0.2);
    pts.push({pub:Math.round(pub),priv:Math.round(priv)});
  }
  return pts;
}
function telemetry(N){
  return {
    regions:regionList().map(x=>({key:x.key,name:x.region.name,cloudName:x.cloud.name,color:x.cloud.color,
      attached:x.region.attached,lat:x.region.lat,ai:x.region.ai,
      latency:latencySeries(x.key,N),throughput:throughputSeries(x.key,N),loss:lossSeries(x.key,N)})),
    egress:egressSeries(N),
    anomaly:ANOMALY,
    events:_.hist.map(h=>({label:h.label,posture:h.posture})),
  };
}
/* AI narrative over the telemetry - regenerated from state every time */
function obsSummary(){
  const c=CC.counts();
  const rl=regionList();
  const att=rl.filter(x=>x.region.attached);
  const pub=rl.filter(x=>!x.region.attached);
  const worst=pub.slice().sort((a,b)=>b.region.lat-a.region.lat)[0];
  const e=CC.egress();
  const impact=CC.simImpact();
  const parts=[];
  if(impact){
    parts.push(`<b>Active incident (simulated):</b> ${impact.onramp.name} is down — ${impact.vpcIds.length} VPCs ${impact.defense?'failed over to public transit and are running degraded with no SLA':'are blackholed with Dynamic Defense off'}. Latency on the affected paths is spiking in the charts below.`);
  }
  parts.push(`${att.length} of ${rl.length} regions ride the private envelope (~${PRIVATE_LAT}ms, low variance). ${pub.length?`${pub.length} still depend on public transit${worst?` — <b>${worst.region.name}</b> is the outlier at ${worst.region.lat}ms P95`:''}.`:'Nothing depends on public transit.'}`);
  parts.push(`Egress is running ${'$'+(e.total/1000).toFixed(1)}k/mo${e.pub?` with ${'$'+(e.pub/1000).toFixed(1)}k still on public rates`:' — fully on committed private pricing'}${e.savings?`; private-path savings hold at ${'$'+(e.savings/1000).toFixed(1)}k/mo`:''}.`);
  const euw=regions.aws.find(r=>r.id==='euw1');
  parts.push(`One anomaly in the window: a transit-congestion spike on eu-west-1${euw.attached?' — before it attached; the private path is immune to that event class':' — it remains exposed to that event class until attached'}.`);
  return parts.join(' ');
}

/* drill-down stats over a region's live series */
function percentiles(arr){
  const s=arr.slice().sort((a,b)=>a-b);
  const q=p=>s[Math.min(s.length-1,Math.floor(p*s.length))];
  return {p50:q(.5),p95:q(.95),p99:q(.99)};
}
function topTalkers(rid){
  const rng=mulberry32(hashStr('tt:'+rid));
  const vs=vpcs[rid]||[];
  const svc=['api-gw','etl-batch','inference','replication','telemetry','cdn-origin'];
  return vs.flatMap(v=>[0,1].map(()=>({
    name:`${v.name}/${svc[Math.floor(rng()*svc.length)]}`,
    gb:Math.round((rng()*420+40)),
    pct:0
  }))).sort((a,b)=>b.gb-a.gb).slice(0,5).map((t,i,all)=>{
    const tot=all.reduce((s,x)=>s+x.gb,0);t.pct=Math.round(t.gb/tot*100);return t;
  });
}

Object.assign(CC,{telemetry,obsSummary,latencySeries,lossSeries,percentiles,topTalkers});

/* tokens get a time dimension: spend/day per app (flat zero before the
   substrate exists, ramping once it does) and per-model inference latency
   derived from the same region latencies everything else uses.

   The TAIL is always today's live meter, ready or not. An identity whose
   endpoint has never been attached has no charted history - it started
   metering today - but it is not at zero, and this series used to say it
   was: all-zero points fired /ai/observe's "No token flow yet" empty state
   directly under a TOKENS tile reading the same meter. History it does not
   have, and today it does. */
CC.tokenSeries=function(tag,N){
  const rng=_.mulberry32(_.hashStr('tok:'+tag));
  const m=CC.tokenMeterList().find(x=>x.tag===tag);
  const budget=CC.tokenBudgetOf?CC.tokenBudgetOf(tag):1000000;
  const pts=[];
  for(let i=0;i<N;i++){
    if(!m||!m.ready){pts.push(0);continue;}
    const ramp=Math.min(1,(i/(N-1))*1.6); // adoption ramps
    pts.push(Math.round(budget*0.55*ramp*(0.75+rng()*0.5)));
  }
  if(m&&N>0)pts[N-1]=m.today;
  return pts;
};
CC.modelLatencySeries=function(modelId,N){
  const rng=_.mulberry32(_.hashStr('mlat:'+modelId));
  const m=CC.modelCatalog().find(x=>x.id===modelId);
  const pts=[];
  for(let i=0;i<N;i++)pts.push(Math.max(6,Math.round(m.p50*(0.85+rng()*0.4))));
  pts[N-1]=m.p50;
  return pts;
};
})(window.CC);
