/**
 * The five Phase-1 attach mechanisms Cloud Connect can bring a cloud onto the
 * AT&T fabric with. The routing engine already carries a per-path `mechanism`
 * (public / native-route / overlay) describing HOW a live flow rides the
 * fabric; this catalog is the complementary Connect-side view — the menu of
 * ATTACH types an operator picks from when onboarding an on-ramp. Kept as plain
 * data (no engine coupling) so the Connect surface can render + select them.
 */
export type AttachAvailability = 'available' | 'planned';

export interface AttachType {
  id: string;
  label: string;
  desc: string;
  availability: AttachAvailability;
}

export const ATTACH_TYPES: AttachType[] = [
  {
    id: 'ip',
    label: 'IP',
    desc: 'Routed IP hand-off onto the AT&T mid-mile — no encryption overhead.',
    availability: 'available',
  },
  {
    id: 'ipsec',
    label: 'Encrypted IP (IPSec)',
    desc: 'IPSec-encrypted tunnel over any transport for confidential traffic.',
    availability: 'available',
  },
  {
    id: 'privatelink',
    label: 'PrivateLink',
    desc: 'Private endpoint service exposure — reach a service with no public IP.',
    availability: 'available',
  },
  {
    id: 'cloud-native',
    label: 'Cloud-native',
    desc: 'AWS Transit Gateway · Azure vWAN · GCP Network Connectivity Center.',
    availability: 'available',
  },
  {
    id: 'dedicated',
    label: 'Direct Connect / ExpressRoute / Interconnect',
    desc: 'Dedicated circuit straight into the hyperscaler for max throughput.',
    availability: 'available',
  },
];

/**
 * Which catalog entry the currently-active on-ramps represent. The seed fabric
 * attaches over NetBond / Direct Connect / ExpressRoute — all dedicated
 * circuits — so an active dedicated on-ramp lights the `dedicated` type.
 */
export function activeAttachTypeId(
  onramps: { type: string; active: boolean }[]
): string {
  const hasDedicated = onramps.some(
    o => o.active && /netbond|direct connect|expressroute/i.test(o.type)
  );
  return hasDedicated ? 'dedicated' : 'ip';
}
