// @ts-nocheck
/* Console operations - the levers Configuration and AI Fabric imply.
   Rescan that actually discovers, circuit ordering with a provisioning
   lifecycle, a living tag taxonomy, alert thresholds, editable token
   policies, a model catalog, agents, and a prompt trace that walks a
   request through every layer this portal governs. */
(function(){
const CC=window.CC;
const _=CC._||(CC._={});

/* ---------- rescan: discovery that can FIND something ----------
   gcp hides an undiscovered VPC; the first rescan surfaces it and the
   whole portal ripples - counts, flows, apps, treemap, addressing. */
const HIDDEN={
  gcp:{regionId:'usc1',vpc:{id:'vpcml',name:'vpc-ml-suite',cidr:'10.19.0.0/16',azs:1,subnets:3,attached:false,role:'ML pipelines',tags:['rd-helion'],cloudTags:{Project:'xyz',Env:'prod',Owner:'ml',Region:'west'}}},
};
const lastScan={};
CC.rescanAccount=function(cloudId){
  lastScan[cloudId]=Date.now();
  const h=HIDDEN[cloudId];
  let found=null;
  if(h&&!CC.vpcs[h.regionId].some(v=>v.id===h.vpc.id)){
    CC.vpcs[h.regionId].push({...h.vpc});
    const r=CC.regions[cloudId].find(x=>x.id===h.regionId);
    if(r)r.subnets+=h.vpc.subnets;
    found=h.vpc.name;
  }
  CC._.emit({type:'policy',label:found
    ?`Rescan ${cloudId.toUpperCase()} · discovered ${found} (+${h.vpc.subnets*3} workloads)`
    :`Rescan ${cloudId.toUpperCase()} · no drift`});
  return found;
};
CC.lastScanOf=function(cloudId){return lastScan[cloudId]||null;};

/* ---------- circuit ordering: a provisioning lifecycle ---------- */
let orderSeq=0;
CC.orderCircuit=function({site,type,targets}){
  const o={id:'ord-'+(++orderSeq),name:`${type} · ${site}`,type,
    sub:`${site} · 10Gbps · provisioning`,ic:type.includes('NetBond')?'nb':type.includes('Express')?'er':'dx',
    active:false,planned:true,provisioning:true,
    site:{name:site,lat:32.9,lon:-97.0},
    targets:targets&&targets.length?targets:[['gcp','usc1']]};
  CC.onramps.push(o);
  CC._.emit({type:'policy',label:'Circuit ordered · '+o.name});
  // provisioning completes after a beat - then it is attachable capacity
  setTimeout(()=>{
    o.provisioning=false;o.planned=false;
    o.sub=o.sub.replace(' · provisioning',' · ready to attach');
    CC._.emit({type:'policy',label:'Circuit provisioned · '+o.name});
  },8000);
  return o;
};

/* ---------- living taxonomy ---------- */
CC.addTag=function({label,hex,desc}){
  if(!label||CC.TAGS[label])return null;
  CC.TAGS[label]={label,color:hex,hex:hex||'#9aa6bd',desc:desc||''};
  CC._.emit({type:'policy',label:'Tag created · '+label});
  return CC.TAGS[label];
};

/* ---------- alert thresholds ---------- */
CC.alerts={egressMax:null,latencyMax:null};
CC.setAlert=function(kind,value){
  CC.alerts[kind]=value;
  CC._.emit({type:'policy',label:value?`Alert set · ${kind} ${kind==='egressMax'?'$'+value:value+'ms'}`:'Alert cleared · '+kind});
  checkAlerts();
};
let alerted={};
function checkAlerts(){
  const e=CC.egress();
  if(CC.alerts.egressMax&&e.pub>CC.alerts.egressMax&&!alerted.egress){
    alerted.egress=true;
    CC._.emit({type:'sim',label:`ALERT · public egress $${e.pub.toLocaleString()} exceeds the $${CC.alerts.egressMax.toLocaleString()} threshold`});
  }
  if(CC.alerts.egressMax&&e.pub<=CC.alerts.egressMax)alerted.egress=false;
}
CC.subscribe((ev)=>{if(ev&&ev.type==='hits')return;checkAlerts();});

/* ---------- token policies: editable, enforceable ----------
   A policy may carry an optional `group` naming a group id — the same
   grouping vocabulary Govern policy uses reaching the token layer. The
   policy stores ONLY the id; resolution happens at render via
   CC.resolveGroup, derived and never stored, same as every other surface.
   The scope string is descriptive, like the tag-scoped seeds — no new
   enforcement semantics ride on `group`. */
const tokenPolicies=_.tokenPolicies={
  'rd-helion':{scope:'self-hosted',budget:2400000,guardrail:false,enforced:false},
  'classified-helion':{scope:'no-external',budget:900000,guardrail:true,enforced:false},
  'shared-services':{scope:'external-allowed',budget:1600000,guardrail:false,enforced:false},
  'west-workloads':{group:'west-workloads',scope:'private-only',budget:1200000,guardrail:true,enforced:false},
};
CC.tokenPolicy=function(tag){return tokenPolicies[tag]||null;};
CC.tokenPolicyList=function(){return Object.entries(tokenPolicies).map(([tag,p])=>({tag,...p}));};
CC.setTokenPolicy=function(tag,patch){
  const p=tokenPolicies[tag]||(tokenPolicies[tag]={scope:'external-allowed',budget:1000000,guardrail:false,enforced:false});
  Object.assign(p,patch);
  CC._.emit({type:'policy',label:`Token policy ${patch.enforced?'enforced':'updated'} · ${tag}`});
};
CC.tokenBudgetOf=function(tag){return tokenPolicies[tag]?tokenPolicies[tag].budget:1000000;};

/* ---------- model catalog: latency + price derive from the model ----------
   A self-hosted model's P50 is compute + the network it sits behind. COMPUTE_MS
   is a per-model seed (what the GPU takes; no path changes it); the network term
   is CC.regionLatency for the endpoint's region — `privateMs` once that region
   is on the fabric, `publicMs` while it is not. This used to read a flat `14`
   when attached and the raw seed `region.lat` when not, so the P50 column
   quoted a CoreWeave latency no other screen in the product showed. */
const COMPUTE_MS={'helion-70b':11,'helion-cls-13b':13};
CC.modelCatalog=function(){
  const cw=CC.regions.cw.find(r=>r.id==='cwe'), nb=CC.regions.neb.find(r=>r.id==='nbe');
  const net=(rid,attached)=>{const L=CC.regionLatency(rid);return attached?L.privateMs:L.publicMs;};
  return [
    {id:'helion-70b',name:'helion-70b',kind:'self-hosted · H100',endpoint:'CoreWeave',cloud:'cw',
      p50:COMPUTE_MS['helion-70b']+net('cwe',cw.attached),price:0.9,ready:cw.attached},
    {id:'helion-cls-13b',name:'helion-cls-13b',kind:'air-gapped · L40S',endpoint:'Nebius',cloud:'neb',
      p50:COMPUTE_MS['helion-cls-13b']+net('nbe',nb.attached),price:0.4,ready:nb.attached},
    {id:'gpt-class',name:'GPT-class (external)',kind:'managed API',endpoint:'OpenAI',cloud:null,
      p50:38,price:5.0,ready:CC.onramps.find(o=>o.id==='nb2').active},
  ];
};

/* ---------- agents: identities that act ---------- */
const agents=[
  {id:'ops-copilot',name:'ops-copilot',app:'shared-services',scopes:['read:telemetry','invoke:gpt-class'],enabled:true},
  {id:'helion-tuner',name:'helion-tuner',app:'rd-helion',scopes:['invoke:helion-70b','write:experiments'],enabled:true},
  {id:'cls-redactor',name:'cls-redactor',app:'classified-helion',scopes:['invoke:helion-cls-13b'],enabled:true},
];
CC.agentList=function(){return agents.slice();};
CC.toggleAgent=function(id){
  const a=agents.find(x=>x.id===id);
  if(!a)return false;
  a.enabled=!a.enabled;
  CC._.emit({type:'policy',label:`Agent ${a.enabled?'enabled':'SUSPENDED'} · ${a.name}`});
  return true;
};


/* ---------- agents ACT ----------
   Enabled agents issue traced requests on their own cadence - metered,
   visible in the event stream, and DENIED live when a token policy
   tightens. Suspend one and its traffic stops. Zero trust you can
   watch. */
const AGENT_MODEL={'ops-copilot':'gpt-class','helion-tuner':'helion-70b','cls-redactor':'helion-cls-13b'};
let agentIdx=0;
function agentTick(){
  const active=agents.filter(a=>a.enabled);
  if(!active.length)return;
  const a=active[agentIdx++%active.length];
  const res=CC.promptTrace(a.app,AGENT_MODEL[a.id],'autonomous task · '+a.scopes[0]);
  a.last={ts:Date.now(),blocked:res.blocked,tokens:res.tokens,model:AGENT_MODEL[a.id]};
  CC._.emit({type:'hits',agent:{name:a.name,app:a.app,blocked:res.blocked,tokens:res.tokens,model:AGENT_MODEL[a.id]}});
}
setInterval(agentTick,7000);

/* ---------- the prompt trace: one request through every layer ---------- */
/* governance outcomes over time - every traced request records one */
const decisions=[];
CC.decisionLog=function(){return decisions.slice();};
function recordDecision(allowed,guarded){
  decisions.push({ts:Date.now(),allowed,guarded:!!guarded});
  if(decisions.length>400)decisions.shift();
}
CC.promptTrace=function(tag,modelId,prompt){
  const pol=tokenPolicies[tag];
  const model=CC.modelCatalog().find(m=>m.id===modelId);
  const tokens=Math.max(40,Math.round((prompt||'').length*1.4))+120;
  const steps=[];
  steps.push({hop:'Workload',detail:`${tag} app issues the request`,ok:true});
  // token policy gate
  if(pol){
    const externalModel=modelId==='gpt-class';
    if(pol.scope==='no-external'&&externalModel)
      {recordDecision(false);return {blocked:true,steps:[...steps,{hop:'Token policy',detail:`${tag}: no external models — request DENIED`,ok:false}],tokens:0};}
    if(pol.scope==='self-hosted'&&externalModel)
      {recordDecision(false);return {blocked:true,steps:[...steps,{hop:'Token policy',detail:`${tag}: model allowlist is self-hosted only — request DENIED`,ok:false}],tokens:0};}
    steps.push({hop:'Token policy',detail:`${pol.scope}${pol.enforced?' · enforced':' · draft'} — allowed`,ok:true});
  } else steps.push({hop:'Token policy',detail:'no policy for this tag — default allow',ok:true});
  // route + path
  steps.push({hop:'Model route',detail:`${model.name} @ ${model.endpoint}`,ok:true});
  // resolver DNS firewall — the egress control that screens for tunneling
  const dnsOk=CC.fixes.dnsFirewall;
  steps.push({hop:'DNS resolution',detail:dnsOk?'resolver DNS firewall · query screened, no tunneling':'no resolver firewall · DNS egress unscreened',ok:dnsOk,warn:!dnsOk});
  const priv=model.ready;
  steps.push({hop:'Network path',detail:priv?'AT&T private fabric · SLA-backed':'public internet · no SLA',ok:priv,warn:!priv});
  // guardrail
  if(pol&&pol.guardrail)steps.push({hop:'Guardrail',detail:'ai-guardrail inline · prompt + completion scanned',ok:true});
  steps.push({hop:'Completion',detail:`${tokens.toLocaleString()} tokens · $${(tokens/1e6*model.price).toFixed(4)} @ $${model.price}/1M · ~${model.p50}ms P50`,ok:true});
  /* Meter the spend into the bucket THIS trace just walked. `priv` is the
     same value the Network path hop above prints, so the trace a viewer
     reads and the meter a viewer reads can never describe one request as
     both governed and public. */
  CC.meterTokens&&CC.meterTokens(tag,tokens,priv);
  recordDecision(true,pol&&pol.guardrail);
  return {blocked:false,steps,tokens};
};
})();
