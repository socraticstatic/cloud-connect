// @ts-nocheck
/* Cloud Control - NaaS billing, the egress model, and token meters.
   The money layer: everything here is derived live from the substrate,
   so attaching a circuit grows the invoice a line and completing an AI
   endpoint's prerequisites starts its meters spending. */
(function(CC){
const _=CC._;
const {onramps,regions,fixes}=CC;

/* ---------------- token meters (act two becomes live) ----------------
   Once an AI endpoint's bytes-layer prerequisites are satisfied, its
   consuming apps start SPENDING: token meters tick with the same
   cadence as policy hits, proportional to inference traffic. The
   payoff is watchable - complete the substrate, watch the tokens flow. */
const tokenMeters={}; // appTag -> {today,budget}
const TOKEN_BUDGETS={'rd-helion':2400000,'classified-helion':900000,'shared-services':1600000};
// budgets become editable once the console module loads - read lazily
const budgetOf=tag=>CC.tokenBudgetOf?CC.tokenBudgetOf(tag):TOKEN_BUDGETS[tag];
CC.meterTokens=function(tag,n){
  const m=tokenMeters[tag]=tokenMeters[tag]||{today:0,budget:budgetOf(tag)};
  m.today+=n;
};
function endpointReadyFor(tag){
  if(tag==='rd-helion')return regions.cw.find(r=>r.id==='cwe').attached&&fixes.segmentHelion;
  if(tag==='classified-helion')return regions.neb.find(r=>r.id==='nbe').attached&&fixes.fwInspection;
  if(tag==='shared-services')return onramps.find(o=>o.id==='nb2').active;
  return false;
}
function tickTokens(rng){
  let any=false;
  Object.keys(TOKEN_BUDGETS).forEach(tag=>{
    if(!endpointReadyFor(tag))return;
    const m=tokenMeters[tag]=tokenMeters[tag]||{today:Math.round(budgetOf(tag)*0.22),budget:budgetOf(tag)};
    const gbps=CC.flows().filter(f=>f.srcTag===tag&&f.dst==='ai-endpoints').reduce((s,f)=>s+f.gbps,0);
    m.today+=Math.round(gbps*(900+rng()*700));
    any=true;
  });
  return any;
}
/* the rule engine's tickHits drives this on its own cadence */
_.tickTokens=tickTokens;
function tokenMeterList(){
  return Object.keys(TOKEN_BUDGETS).map(tag=>{
    const ready=endpointReadyFor(tag);
    const m=tokenMeters[tag];
    return {tag,ready,today:m?m.today:0,budget:budgetOf(tag),
      pct:m?Math.min(100,Math.round(m.today/budgetOf(tag)*100)):0};
  });
}
/* model routing: app -> model class -> endpoint -> path, all derived */
function modelRoutes(){
  const routes=[];
  const cwReady=regions.cw.find(r=>r.id==='cwe').attached;
  const nbReady=regions.neb.find(r=>r.id==='nbe').attached;
  const nb2=onramps.find(o=>o.id==='nb2').active;
  routes.push({app:'Project Helion · R&D',model:'helion-70b (self-hosted)',endpoint:'CoreWeave H100',cloud:'cw',
    path:cwReady?'private':'public',guardrail:fixes.segmentHelion?'segmented':null});
  routes.push({app:'Project Helion · Classified',model:'helion-cls-13b (air-gapped)',endpoint:'Nebius L40S',cloud:'neb',
    path:nbReady?'private':'public',guardrail:fixes.fwInspection?'inline guardrail':null});
  routes.push({app:'Shared Platform Services',model:'GPT-class (external)',endpoint:'OpenAI API',cloud:null,
    path:nb2?'governed egress':'public',guardrail:nb2?'metered':null});
  return routes;
}

/* ---------------- NaaS billing (the bill) ----------------
   As-a-service means a consumption invoice: circuit port fees for
   active on-ramps, egress at public vs committed rates, a monthly
   commit with burst above it. Derived live - attach a circuit and the
   invoice grows a line. */
const PORT_FEES={'NetBond':4200,'Direct Connect':3800,'ExpressRoute':3800,'NetBond Adv':5600};
const COMMIT=30000; // $/mo committed spend - committed-rate egress draws down against it
function billing(){
  const e=egress();
  const circuits=onramps.filter(o=>o.active).map(o=>({
    name:o.name,type:o.type,fee:PORT_FEES[o.type]||4000,
    utilization:o.id==='nb1'?utilization():Math.min(92,38+CC.activeOnramps()*9)}));
  const portTotal=circuits.reduce((s,c)=>s+c.fee,0);
  const lines=[
    ...circuits.map(c=>({item:`${c.name} · 10G port`,kind:'circuit',amount:c.fee,note:`${c.utilization}% utilized`})),
    {item:'Egress · committed private rate',kind:'usage',amount:e.priv,note:'draws against commit'},
    ...(e.pub?[{item:'Egress · public internet (uncommitted)',kind:'usage',amount:e.pub,note:'no SLA, market rate'}]:[]),
  ];
  const total=portTotal+e.priv+e.pub;
  const commitDraw=Math.min(COMMIT,portTotal+e.priv);
  return {lines,total,commit:COMMIT,commitDraw,
    commitPct:Math.min(100,Math.round(commitDraw/COMMIT*100)),
    burst:Math.max(0,portTotal+e.priv-COMMIT),
    uncommitted:e.pub,savings:e.savings,forecast:e.forecast};
}

/* Virtual ports - the on-demand consumption lens: each active on-ramp is a
   virtual port, spun up on demand, billed for what it carries. Derived from
   the same on-ramp + fee model the invoice uses, so it never disagrees. */
function virtualPorts(){
  const ports=onramps.filter(o=>o.active).map(o=>({
    name:o.name,type:o.type,capacityGbps:10,
    utilization:o.id==='nb1'?utilization():Math.min(92,38+CC.activeOnramps()*9),
    ratePerMo:PORT_FEES[o.type]||4000,
  }));
  const e=egress();
  return {ports,active:ports.length,
    consumptionMo:ports.reduce((s,p)=>s+p.ratePerMo,0)+e.priv+e.pub};
}

/* Egress model - $/mo buckets that shift public -> private as paths attach */
function egress(){
  const buckets=[
    {k:'gpu',amt:11400,priv:()=>onramps.find(o=>o.id==='nb2').active},
    {k:'aws-west-eu',amt:9500,priv:()=>onramps.find(o=>o.id==='dx1').active},
    {k:'azure',amt:6000,priv:()=>onramps.find(o=>o.id==='er1').active},
    {k:'misc',amt:3000,priv:()=>fixes.shiftAws},
    {k:'base-private',amt:18300,priv:()=>true},
  ];
  let pub=0,priv=0;
  buckets.forEach(b=>{if(b.priv())priv+=b.amt;else pub+=b.amt;});
  // private paths carry committed pricing - 15% under public rates
  const savings=Math.round((priv-18300)*0.15);
  return {total:pub+priv-savings,pub,priv:priv-savings,savings,
    forecast:pub>20000?'+9%':pub>6000?'+3%':'-4%'};
}
function utilization(){return fixes.shiftAws?85:60;}

Object.assign(CC,{billing,tokenMeterList,modelRoutes,egress,utilization,virtualPorts});
})(window.CC);
