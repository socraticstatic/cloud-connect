import { TourStep } from '../../components/tour/ProductTour';
import { CC } from '../../engine';
import { DEMO_BEATS } from '../demo/demoScript';

// The Cost beat is the single source of truth for the Cost step's copy — the
// six-beat demo arc (demoScript.ts) owns the narrative; the Tour renders it.
const COST_BEAT = DEMO_BEATS.find(b => b.route === '/cost')!;

/* ------------------------- the groups thread -------------------------

   Three beats carry one arc: the premises are visible in Discover, naming a
   set of them makes an id, and that id is what a policy is written against.
   Both mutating beats are IDEMPOTENT, because the tour is the thing a person
   clicks over and over while rehearsing:

   - addGroup returns null for an id that already exists, so the second run
     would otherwise fail silently and leave the later beats narrating a
     group that was never made. ensureSitesGroup checks first and treats
     "already named" as success — the estate ends in the same state either
     way, which is what idempotent means.
   - addRule does NOT dedupe; it appends. A second run would leave two
     identical policies in the rules table with the demo still on screen.
     ensurePayoffRule looks the rule up by name and re-enforces the one that
     exists instead of authoring a twin. enforceRule is itself a no-op on an
     already-enforced rule, so the third and fourth runs are free too. */

const SITES_GROUP_ID = 'all-branch-sites';
const SITES_GROUP_LABEL = 'All branch sites';
const WEST_WORKLOADS = 'west-workloads';
const PAYOFF_RULE_NAME = `Allow ${SITES_GROUP_LABEL.toLowerCase()} to reach west workloads`;

interface Group { id: string; label: string }
interface Rule { id: string; name: string }

const groups = () => CC.groupList() as Group[];
const rules = () => CC.ruleList() as Rule[];
const branchIds = () => (CC.branches as { id: string }[]).map(b => b.id);

/** Maps each id in `vpcIds` to the cloud that owns it — via `CC.regions`
 *  (keyed by cloud) and `CC.vpcs` (keyed by region) — and counts the
 *  distinct clouds. "west-workloads" happens to span three clouds today,
 *  but that is a fact about the seeded estate, not a number the copy gets
 *  to assume; this reads it fresh every time the beat is shown. */
function cloudCountFor(vpcIds: string[]): number {
  const regions = CC.regions as Record<string, { id: string }[]>;
  const vpcsByRegion = CC.vpcs as Record<string, { id: string }[]>;
  const cloudOfVpc: Record<string, string> = {};
  Object.keys(regions).forEach(cloudId => {
    (regions[cloudId] || []).forEach(r => {
      (vpcsByRegion[r.id] || []).forEach(v => {
        cloudOfVpc[v.id] = cloudId;
      });
    });
  });
  return new Set(vpcIds.map(id => cloudOfVpc[id]).filter(Boolean)).size;
}

function ensureSitesGroup(): void {
  if (groups().some(g => g.id === SITES_GROUP_ID)) return;
  CC.addGroup({
    id: SITES_GROUP_ID,
    label: SITES_GROUP_LABEL,
    kind: 'site',
    members: branchIds(),
    predicates: [],
    desc: 'Named from the guided tour',
  });
}

/** The rule the whole feature exists for, as a spec — dry-runnable before it
 *  is ever authored, and the exact shape `ensurePayoffRule` commits. */
const payoffSpec = () => ({
  name: PAYOFF_RULE_NAME,
  src: { group: SITES_GROUP_ID },
  dst: { group: WEST_WORKLOADS },
  ports: 'any',
  action: 'allow',
  chain: [] as string[],
});

function ensurePayoffRule(): void {
  ensureSitesGroup(); // the rule cannot name a group that was never made
  const existing = rules().find(r => r.name === PAYOFF_RULE_NAME);
  if (existing) {
    CC.enforceAny(existing.id);
    return;
  }
  // addRule returns null (and authors nothing) when dst.group does not name
  // a live group — validDst fails closed. Guard here so a west-workloads
  // that was renamed or removed can't make this click a no-op while the
  // beat above still promises the rule will join the table.
  if (!groups().some(g => g.id === WEST_WORKLOADS)) return;
  CC.addRule({ ...payoffSpec(), enforceNow: true });
}

