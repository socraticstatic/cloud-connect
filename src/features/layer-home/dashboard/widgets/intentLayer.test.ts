import { describe, test, expect } from 'vitest';
import { isAiIntent } from './intentLayer';

describe('isAiIntent', () => {
  test('the four AI-and-workload intents are AI; a network intent is not', () => {
    expect(isAiIntent('private-inference')).toBe(true);
    expect(isAiIntent('cap-token-spend')).toBe(true);
    expect(isAiIntent('optimize-data-gravity')).toBe(true);
    expect(isAiIntent('ai-flow-prediction')).toBe(true);
    expect(isAiIntent('minimize-latency')).toBe(false);
  });
});
