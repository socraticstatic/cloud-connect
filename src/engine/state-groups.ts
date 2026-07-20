// @ts-nocheck
/* Cloud Control - groups.

   A group is one named set of estate objects, defined two ways at once:
   literal `members` (ids you picked) unioned with `predicates` (queries that
   re-evaluate as the estate changes). Policies reference the group name; the
   resolver turns it back into concrete objects at call time.

   Resolution is never stored. A group's membership is always derived, so a
   workload tagged tomorrow is in the group tomorrow. */
(function(){
const CC=window.CC;

const groups={
  'west-branches':{id:'west-branches',label:'West branches',kind:'site',
    members:['br-sjc','br-sfo','br-bkl'],predicates:[],
    desc:'Bay Area premises'},
  'west-workloads':{id:'west-workloads',label:'West workloads',kind:'workload',
    members:[],predicates:[{source:'cloudTag',key:'Project',values:['xyz','abc']}],
    desc:'Anything tagged Project=xyz or Project=abc'},
};

function allVpcs(){
  return Object.values(CC.vpcs||{}).reduce(function(a,list){return a.concat(list);},[]);
}

/* One predicate vocabulary, two estates. `tags` is the AT&T governance
   taxonomy; `cloudTags` is the hyperscaler key/value map. Never conflate
   them - a governanceTag predicate reads tags, a cloudTag predicate reads
   cloudTags, and branches (which carry no tags) match only the latter. */
function matchesPredicate(v,p){
  if(p.source==='governanceTag')return (v.tags||[]).some(function(t){return p.values.indexOf(t)>=0;});
  if(p.source==='cloudTag'){
    const val=(v.cloudTags||{})[p.key];
    return val!=null&&p.values.indexOf(val)>=0;
  }
  return false;
}

function copyGroup(g){
  return {id:g.id,label:g.label,kind:g.kind,desc:g.desc,custom:g.custom,
    members:(g.members||[]).slice(),
    predicates:(g.predicates||[]).map(function(p){return {...p,values:(p.values||[]).slice()};})};
}

/* Derived at call time, never stored. Everything below reads the live
   estate on every call, so a workload tagged tomorrow is in the group
   tomorrow. Do not memoize any of it. */
function resolveGroup(id){
  const g=groups[id];
  if(!g)return {vpcIds:[],branchIds:[],cidrs:[],count:0};

  const vpcs=allVpcs();
  const branches=CC.branches||[];
  const vpcById={},branchById={};
  vpcs.forEach(function(v){vpcById[v.id]=v;});
  branches.forEach(function(b){branchById[b.id]=b;});

  const vpcSet={},branchSet={};

  // Literal members are resolved against the real estate: an id naming
  // neither a branch nor a VPC is a typo, not a member, and must not count.
  (g.members||[]).forEach(function(m){
    if(branchById[m])branchSet[m]=1;
    else if(vpcById[m])vpcSet[m]=1;
  });

  (g.predicates||[]).forEach(function(p){
    vpcs.forEach(function(v){ if(matchesPredicate(v,p))vpcSet[v.id]=1; });
    branches.forEach(function(b){ if(matchesPredicate(b,p))branchSet[b.id]=1; });
  });

  const branchIds=Object.keys(branchSet);
  const vpcIds=Object.keys(vpcSet);

  const seen={},cidrs=[];
  function addCidr(c){ if(c&&!seen[c]){seen[c]=1;cidrs.push(c);} }
  branchIds.forEach(function(bid){ (branchById[bid].cidrs||[]).forEach(addCidr); });
  vpcIds.forEach(function(vid){ addCidr(vpcById[vid].cidr); });

  return {vpcIds:vpcIds,branchIds:branchIds,cidrs:cidrs,count:vpcIds.length+branchIds.length};
}

function groupList(){return Object.keys(groups).map(function(k){return copyGroup(groups[k]);});}

function groupsFor(objectId){
  return Object.keys(groups).filter(function(gid){
    const r=resolveGroup(gid);
    return r.vpcIds.indexOf(objectId)>=0||r.branchIds.indexOf(objectId)>=0;
  });
}

/* Every mutator snapshots BEFORE it mutates - same contract as
   activateOnramp and applyFix - so undo restores the prior group store
   rather than the one the caller just wrote. */
function addGroup(spec){
  if(!spec||!spec.id||groups[spec.id])return null;
  CC._.pushUndo&&CC._.pushUndo('Create group '+spec.id);
  groups[spec.id]={
    id:spec.id,label:spec.label||spec.id,kind:spec.kind||'mixed',
    members:(spec.members||[]).slice(),predicates:(spec.predicates||[]).slice(),
    desc:spec.desc||'',custom:true,
  };
  CC._.emit({type:'policy',label:'Group created · '+spec.id});
  return copyGroup(groups[spec.id]);
}

function updateGroup(id,patch){
  const g=groups[id];
  if(!g||!patch)return null;
  CC._.pushUndo&&CC._.pushUndo('Update group '+id);
  if(patch.members)g.members=patch.members.slice();
  if(patch.predicates)g.predicates=patch.predicates.slice();
  if(patch.label)g.label=patch.label;
  CC._.emit({type:'policy',label:'Group updated · '+id});
  return copyGroup(g);
}

function removeGroup(id){
  if(!groups[id])return false;
  CC._.pushUndo&&CC._.pushUndo('Remove group '+id);
  delete groups[id];
  CC._.emit({type:'policy',label:'Group removed · '+id});
  return true;
}

CC._.groups=groups;
Object.assign(CC,{groupList:groupList,addGroup:addGroup,updateGroup:updateGroup,
  removeGroup:removeGroup,resolveGroup:resolveGroup,groupsFor:groupsFor});
})();
