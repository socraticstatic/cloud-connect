import { describe, it, expect } from 'vitest';
import { CC } from './index';

/* ONE latency vocabulary.
 *
 * Cloud Connect used to state three different latencies for the same estate:
 *   - `fabricModel().latencyMs` on /discover, Connect's Performance tile and
 *     both PathChoice cards (geometry: on-ramp site -> region geo),
 *   - the raw seed `r.lat` (and `r.lat * 1.7`) on every /naas/observe flow row,
 *   - a bare `~12ms` literal in the network briefing.
 * us-east-1 read 3ms on Connect and 12ms on the AT&T-controlled flow row one
 * click away — the same private path into the same region, two figures.
 *
 * These tests pin the derivation, not the numbers. Every latency the product
 * displays is `CC.regionLatency(regionId)` or a stated multiple of it, so a
 * seed change moves every surface together and none of them can drift apart.
 */

interface Path {
  id: string;
  attControlled: boolean;
  latencyMs: number;
  via?: string | null;
}
interface Row {
  id: string;
  kind?: string;
  label: string;
  srcRid?: string;
  paths: Path[];
  current: Path;
}

const rows = () => CC.routeFlows() as unknown as Row[];
const appRows = () => rows().filter(r => r.kind !== 'c2c');
const c2cRows = () => rows().filter(r => r.kind === 'c2c');
const fabricLat = () =>
  Object.fromEntries(CC.fabricModel().regions.map(r => [r.regionId, r.latencyMs])) as Record<string, number>;

/** Every latency figure the engine can legitimately derive for a region. */
function derivedFigures(): Set<number> {
  const out = new Set<number>();
  for (const r of CC.fabricModel().regions) {
    const l = CC.regionLatency(r.regionId)!;
    out.add(l.privateMs);
    out.add(l.publicMs);
  }
  return out;
}

describe('regionLatency() is the one region-latency derivation', () => {
  it('agrees with fabricModel() for every region', () => {
    const fab = fabricLat();
    expect(Object.keys(fab).length).toBeGreaterThan(0);
    for (const [rid, ms] of Object.entries(fab)) {
      expect(CC.regionLatency(rid), `no regionLatency for ${rid}`).toBeTruthy();
      expect(CC.regionLatency(rid)!.privateMs, `${rid} private figure`).toBe(ms);
    }
  });

  it('prices the public path off the same figure, and never below it', () => {
    for (const r of CC.fabricModel().regions) {
      const l = CC.regionLatency(r.regionId)!;
      expect(l.publicMs).toBe(Math.round(l.privateMs * CC.PUBLIC_TRANSIT_FACTOR));
      expect(l.publicMs, `${r.regionId}: public path must not beat the fabric`).toBeGreaterThan(l.privateMs);
    }
  });

  it('returns null for a region the engine does not carry', () => {
    expect(CC.regionLatency('no-such-region')).toBeNull();
  });
});

describe('flow rows on /naas/observe speak the same vocabulary', () => {
  it('every AT&T path states the region figure Connect and Discover render', () => {
    const fab = fabricLat();
    const checked: string[] = [];
    for (const row of appRows()) {
      const rid = row.srcRid!;
      for (const p of row.paths.filter(x => x.attControlled)) {
        expect(p.latencyMs, `${row.id} · ${p.id} disagrees with fabricModel(${rid})`).toBe(fab[rid]);
        checked.push(row.id);
      }
    }
    expect(checked.length, 'the seed must carry AT&T paths to check').toBeGreaterThan(0);
  });

  it('every public path is the same figure times the stated transit factor', () => {
    const fab = fabricLat();
    for (const row of appRows()) {
      const pub = row.paths.find(p => p.id === 'public')!;
      expect(pub.latencyMs, `${row.id} public path`).toBe(Math.round(fab[row.srcRid!] * CC.PUBLIC_TRANSIT_FACTOR));
    }
  });

  it('no row displays a latency the engine cannot derive', () => {
    const ok = derivedFigures();
    for (const row of appRows()) {
      expect(ok.has(row.current.latencyMs), `${row.id} shows ${row.current.latencyMs}ms, which no region carries`).toBe(true);
    }
  });

  it('steering a flow onto the AT&T path always lowers the number it shows', () => {
    for (const row of appRows()) {
      const att = row.paths.find(p => p.attControlled)!;
      const pub = row.paths.find(p => p.id === 'public')!;
      expect(att.latencyMs, `${row.id}: the advisor recommends a slower path`).toBeLessThan(pub.latencyMs);
    }
  });
});