/**
 * Guided tour of Cloud Connect. The six-beat MVP demo arc — Discover →
 * Connect → Govern → Observe → Cost → AI Fabric — is the spine, and step
 * order is still bound to `DEMO_BEATS` (demoScript.ts): the tour visits those
 * sections in that order and never doubles back to one it has left.
 *
 * Three beats are threaded INSIDE that spine rather than appended after it,
 * because groups are not an epilogue. Naming a set of premises is something
 * you do while looking at them, so it belongs in Discover; reading the group
 * back and writing it into a policy belong in Govern, next to the rule beat
 * that already explains how a rule is shaped. Bolting all three onto the end
 * would have made the payoff arrive after Cost and AI Fabric had already
 * closed the story.
 *
 * Each step's `targetSelector` is a `data-tour` attribute added to the
 * relevant component, and each `route` is the HashRouter path for that
 * section. `ProductTour` is route-agnostic — the consuming `TourLauncher`
 * navigates on `onStepChange` before the spotlight looks for the target on
 * the new page.
 *
 * A step's target is only spotlighted if it's already in the DOM. Govern's
 * tab is therefore carried in the route (`?tab=groups`) rather than left to
 * component state — a beat pointing at the Groups table on a page that opens
 * on Policies is a dead beat.
 *
 * Any figure a beat SPEAKS is a thunk, evaluated when the beat is shown, so
 * it reads the estate as the beats before it left it.
 */
