// @ts-nocheck
/* Standing intents - declared outcomes with a scope, a mode, and a status
   the engine re-derives on every read.

   Laws, same as every sibling module:
   - Stored: {id, key, scope, mode, declaredAt, baseline}. Baseline is a
     record of a past fact (what the meter read at declaration), like
     sessionAttached - never a cached derivation.
   - Derived per read: status (aligned | drifting | violated), evidence,
     the compiled repair moves, and watch counts. Nothing stores a status.
   - Mutations push undo BEFORE mutating, emit, and audit.
   - The machine never commits estate moves: enforce mode applies standing
     CONTROLS (a policy flag) only; repairs are moves for the twin's tray.
   - The catalog is the honesty boundary: an intent the engine cannot
     evaluate does not exist here. */
(function(){
const CC=window.CC;
const _=CC._||(CC._={});

const intents=_.intents=_.intents||[];
let intentSeq=0;

/* ---------- helpers over existing derivations only ---------- */

const flows=()=>CC.routeFlows();
const regions=()=>CC.fabricModel().regions;

/** Flows off the AT&T path that have a controlled path available - the one
 *  steer opportunity shape routeAdvisor() and the twin both price. */
function steerables(flowId){
  return flows()
    .filter(f=>!f.current.attControlled)
    .filter(f=>!flowId||f.id===flowId)
    .map(f=>({f,att:f.paths.find(p=>p.attControlled&&p.available)}))
    .filter(x=>x.att);
}

function meterOf(tag){return CC.tokenMeterList().find(m=>m.tag===tag)||null;}

/* ---------- the catalog ---------- */
/* Each entry: scopes() the intent may bind to, evaluate() -> a reading,
   both reading ONLY existing getters. `enforceControl` is the standing
   control enforce mode applies (and undo restores). */
const CATALOG=[
  {
    key:'minimize-latency',
    label:'Minimize latency',
    taxonomy:'Performance',
    scopes(){
      return [
        ...regions().map(r=>({kind:'region',id:r.regionId,label:`${r.cloudName} ${r.name}`})),
        ...flows().map(f=>({kind:'flow',id:f.id,label:f.label})),
      ];
    },
    evaluate(scope){
      if(scope.kind==='region'){
        const r=regions().find(x=>x.regionId===scope.id);
        if(!r)return null;
        const L=CC.regionLatency(r.regionId);
        return r.path==='private'
          ? {status:'aligned',evidence:`${r.name} rides the fabric at ${L.privateMs}ms.`,moves:[]}
          : {status:'violated',
             evidence:`${r.name} rides public transit at ${L.publicMs}ms; the fabric path is ${L.privateMs}ms.`,
             moves:[{kind:'attach',regionId:r.regionId}]};
      }
      const f=flows().find(x=>x.id===scope.id);
      if(!f)return null;
      const att=f.paths.find(p=>p.attControlled&&p.available);
      if(f.current.attControlled)
        return {status:'aligned',evidence:`${f.label} is on ${f.current.label} at ${Math.round(f.current.latencyMs||0)}ms.`,moves:[]};
      return att
        ? {status:'violated',
           evidence:`${f.label} crosses the public internet at ${Math.round(f.current.latencyMs||0)}ms with an AT&T path available.`,
           moves:[{kind:'steer',flowId:f.id,pathId:att.id}]}
        : {status:'violated',
           evidence:`${f.label} crosses the public internet and no AT&T path exists yet - attach its regions first.`,
           moves:[]};
    },
  },
  {
    key:'path-diversity',
    label:'Keep this flow diverse',
    taxonomy:'Resiliency',
    scopes(){return flows().map(f=>({kind:'flow',id:f.id,label:f.label}));},
    evaluate(scope){
      const f=flows().find(x=>x.id===scope.id);
      if(!f)return null;
      if(f.diverse){
        /* Drifting when a failure simulation currently holds one of the
           paths down - diversity is present but being leaned on. */
        const sim=CC.sim&&CC.sim.onrampId;
        return sim
          ? {status:'drifting',evidence:`${f.label} is diverse, but a failure simulation is holding ${sim} down right now.`,moves:[]}
          : {status:'aligned',evidence:`${f.label} has two independent paths.`,moves:[]};
      }
      /* The repair is a second on-ramp. Regions grow dual reliability when
         more than one capturing on-ramp is active; attaching the region
         activates its capturing ramps. If the topology carries no second
         ramp, the boundary is stated instead of invented. */
      const ends=regions().filter(r=>r.onrampIds.length>1&&r.reliability!=='dual');
      const end=ends[0];
      return end
        ? {status:'violated',
           evidence:`${f.label} has a single path; ${end.name} can carry a second on-ramp.`,
           moves:[{kind:'attach',regionId:end.regionId}]}
        : {status:'violated',
           evidence:`${f.label} has a single path and the current topology offers no second on-ramp for it.`,
           moves:[]};
    },
  },
  {
    key:'route-by-cost',
    label:'Route by cost',
    taxonomy:'Application-aware routing',
    scopes(){
      return [{kind:'estate',id:null,label:'Every flow'},
        ...flows().map(f=>({kind:'flow',id:f.id,label:f.label}))];
    },
    evaluate(scope){
      const opps=steerables(scope.kind==='flow'?scope.id:null);
      if(!opps.length)
        return {status:'aligned',
          evidence:scope.kind==='flow'
            ?'This flow already rides its cheapest controlled path.'
            :'No flow has a cheaper AT&T path left to steer to.',
          moves:[]};
      const gbps=Math.round(opps.reduce((s,x)=>s+x.f.gbps,0)*10)/10;
      return {status:'violated',
        evidence:`${opps.length} flow${opps.length===1?'':'s'} (${gbps} Gbps) pay public egress with an AT&T path available.`,
        moves:opps.map(x=>({kind:'steer',flowId:x.f.id,pathId:x.att.id}))};
    },
  },
  {
    key:'data-sensitivity',
    label:'Route by data sensitivity',
    taxonomy:'Security and compliance',
    /* The tags whose violations() rows map to a one-fix repair. The tag IS
       the sensitivity class - see TAGS in state.ts. */
    scopes(){
      return [
        {kind:'tag',id:'classified-helion',label:'classified-helion'},
        {kind:'tag',id:'finance-invoices',label:'finance-invoices'},
        {kind:'tag',id:'rd-helion',label:'rd-helion'},
      ];
    },
    evaluate(scope){
      const FIX={'classified-helion':'fwInspection','finance-invoices':'isolateFinance','rd-helion':'segmentHelion'};
      const v=CC.violations().filter(x=>x.tag===scope.id);
      if(!v.length)
        return {status:'aligned',evidence:`Every ${scope.id} path satisfies its policy.`,moves:[]};
      const fixKey=FIX[scope.id];
      return {status:'violated',
        evidence:`${scope.id}: ${v[0].msg}${v.length>1?` (and ${v.length-1} more)`:''}.`,
        moves:fixKey&&!CC.fixes[fixKey]?[{kind:'fix',fixKey}]:[]};
    },
  },
  {
    key:'private-inference',
    label:'Keep AI inference off the public internet',
    taxonomy:'AI and workload',
    scopes(){return [{kind:'estate',id:'ai',label:'The token layer'}];},
    evaluate(scope,intent){
      const meters=CC.tokenMeterList();
      const routes=CC.modelRoutes();
      const publicTags=routes.filter(r=>r.path==='public').map(r=>r.tag);
      const ungoverned=meters.reduce((s,m)=>s+m.ungoverned,0);
      if(publicTags.length){
        /* Repair: attach the regions the self-hosted endpoints sit behind,
           and guardrail the identity that calls externally. */
        const moves=[];
        const cw=regions().find(r=>r.regionId==='cwe');
        const nb=regions().find(r=>r.regionId==='nbe');
        if(cw&&!cw.attached)moves.push({kind:'attach',regionId:'cwe'});
        if(nb&&!nb.attached)moves.push({kind:'attach',regionId:'nbe'});
        const ss=CC.tokenPolicy('shared-services');
        if(ss&&!ss.guardrail)moves.push({kind:'policy',tag:'shared-services',patch:{guardrail:true}});
        return {status:'violated',
          evidence:`${publicTags.length} of ${routes.length} identities route over the public internet (${publicTags.join(', ')}).`,
          moves};
      }
      const grew=intent&&intent.baseline&&ungoverned>intent.baseline.ungoverned;
      return grew
        ? {status:'drifting',
           evidence:`Every route is governed now, but ungoverned spend grew since declaration - history does not launder.`,
           moves:[]}
        : {status:'aligned',evidence:'Every identity routes to a governed endpoint.',moves:[]};
    },
  },
  {
    key:'cap-token-spend',
    label:'Cap token spend',
    taxonomy:'AI and workload',
    scopes(){return CC.tokenMeterList().map(m=>({kind:'identity',id:m.tag,label:m.tag}));},
    enforceControl(scope,on){
      /* The standing control: the policy's enforced flag. promptTrace's
         budget gate (state-console.ts) reads it together with this intent's
         mode - watch mode never gates. */
      CC.setTokenPolicy(scope.id,{enforced:!!on});
    },
    evaluate(scope,intent){
      const m=meterOf(scope.id);
      if(!m)return null;
      const reading=
        m.pct>=100
          ? {status:'violated',evidence:`${scope.id} stands at ${m.pct}% of its ${m.budget.toLocaleString()}-token budget.`,
             moves:[{kind:'policy',tag:scope.id,patch:{enforced:true}}]}
          : m.pct>=80
            ? {status:'drifting',evidence:`${scope.id} is at ${m.pct}% of budget - the ceiling is close.`,moves:[]}
            : {status:'aligned',evidence:`${scope.id} is at ${m.pct}% of its budget.`,moves:[]};
      if(intent&&intent.mode==='watch'&&m.pct>=100){
        const would=CC.decisionLog().filter(d=>d.tag===scope.id&&d.allowed&&d.ts>=intent.declaredAt).length;
        reading.watch={events:would,
          note:`${would} request${would===1?'':'s'} rode through over budget - enforce mode would have denied them.`};
      }
      return reading;
    },
  },
];

/* ---------- API ---------- */

CC.intentCatalog=function(){
  return CATALOG.map(c=>({key:c.key,label:c.label,taxonomy:c.taxonomy,scopes:()=>c.scopes()}));
};

function entryOf(key){return CATALOG.find(c=>c.key===key)||null;}

function readingFor(intent){
  const entry=entryOf(intent.key);
  const r=entry?entry.evaluate(intent.scope,intent):null;
  if(!r)return {status:'violated',evidence:'The engine no longer carries this scope.',moves:[],watch:null};
  if(!('watch'in r))r.watch=null;
  return r;
}

/* `silent` is hydrate's flag, like activateOnramp's: a replayed session is
   not an edit, so it pushes no undo entry and emits nothing. */
CC.declareIntent=function(key,scope,mode,silent){
  const entry=entryOf(key);
  if(!entry)return null;
  const valid=entry.scopes().some(s=>s.kind===scope.kind&&s.id===scope.id);
  if(!valid)return null;
  if(intents.some(i=>i.key===key&&i.scope.kind===scope.kind&&i.scope.id===scope.id))return null;
  if(!silent)_.pushUndo('Declare intent '+entry.label);
  const meters=CC.tokenMeterList();
  const it={
    id:'int-'+(++intentSeq),
    key,scope:{...scope},mode:mode==='enforce'?'enforce':'watch',
    declaredAt:Date.now(),
    /* Past facts recorded at the only moment they are knowable. */
    baseline:{ungoverned:meters.reduce((s,m)=>s+m.ungoverned,0)},
  };
  intents.push(it);
  if(it.mode==='enforce'&&entry.enforceControl)entry.enforceControl(it.scope,true);
  if(!silent)CC._.emit({type:'policy',label:`Intent declared · ${entry.label} · ${scope.label}`});
  return {...it};
};

CC.removeIntent=function(id){
  const i=intents.findIndex(x=>x.id===id);
  if(i<0)return false;
  const it=intents[i];
  _.pushUndo('Remove intent '+(entryOf(it.key)||{label:it.key}).label);
  intents.splice(i,1);
  CC._.emit({type:'policy',label:`Intent removed · ${it.scope.label}`});
  return true;
};

CC.setIntentMode=function(id,mode){
  const it=intents.find(x=>x.id===id);
  if(!it||!['watch','enforce'].includes(mode)||it.mode===mode)return false;
  const entry=entryOf(it.key);
  _.pushUndo(`Intent ${mode==='enforce'?'enforce':'watch'} · ${it.scope.label}`);
  it.mode=mode;
  if(entry&&entry.enforceControl)entry.enforceControl(it.scope,mode==='enforce');
  CC._.emit({type:'policy',label:`Intent ${mode} mode · ${it.scope.label}`});
  return true;
};

CC.intentList=function(){
  return intents.map(it=>({...it,scope:{...it.scope},reading:readingFor(it)}));
};

/* Is an enforce-mode cap declared for this tag? state-console's budget gate
   asks; kept here so the predicate has one home. */
CC.intentCapEnforced=function(tag){
  return intents.some(i=>i.key==='cap-token-spend'&&i.mode==='enforce'&&i.scope.id===tag);
};
})();
