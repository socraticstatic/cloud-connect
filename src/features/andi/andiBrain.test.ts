import { describe, it, expect } from 'vitest';
import { CC } from '../../engine';
import { andiAnswer, andiResolveCards, andiSuggestions } from './andiBrain';
import { aiSpendRows, aiSpendTotals, fmtUsd } from '../ai-fabric/aiSpend';
import { attachOpportunities } from '../discover/stackFigures';

describe('andiBrain — every answer is engine-grounded', () => {
  it('a typed cap intent comes back as confirm-to-run, never auto-executed', () => {
    const before = CC.tokenBudgetOf('shared-services');
    const answer = andiAnswer(CC, 'cap shared-services 2m', 'ai');
    expect(answer.actions).toHaveLength(1);
    expect(answer.actions[0].kind).toBe('run');
    expect(answer.actions[0].label).toContain('Cap shared-services');
    // Asking did NOT apply it.
    expect(CC.tokenBudgetOf('shared-services')).toBe(before);
    // Running the action applies it; restore after.
    answer.actions[0].run!();
    expect(CC.tokenBudgetOf('shared-services')).toBe(2_000_000);
    CC.setTokenPolicy('shared-services', { budget: before });
  });

  it('the top-spender answer restates aiSpend figures verbatim', () => {
    const totals = aiSpendTotals(CC);
    const answer = andiAnswer(CC, 'Which team is driving most spend?', 'ai');
    if (totals.spendToday === 0) {
      expect(answer.text).toContain('Nothing has metered spend today');
    } else {
      const top = [...aiSpendRows(CC)].sort((a, b) => b.spendToday - a.spendToday)[0];
      expect(answer.text).toContain(top.tag);
      expect(answer.text).toContain(fmtUsd(top.spendToday));
    }
    expect(answer.actions.some(a => a.to === '/ai/teams')).toBe(true);
  });

  it('network questions route to the engine grounded-answer engine', () => {
    const answer = andiAnswer(CC, 'Why is egress cost up?', 'naas');
    expect(answer.html).toBeTruthy();
    expect(answer.html).toBe(CC.answerFor('Why is egress cost up?'));
  });

  it('ungroundable questions get the honest fallback with re-askable prompts', () => {
    const answer = andiAnswer(CC, 'write me a poem about routers', 'naas');
    expect(answer.text).toContain('engine can ground');
    expect(answer.actions.length).toBeGreaterThan(0);
    for (const a of answer.actions) {
      expect(a.kind).toBe('ask');
      expect(a.prompt).toBeTruthy();
    }
  });

  it('resolve cards are the advisor draft, priced by the engine', () => {
    // Scoped to the draft family: proposal and intent cards (also present in
    // the full andiResolveCards list) are covered by their own tests.
    const cards = andiResolveCards(CC).filter(c => c.move === 'draft');
    const priced = attachOpportunities(CC).filter(o => o.bucketSavingMo !== null);
    expect(cards.length).toBeGreaterThan(0);
    expect(cards.length).toBeLessThanOrEqual(3);
    for (const card of cards.filter(c => c.title.startsWith('Attach'))) {
      const opp = priced.find(o => card.title === `Attach ${o.label}`)!;
      expect(opp).toBeTruthy();
      expect(card.savingMo).toBe(opp.bucketSavingMo);
    }
  });

  it('suggestions are layer-aware and all answerable', () => {
    for (const key of ['ai', 'naas', null] as const) {
      for (const s of andiSuggestions(key)) {
        const answer = andiAnswer(CC, s, key);
        // Answerable = not the fallback.
        expect(answer.text ?? answer.html).not.toContain('engine can ground');
      }
    }
  });
});