describe('cloud-to-cloud rows derive from their endpoints, not from a literal', () => {
  it('two different region pairs do not share one latency', () => {
    const byId = Object.fromEntries(c2cRows().map(r => [r.id, r]));
    const azure = byId['c2c-aws-azure'];
    const gcp = byId['c2c-aws-gcp'];
    expect(azure && gcp, 'both backbone pairs must exist').toBeTruthy();
    // us-east-1 <-> West US 2 and us-east-1 <-> us-central1 are different
    // distances. Identical figures mean the number was typed, not derived.
    expect(azure.paths.find(p => p.id === 'public')!.latencyMs).not.toBe(
      gcp.paths.find(p => p.id === 'public')!.latencyMs,
    );
    const azureAtt = azure.paths.filter(p => p.attControlled).map(p => p.latencyMs);
    const gcpAtt = gcp.paths.filter(p => p.attControlled).map(p => p.latencyMs);
    expect(azureAtt).not.toEqual(gcpAtt);
  });

  it('the two GPU DCI pairs do not share one latency', () => {
    const byId = Object.fromEntries(c2cRows().map(r => [r.id, r]));
    expect(byId['c2c-aws-cw'].paths.find(p => p.id === 'public')!.latencyMs).not.toBe(
      byId['c2c-azure-neb'].paths.find(p => p.id === 'public')!.latencyMs,
    );
  });

  /* The BEST backbone path, not every one of them: a pair's second PoP is a
     detour by construction and can read longer than the direct public route.
     Both `currentPath` (reroute on failure) and `routeAdvisor` (the "steer
     here, −Nms" recommendation) take the first available AT&T path, so the
     list must be ordered best-first for that promise to hold. */
  it('the best backbone path beats the public route on every pair, and sorts first', () => {
    for (const row of c2cRows()) {
      const pub = row.paths.find(p => p.id === 'public')!;
      const att = row.paths.filter(p => p.attControlled);
      expect(att.length, `${row.id} has no backbone path`).toBeGreaterThan(0);
      expect(att[0].latencyMs, `${row.id}: the advisor would recommend a slower path`).toBeLessThan(pub.latencyMs);
      expect(att.map(p => p.latencyMs)).toEqual(att.map(p => p.latencyMs).slice().sort((a, b) => a - b));
    }
  });

  it('names both endpoints, and the scene graph draws to the endpoint it names', () => {
    const scene = CC.sceneGraph() as { edges: { flowId: string; to: string; kindC2C?: boolean }[] };
    for (const row of c2cRows() as unknown as { id: string; label: string; dstCloud: string }[]) {
      const edge = scene.edges.find(e => e.flowId === row.id)!;
      expect(edge, `${row.id} has no scene edge`).toBeTruthy();
      expect(edge.to, `${row.id} (“${row.label}”) draws into ${edge.to}`).toBe('c-' + row.dstCloud);
    }
  });
});

describe('the network briefing quotes the same figures', () => {
  it('states no latency the engine cannot derive', () => {
    const ok = derivedFigures();
    const text = String(CC.obsSummary());
    const quoted = [...text.matchAll(/(\d+)ms/g)].map(m => Number(m[1]));
    expect(quoted.length, 'the briefing must quote at least one latency').toBeGreaterThan(0);
    for (const ms of quoted) {
      expect(ok.has(ms), `briefing states ${ms}ms, which no region carries: "${text}"`).toBe(true);
    }
  });

  it('says what the private-envelope figure measures', () => {
    const text = String(CC.obsSummary());
    expect(text).toMatch(/on-ramp/i);
  });
});

