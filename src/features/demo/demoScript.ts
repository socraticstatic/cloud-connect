/**
 * The canonical six-beat MVP demo arc, as pure data.
 *
 * This is the single source of truth for the demo narrative:
 * Discover → NaaS Connect → Govern → Observe → Cost → AI Fabric Govern.
 * The guided Tour (`cloudConnectTour`) binds its step order and its Cost step copy to these
 * beats so the two never drift apart. NetOps is deliberately absent — it left
 * the curated nav and is not part of the MVP demo arc.
 *
 * Pure data: no runtime dependencies, no Date.now()/Math.random().
 */
export type DemoBeat = { route: string; title: string; narration: string; hero: string };

export const DEMO_BEATS: DemoBeat[] = [
  {
    route: '/discover',
    title: 'See everything you have',
    narration:
      'Cloud Connect discovers your estate across AWS, Azure, and GCP — regions, VPCs, workloads, dependencies. And it finds the problem: workloads reachable over the public internet.',
    hero: 'The amber finding strip',
  },
  {
    route: '/naas/connect',
    title: 'Attach and steer in one click',
    narration:
      'One wizard, every attach type — IP, IPSec, PrivateLink, cloud-native, dedicated. Steer a public flow onto an AT&T-controlled path and watch the edge turn cobalt.',
    hero: 'Steer action flips a path live',
  },
  {
    route: '/naas/govern',
    title: 'Policy from your own tags',
    narration:
      'tag=PCI forces the private path. tag=Internet-facing inserts the firewall. Your cloud tags drive routing, security, and segmentation — with impact preview before you enforce.',
    hero: 'Enforce drops the violation count',
  },
  {
    route: '/naas/observe',
    title: 'Proof, not promises',
    narration:
      'Latency, loss, and egress series shift where you steered. The event stream narrates every action taken in this session. Full telemetry on every path.',
    hero: 'The event stream narrating this demo',
  },
  {
    route: '/naas/cost',
    title: 'The money slide, live',
    narration:
      'Two bills side by side: all-hyperscaler egress against the same estate on the AT&T fabric. Attach a path and watch both bills move and the saving grow. This is arbitrage only AT&T can offer.',
    hero: 'On the AT&T fabric, per month',
  },
  {
    route: '/ai/govern',
    title: 'The foundation beneath AI Fabric',
    narration:
      'The same fabric routes models and meters tokens. Every AI route governed, every prompt traced. Connectivity is the foundation — this is what it enables next.',
    hero: 'Token meter running on live routes',
  },
];
