import type { CloudControl } from '../../engine/types';
import type { AndiAnswer } from './andiBrain';
import type { FabricModel } from '../connect/FabricHero';
import { discoverVerdict } from '../discover/verdict';
import { connectVerdict } from '../connect/verdict';
import { buildVerdict } from '../observe/networkBinding';

/** Spine navigation, spoken in verdicts. Pure matcher: an utterance either
 *  is a spine phrase (answer = that screen's verdict + one navigate action)
 *  or it is not (null - the brain falls through to its other steps).
 *  Andi drafts; the human clicks. */
const ROUTES: { match: RegExp; to: string; label: string; verdict: (cc: CloudControl) => string }[] = [
  {
    match: /\b(estate|discover|inventory|what do i have)\b/i,
    to: '/discover',
    label: 'Open Discover',
    verdict: cc => discoverVerdict(cc.fabricModel() as FabricModel),
  },
  {
    match: /\b(connections?|fabric|attach(ed|ments)?)\b/i,
    to: '/naas/connect',
    label: 'Open Connect',
    verdict: cc => connectVerdict(cc.fabricModel() as FabricModel),
  },
  {
    match: /\b(traffic|observe|observability|flows?)\b/i,
    to: '/naas/observe',
    label: 'Open Observe',
    verdict: cc => buildVerdict(cc),
  },
  {
    match: /\b(saving|savings|spend|cost)\b/i,
    to: '/naas/cost',
    label: 'See the savings',
    verdict: cc => buildVerdict(cc),
  },
];

/** Only phrases that read as "take me somewhere / show me" qualify - a bare
 *  keyword inside an action or metric question must fall through. */
const NAV_SHAPE = /\b(show|take me|open|go to|where|how('s| is| are)|what (do i have|am i saving))\b/i;

export function spineAnswer(cc: CloudControl, query: string): AndiAnswer | null {
  const q = query.trim();
  if (!NAV_SHAPE.test(q) && !/^\s*(discover|connect|observe|cost)\s*$/i.test(q)) return null;
  const route = ROUTES.find(r => r.match.test(q));
  if (!route) return null;
  return {
    text: route.verdict(cc),
    actions: [{ label: route.label, kind: 'navigate', to: route.to }],
  };
}
