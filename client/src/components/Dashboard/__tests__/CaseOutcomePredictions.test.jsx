import React from 'react';
import { render, screen } from '@testing-library/react';
import CaseOutcomePredictions from '../CaseOutcomePredictions';
import { FilterProvider } from '../../../contexts/FilterContext';
import { vi, describe, it, expect, beforeEach } from 'vitest';

beforeEach(() => {
  vi.restoreAllMocks();
  global.fetch = vi.fn(() =>
    Promise.resolve({
      ok: true,
      headers: new Map([['content-type', 'application/json']]),
      json: () => Promise.resolve({
        caseOutcomes: [
          { caseId: '1', caseNo: '10041202600001', crimeHead: 'Property Offences', predictedOutcome: 'DETECTED', chargesheetProbability: 82.5, confidence: 78.0, accusedCount: 2, hasArrest: true, registrationDate: '2026-07-01' },
        ]
      })
    })
  );
});

describe('CaseOutcomePredictions', () => {
  it('renders the component title', async () => {
    render(
      <FilterProvider>
        <CaseOutcomePredictions />
      </FilterProvider>
    );
    expect(screen.getByText('Case Outcome Predictions')).toBeInTheDocument();
  });

  it('displays predicted outcomes after loading', async () => {
    render(
      <FilterProvider>
        <CaseOutcomePredictions />
      </FilterProvider>
    );
    const caseNo = await screen.findByText('10041202600001');
    expect(caseNo).toBeInTheDocument();
  });

  it('shows the predicted outcome badge', async () => {
    render(
      <FilterProvider>
        <CaseOutcomePredictions />
      </FilterProvider>
    );
    const outcome = await screen.findByText('DETECTED');
    expect(outcome).toBeInTheDocument();
  });
});
