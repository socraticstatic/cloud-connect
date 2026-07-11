import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { globSync } from 'glob';
describe('rebrand', () => {
  it('has no old-brand strings in shipped src (excluding this test file)', () => {
    const files = globSync('src/**/*.{ts,tsx,html}', { cwd: process.cwd() })
      .filter(f => !f.endsWith('rebrand.test.ts'));
    const oldBrand = ['NetBond', 'Advanced'].join(' ');
    const hits = files.filter(f => readFileSync(f, 'utf8').includes(oldBrand));
    expect(hits).toEqual([]);
  });
  it('document title is Cloud Connect', () => {
    expect(readFileSync('index.html', 'utf8')).toMatch(/<title>[^<]*Cloud Connect/);
  });
});
