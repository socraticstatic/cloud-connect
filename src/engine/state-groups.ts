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

function matchesPredicate(v,p){
  if(p.source==='governanceTag')return (v.tags||[]).some(function(t){return p.values.indexOf(t)>=0;});
  if(p.source==='cloudTag'){
    const val=(v.cloudTags||{})[p.key];
    return val!=null&&p.values.indexOf(val)>=0;
  }
  return false;
}

function resolveGroup(id){
  const g=groups[id];
  if(!g)return {vpcIds:[],branchIds:[],cidrs:[],count:0};
  const vpcSet={},branchSet={},cidrs=[];

  (g.members||[]).forEach(function(m){
    if((CC.branches||[]).some(function(b){return b.id===m;}))branchSet[m]=1;
    else vpcSet[m]=1;
  });

  (g.predicates||[]).forEach(function(p){
    allVpcs().forEach(function(v){ if(matchesPredicate(v,p))vpcSet[v.id]=1; });
  });

  const branchIds=Object.keys(branchSet);
  const vpcIds=Object.keys(vpcSet);

  branchIds.forEach(function(bid){
    const b=(CC.branches||[]).find(function(x){return x.id===bid;});
    if(b)(b.cidrs||[]).forEach(function(c){cidrs.push(c);});
  });
  vpcIds.forEach(function(vid){
    const v=allVpcs().find(function(x){return x.id===vid;});
    if(v&&v.cidr)cidrs.push(v.cidr);
  });

  return {vpcIds:vpcIds,branchIds:branchIds,cidrs:cidrs,count:vpcIds.length+branchIds.length};
}

function groupList(){return Object.keys(groups).map(function(k){return groups[k];});}

function groupsFor(objectId){
  return Object.keys(groups).filter(function(gid){
    const r=resolveGroup(gid);
    return r.vpcIds.indexOf(objectId)>=0||r.branchIds.indexOf(objectId)>=0;
  });
}

function addGroup(spec){
  if(!spec||!spec.id||groups[spec.id])return null;
  groups[spec.id]={
    id:spec.id,label:spec.label||spec.id,kind:spec.kind||'mixed',
    members:spec.members||[],predicates:spec.predicates||[],desc:spec.desc||'',
    custom:true,
  };
  CC._.pushUndo&&CC._.pushUndo('Create group '+spec.id);
  CC._.emit({type:'policy',label:'Group created · '+spec.id});
  return groups[spec.id];
}

function updateGroup(id,patch){
  const g=groups[id];
  if(!g||!patch)return null;
  if(patch.members)g.members=patch.members;
  if(patch.predicates)g.predicates=patch.predicates;
  if(patch.label)g.label=patch.label;
  CC._.emit({type:'policy',label:'Group updated · '+id});
  return g;
}

function removeGroup(id){
  if(!groups[id])return false;
  delete groups[id];
  CC._.emit({type:'policy',label:'Group removed · '+id});
  return true;
}

CC._.groups=groups;
Object.assign(CC,{groupList:groupList,addGroup:addGroup,updateGroup:updateGroup,
  removeGroup:removeGroup,resolveGroup:resolveGroup,groupsFor:groupsFor});
})();
