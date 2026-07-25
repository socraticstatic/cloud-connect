import { render, screen } from '@testing-library/react';
import { describe, test, expect } from 'vitest';
import { AssessmentFindingsWidget } from './AssessmentFindingsWidget';
import { CC } from '../../../../engine';

describe('AssessmentFindingsWidget', () => {
  test('states the recoverable-per-month figure and the security event count', () => {
    render(<AssessmentFindingsWidget />);
    const r = CC.assessmentReport();
    expect(screen.getByText(`$${Math.round(r.recoverableMo).toLocaleString()}/mo`)).toBeInTheDocument();
    expect(screen.getByText(String(r.securityEvents))).toBeInTheDocument();
  });
});
