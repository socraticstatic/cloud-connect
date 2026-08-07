import type { FabricModel } from '../connect/FabricHero';

/** Phase-1 verdict for Discover: the estate in one sentence pair. */
export function discoverVerdict(model: FabricModel): string {
  const total = model.regions.length;
  if (!total) return 'No estate mapped yet. Connect a cloud to begin.';
  const clouds = new Set(model.regions.map(r => r.cloudId)).size;
  const attached = model.regions.filter(r => r.path === 'private').length;
  const pub = total - attached;
  return `Your estate spans ${total} regions across ${clouds} cloud${clouds === 1 ? '' : 's'}. ` +
    `${attached} ${attached === 1 ? 'is' : 'are'} on the AT&T fabric; ` +
    `${pub} still ride${pub === 1 ? 's' : ''} the public internet.`;
}