export const cloudConnectTour: (TourStep & { route: string })[] = [
  {
    id: 'discover',
    title: 'Discover the estate',
    description:
      'A read-only scan mapped the estate — clouds, regions, and VPCs — with no agents installed and nothing changed. This table is the finding: most of it reaches the world over public internet, including the GPU clouds. Bytes → workloads → tokens starts here.',
    route: '/discover',
    targetSelector: '[data-tour="discover-estate"]',
    placement: 'top',
    highlightPadding: 12,
  },
  {
    id: 'discover-sites',
    title: 'Name what you found',
    description: () =>
      `The scan found more than clouds. These ${(CC.branches as unknown[]).length} premises are your own buildings — a city and a CIDR each, not a resource any hyperscaler holds. Group them under one name, and policy stops being a list of addresses. Nothing in the estate moves; you are naming what is already there.`,
    route: '/discover',
    targetSelector: '[data-tour="discover-sites"]',
    placement: 'top',
    highlightPadding: 12,
    action: {
      label: `Group all sites as “${SITES_GROUP_LABEL}”`,
      onClick: ensureSitesGroup,
    },
  },
  {
    id: 'connect',
    title: 'Attach — NaaS in one click',
    description:
      'Connectivity as a service: no circuits ordered, no boxes racked. This provisions a NetBond on-ramp and attaches the GPU clouds. Watch the fabric lines turn green and start flowing — private paths replace the public-internet routes from Discover.',
    route: '/connect',
    targetSelector: '[data-tour="connect-onramp"]',
    placement: 'top',
    highlightPadding: 12,
    action: {
      label: 'Provision & attach the GPU clouds',
      onClick: () => CC.activateOnramp('nb2'),
    },
  },
  {
    id: 'govern',
    title: 'Govern with real rules',
    description:
      'Policy the way operators write it: IF traffic FROM a tag — or, as you’ll see, a name — TO destination THEN action, with a dry-run preview against live flows before anything enforces. Enforcing this rule inserts an inline inspection point — the routes in Discover physically rewire.',
    route: '/govern',
    targetSelector: '[data-tour="govern-rules"]',
    placement: 'top',
    highlightPadding: 12,
    action: {
      label: 'Enforce: inspect classified egress',
      onClick: () => CC.enforceAny('pol-insp'),
    },
  },
  {
    id: 'govern-groups',
    title: 'A group is what a policy names',
    description: () => {
      // Self-heal: a viewer who pressed Next through discover-sites without
      // clicking its action never named the group this beat reads back. The
      // action there is idempotent and cheap — calling it here means this
      // beat, and group-policy after it, describe a group that actually
      // exists instead of narrating one that was skipped.
      ensureSitesGroup();
      const list = groups();
      const objects = new Set(
        list.flatMap(g => {
          const r = CC.resolveGroup(g.id) as { branchIds: string[]; vpcIds: string[] };
          return [...r.branchIds, ...r.vpcIds];
        }),
      ).size;
      const mine = CC.resolveGroup(SITES_GROUP_ID) as { count: number };
      const west = CC.resolveGroup(WEST_WORKLOADS) as { count: number };
      // The live-resolution claim is illustrated by "West workloads" — a
      // PREDICATE group, so it genuinely re-evaluates as the estate
      // changes. "All branch sites" is the opposite kind of group: a
      // hand-picked, literal membership. Pointing the same claim at it
      // would be true of the product and false of the example.
      return `${list.length} groups covering ${objects} estate objects. Every one is resolved right now, not stored — “West workloads” holds ${west.count} by matching a predicate, so a workload tagged tomorrow is in it tomorrow. “${SITES_GROUP_LABEL}” holds ${mine.count}: you named it in Discover, so it holds exactly the sites you picked, no more and no fewer. The id underneath each label is what every rule stores; the label is only what you read.`;
    },
    route: '/govern?tab=groups',
    targetSelector: '[data-tour="govern-groups"]',
    placement: 'top',
    highlightPadding: 12,
  },
  {
    id: 'group-policy',
    title: 'Write the group into policy',
    description: () => {
      // Self-heal, same reasoning as govern-groups above: the dry-run below
      // has to run against a group that actually exists, whether or not the
      // viewer clicked discover-sites' action.
      ensureSitesGroup();
      const dry = CC.dryRun(payoffSpec()) as { matched: unknown[]; gbps: number };
      const resolved = CC.resolveGroup(WEST_WORKLOADS) as { vpcIds: string[] };
      const cloudCount = cloudCountFor(resolved.vpcIds);
      return `The sentence the whole thing exists for: allow ${SITES_GROUP_LABEL.toLowerCase()} to talk to west workloads — two names, no addresses, spanning ${cloudCount} cloud${cloudCount === 1 ? '' : 's'}. Dry-run first: it matches ${dry.matched.length} modelled flows carrying ${dry.gbps} Gbps, every one of them named. Enforce it and the rule joins the table above, still reading as that sentence — not a table of addresses.`;
    },
    route: '/govern?tab=policies',
    targetSelector: '[data-tour="govern-rules"]',
    placement: 'top',
    highlightPadding: 12,
    action: {
      label: 'Dry-run, then enforce the group policy',
      onClick: ensurePayoffRule,
    },
  },
  {
    id: 'observe',
    title: 'Observe the bytes',
    description:
      'Telemetry derives from the same model every other tab reads. Attaching an on-ramp steps these latency lines down to the private envelope, and egress shifts toward committed pricing. Hover for the crosshair; the charts are live, not a snapshot.',
    route: '/observe',
    targetSelector: '[data-tour="observe-telemetry"]',
    placement: 'top',
    highlightPadding: 12,
  },
  {
    id: 'cost',
    title: COST_BEAT.title,
    description: COST_BEAT.narration,
    route: '/cost',
    targetSelector: '[data-tour="cost-hero"]',
    placement: 'top',
    highlightPadding: 12,
  },
  {
    id: 'ai-fabric',
    title: 'Token policies under governance',
    description:
      'The tokens layer gets the same treatment as bytes: every app has a budget, a scope, and an optional guardrail. Enforce a policy here and a classified request to an external model is denied at the token layer — the network never carries it.',
    route: '/ai-fabric',
    targetSelector: '[data-tour="aifabric-policies"]',
    placement: 'top',
    highlightPadding: 12,
  },
];
