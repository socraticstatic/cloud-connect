import { describe, it, expect } from 'vitest';
import {
  groupIdFromName,
  predicateSentence,
  memberSentence,
  definitionSentences,
  KIND_LABEL,
  KIND_SCOPE,
} from './groupLanguage';

/* A group definition is the thing a person has to check their intent
   against. Rendered as a data structure it is unreadable
   ({source:'cloudTag',key:'Region',values:['west']}); rendered as English it
   is checkable at a glance. These are the sentences. */

describe('groupIdFromName — the id a policy will store', () => {
  it('derives the id every policy references from the display name', () => {
    expect(groupIdFromName('West branches')).toBe('west-branches');
    expect(groupIdFromName('West workloads')).toBe('west-workloads');
  });

  it('collapses punctuation and runs of spaces into single hyphens', () => {
    expect(groupIdFromName('  PCI / Finance   data  ')).toBe('pci-finance-data');
    expect(groupIdFromName('EMEA (prod)')).toBe('emea-prod');
  });

  it('never leaves a leading or trailing hyphen', () => {
    expect(groupIdFromName('-- west --')).toBe('west');
    expect(groupIdFromName('!!!')).toBe('');
  });

  it('is empty for an empty name, so the form can refuse to commit', () => {
    expect(groupIdFromName('')).toBe('');
    expect(groupIdFromName('   ')).toBe('');
  });
});

describe('predicateSentence — a query, said in English', () => {
  it('says a single-value cloud tag as a plain clause', () => {
    expect(predicateSentence({ source: 'cloudTag', key: 'Region', values: ['west'] })).toBe(
      'anything where Region is west',
    );
  });

  it('says a multi-value cloud tag as an or-list', () => {
    expect(predicateSentence({ source: 'cloudTag', key: 'Env', values: ['prod', 'stage'] })).toBe(
      'anything where Env is prod or stage',
    );
  });

  it('says a governance tag as a tagging clause, never as a key/value one', () => {
    expect(predicateSentence({ source: 'governanceTag', values: ['pci'] })).toBe('anything tagged pci');
    expect(predicateSentence({ source: 'governanceTag', values: ['pci', 'finance'] })).toBe(
      'anything tagged pci or finance',
    );
  });

  it('never renders a raw object or the word undefined', () => {
    const s = predicateSentence({ source: 'cloudTag', key: 'Region', values: [] });
    expect(s).not.toContain('undefined');
    expect(s).not.toContain('[object Object]');
  });
});

describe('memberSentence — literal members, counted and named by kind', () => {
  it('names branches as sites and says how many', () => {
    expect(memberSentence(3, 'site')).toBe('3 branch sites picked by hand');
    expect(memberSentence(1, 'site')).toBe('1 branch site picked by hand');
  });

  it('names VPCs as cloud workloads', () => {
    expect(memberSentence(6, 'workload')).toBe('6 cloud workloads picked by hand');
    expect(memberSentence(1, 'workload')).toBe('1 cloud workload picked by hand');
  });

  it('falls back to a kind-neutral noun for a mixed group', () => {
    expect(memberSentence(2, 'mixed')).toBe('2 estate objects picked by hand');
  });
});

describe('definitionSentences — the whole definition, as a list of clauses', () => {
  it('describes a literal-member group by its members', () => {
    expect(
      definitionSentences({ kind: 'site', members: ['br-sjc', 'br-sfo', 'br-bkl'], predicates: [] }),
    ).toEqual(['3 branch sites picked by hand']);
  });

  it('describes a predicate group by its predicates', () => {
    expect(
      definitionSentences({
        kind: 'workload',
        members: [],
        predicates: [{ source: 'cloudTag', key: 'Region', values: ['west'] }],
      }),
    ).toEqual(['anything where Region is west']);
  });

  it('lists both when a group is defined both ways', () => {
    expect(
      definitionSentences({
        kind: 'mixed',
        members: ['br-dal'],
        predicates: [{ source: 'governanceTag', values: ['pci'] }],
      }),
    ).toEqual(['1 estate object picked by hand', 'anything tagged pci']);
  });

  it('says so plainly when a group is defined by nothing at all', () => {
    expect(definitionSentences({ kind: 'mixed', members: [], predicates: [] })).toEqual([
      'nothing yet — no members and no rules',
    ]);
  });
});

describe('kind vocabulary', () => {
  it('labels all three kinds without engine jargon', () => {
    expect(KIND_LABEL.workload).toBe('Cloud workloads');
    expect(KIND_LABEL.site).toBe('Branch sites');
    expect(KIND_LABEL.mixed).toBe('Both');
  });

  it('states what each kind actually resolves against', () => {
    expect(KIND_SCOPE.workload).toMatch(/VPCs/);
    expect(KIND_SCOPE.site).toMatch(/branch/i);
    expect(KIND_SCOPE.mixed).toMatch(/both/i);
  });
});
