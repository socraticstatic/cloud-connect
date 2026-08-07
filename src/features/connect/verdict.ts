import type { FabricModel } from './FabricHero';

/** Phase-1 verdict for Connect: fabric posture in one sentence pair.
 *  Every estate shape returns a sentence, including the empty one. */
export function connectVerdict(model: FabricModel): string {
  const total = model.regions.length;
  if (!total) return 'No estate mapped yet. Discover your clouds to begin.';
  const attached = model.regions.filter(r => r.path === 'private');
  const dual = attached.filter(r => r.reliability === 'dual').length;
  const pub = total - attached.length;
  if (!attached.length) {
    return `None of your ${total} regions are on the AT&T fabric yet. Everything rides the public internet.`;
  }
  if (!pub) {
    return `All ${total} regions are on the AT&T fabric, ${dual} with dual paths.`;
  }
  return `${attached.length} of ${total} regions are on the AT&T fabric, ${dual} with dual paths. ${pub} still ride${pub === 1 ? 's' : ''} the public internet.`;
}