describe('the per-region latency chart ends on the figure the tree shows', () => {
  it('attached regions land on their fabric figure, public ones on the public figure', () => {
    for (const r of CC.fabricModel().regions) {
      const key = r.cloudId + '/' + r.regionId;
      const series = CC.latencySeries!(key, 24) as number[];
      const l = CC.regionLatency(r.regionId)!;
      expect(series.length).toBe(24);
      expect(series[series.length - 1], `${key} chart tail`).toBe(r.attached ? l.privateMs : l.publicMs);
    }
  });
});

describe('the latency SLO rule measures with the same ruler', () => {
  it('quotes only figures the engine derives', () => {
    // `latency-slo` is reachable only through an authored policy, so author one.
    const pol = CC.addPolicy!({ tag: 'classified-helion', requirement: 'latency-slo', param: 10 });
    expect(pol, 'the latency-slo requirement must be authorable').toBeTruthy();
    const { matched, violations } = CC.evalPolicy!(pol) as {
      matched: unknown[];
      violations: { msg: string }[];
    };
    expect(matched.length, 'the seed must carry classified-helion workloads').toBeGreaterThan(0);
    expect(violations.length, 'a 10ms SLO must be violated somewhere in the seed').toBeGreaterThan(0);
    const ok = derivedFigures();
    for (const v of violations) {
      const ms = Number(/(\d+)ms exceeds/.exec(v.msg)?.[1]);
      expect(ok.has(ms), `SLO finding states ${ms}ms, which no region carries`).toBe(true);
    }
    CC.removePolicy!(pol.id);
  });
});

/* Mutating tests last: the engine is a shared singleton within a file. */

const MODEL_ENDPOINT: Record<string, string> = { 'helion-70b': 'cwe', 'helion-cls-13b': 'nbe' };
/** A self-hosted model's P50 minus the network its endpoint sits behind. */
function computeTerms(): Record<string, number> {
  const models = CC.modelCatalog!() as { id: string; p50: number }[];
  const out: Record<string, number> = {};
  for (const [id, rid] of Object.entries(MODEL_ENDPOINT)) {
    const attached = CC.fabricModel().regions.find(r => r.regionId === rid)!.attached;
    const l = CC.regionLatency(rid)!;
    out[id] = models.find(m => m.id === id)!.p50 - (attached ? l.privateMs : l.publicMs);
  }
  return out;
}

describe('the AI model catalog measures with the same ruler', () => {
  it("a self-hosted model's P50 moves by exactly its region's figure when that region attaches", () => {
    const before = computeTerms();
    // nb2 is the on-ramp that attaches both GPU regions.
    expect(CC.activateOnramp!('nb2')).toBeTruthy();
    const after = computeTerms();
    // Only the network term may move; the compute seed is what the GPU takes.
    expect(after).toEqual(before);
    for (const v of Object.values(after)) expect(v).toBeGreaterThan(0);
  });
});

describe('after activateOnramp("dx1") — a state the engine can reach', () => {
  it('holds every agreement above', () => {
    CC.activateOnramp('dx1');
    const fab = fabricLat();
    for (const row of appRows()) {
      const rid = row.srcRid!;
      for (const p of row.paths.filter(x => x.attControlled)) {
        expect(p.latencyMs, `${row.id} · ${p.id} after attach`).toBe(fab[rid]);
      }
      expect(row.paths.find(p => p.id === 'public')!.latencyMs).toBe(
        Math.round(fab[rid] * CC.PUBLIC_TRANSIT_FACTOR),
      );
    }
    const ok = derivedFigures();
    const text = String(CC.obsSummary());
    for (const m of text.matchAll(/(\d+)ms/g)) {
      expect(ok.has(Number(m[1])), `briefing states ${m[1]}ms after attach: "${text}"`).toBe(true);
    }
    for (const r of CC.fabricModel().regions) {
      const l = CC.regionLatency(r.regionId)!;
      const series = CC.latencySeries!(r.cloudId + '/' + r.regionId, 24) as number[];
      expect(series[series.length - 1], `${r.regionId} chart tail after attach`).toBe(
        r.attached ? l.privateMs : l.publicMs,
      );
    }
  });
});
