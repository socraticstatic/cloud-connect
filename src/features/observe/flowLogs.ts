import type { CloudControl } from '../../engine/types';

// Shape of a flows() row (src/engine/state-rules.ts, function flows()) —
// untyped at the source (// @ts-nocheck), so we mirror the fields this
// module consumes. Workload rows carry srcVpc/srcTag/srcCloud; branch
// ("site") rows carry srcBranch instead and no srcVpc — see the note above
// buildFlowLogs() for why those are excluded rather than mapped.
interface FlowRow {
  id: string;
  srcVpc?: string;
  srcName?: string;
  srcTag?: string | null;
  srcCloud?: string | null;
  srcBranch?: string;
  dst: string;
  gbps: number;
  viaPublic: boolean;
}

interface Region {
  id: string;
  attached?: boolean;
}

interface Vpc {
  id: string;
  name: string;
}

export interface FlowLogRecord {
  id: string;
  bucket: string;
  src: { kind: 'workload' | 'site'; label: string; cloudId: string; regionId: string; tag: string };
  dst: string;
  proto: 'TCP' | 'UDP';
  port: number;
  bytes: number;
  path: 'private' | 'public';
  action: 'allow' | 'deny';
  vsrx?: { zoneFrom: string; zoneTo: string; session: string };
}

/** Fixed five-tick trailing window every Observe surface reads off of. */
export const BUCKETS = ['T-04', 'T-03', 'T-02', 'T-01', 'T-00'] as const;

/** Per-bucket weight applied to gbps → bytes — deterministic, recognizably
 *  proportional to the flow's own weight rather than a flat multiplier. */
const WEIGHTS = [0.7, 0.85, 1, 0.9, 1.05];

export const DST_LABELS: Record<string, string> = {
  'ai-endpoints': 'AI endpoints',
  storage: 'Object storage',
  internet: 'SaaS / internet egress',
};

/* The estate's own no-internet policy tag: rule 'pol-fin' in
   state-rules.ts denies finance-invoices -> internet, and flows() DOES seed
   that exact shape (`tag==='finance-invoices' && !fixes.isolateFinance`
   drives a `mk('internet', ...)` row for vpc-data-02). No substitution was
   needed against the brief's fallback instructions — the estate's real
   no-internet-tagged flow already matches the literal 'finance-invoices'
   example the spec names. */
const DENY_TAG = 'finance-invoices';

/** Maps a workload id (srcVpc) to where it lives, built once per call by
 *  walking clouds -> regions[cloudId] -> vpcs[regionId] in the same order
 *  flows() itself walks — so this never has to guess a vpc's home. */
function buildVpcIndex(cc: CloudControl) {
  const index = new Map<string, { cloudId: string; regionId: string; vpcName: string }>();
  const clouds = (cc as unknown as { clouds: { id: string }[] }).clouds;
  const regionsByCloud = (cc as unknown as { regions: Record<string, Region[]> }).regions;
  const vpcsByRegion = (cc as unknown as { vpcs: Record<string, Vpc[]> }).vpcs;
  clouds.forEach(cl => {
    (regionsByCloud[cl.id] || []).forEach(r => {
      (vpcsByRegion[r.id] || []).forEach(v => {
        index.set(v.id, { cloudId: cl.id, regionId: r.id, vpcName: v.name });
      });
    });
  });
  return index;
}

/** ai-endpoints is always 443; storage is always 9093; internet alternates
 *  443/80 by bucket index — the only destination whose port cycles. */
function portFor(dst: string, bucketIndex: number): number {
  if (dst === 'storage') return 9093;
  if (dst === 'internet') return bucketIndex % 2 === 0 ? 443 : 80;
  return 443;
}

export function flowLogs(cc: CloudControl): FlowLogRecord[] {
  const rows = (cc as unknown as { flows(): FlowRow[] }).flows();
  const vpcIndex = buildVpcIndex(cc);
  const regionsByCloud = (cc as unknown as { regions: Record<string, Region[]> }).regions;

  const out: FlowLogRecord[] = [];

  rows.forEach((f, flowIndex) => {
    // flows() seeds branch rows, but every one is dst 'intra-tag'
    // (state-rules.ts:275) and intra-tag is skipped below — so no site
    // record exists TODAY. The kind union stays 'workload' | 'site' per
    // spec §1: when the engine ever states a branch -> destination fact,
    // site records join without a breaking type change. Until then this
    // filter on !f.srcVpc excludes every branch ("site")-originated row
    // (they carry srcBranch, no srcVpc — see flows()'s branch-append block
    // in state-rules.ts), keeping output honestly workload-only.
    if (!f.srcVpc) return;
    if (f.dst === 'intra-tag') return; // skipped, same as routeFlows does

    const dstLabel = DST_LABELS[f.dst];
    if (!dstLabel) return; // not a destination flow logs reports on

    const loc = vpcIndex.get(f.srcVpc);
    if (!loc) return;

    const region = (regionsByCloud[loc.cloudId] || []).find(r => r.id === loc.regionId);
    const path: 'private' | 'public' = region?.attached ? 'private' : 'public';

    const tag = f.srcTag || 'untagged';
    const managed = cc.managedVpcFor(loc.cloudId, loc.regionId);
    const inspected = !!managed && managed.stage === 'live';

    const denied = inspected && tag === DENY_TAG && f.dst === 'internet';

    BUCKETS.forEach((bucket, bucketIndex) => {
      const bytes = Math.round(f.gbps * WEIGHTS[bucketIndex] * 1e8);
      const rec: FlowLogRecord = {
        id: `${f.id}-${bucket}`,
        bucket,
        src: { kind: 'workload', label: f.srcName || loc.vpcName, cloudId: loc.cloudId, regionId: loc.regionId, tag },
        dst: dstLabel,
        proto: f.dst === 'dns-exfil' ? 'UDP' : 'TCP',
        port: portFor(f.dst, bucketIndex),
        bytes,
        path,
        action: denied ? 'deny' : 'allow',
      };
      if (inspected) {
        rec.vsrx = { zoneFrom: 'trust', zoneTo: 'untrust', session: `s-${flowIndex}-${bucketIndex}` };
      }
      out.push(rec);
    });
  });

  return out;
}
