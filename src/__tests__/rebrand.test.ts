import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { execSync } from 'child_process';

describe('rebrand', () => {
  it('has no old-brand strings in tracked shipped files (markup/®-tolerant, excluding this test file)', () => {
    const tracked = execSync('git ls-files', { cwd: process.cwd(), encoding: 'utf8' })
      .split('\n')
      .filter(Boolean);

    // UserProfile.tsx links to real, unrenamed external GitHub release assets
    // (e.g. github.com/.../NetBond_Advanced/releases/.../AT.T.NetBond.Advanced...).
    // Those are link targets, not display copy — rewriting them would point to a
    // non-existent file, so this file is intentionally excluded from the scan.
    const files = tracked.filter(f =>
      !f.endsWith('rebrand.test.ts') &&
      !f.endsWith('src/components/profile/UserProfile.tsx') &&
      (
        /^src\/.*\.(ts|tsx|html)$/.test(f) ||
        f === 'package.json' ||
        /^electron\/.*\.cjs$/.test(f) ||
        f === 'index.html'
      )
    );

    const oldBrandPattern = /NetBond[\s\S]{0,60}Advanced/i;
    const hits = files.filter(f => oldBrandPattern.test(readFileSync(f, 'utf8')));
    expect(hits).toEqual([]);
  });

  it('document title is Cloud Connect', () => {
    expect(readFileSync('index.html', 'utf8')).toMatch(/<title>[^<]*Cloud Connect/);
  });
});
