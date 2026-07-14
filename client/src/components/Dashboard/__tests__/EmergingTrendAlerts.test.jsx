import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import EmergingTrendAlerts from '../EmergingTrendAlerts';
import { FilterProvider } from '../../../contexts/FilterContext';
import { vi, describe, it, expect } from 'vitest';

vi.mock('../../../data/mockCrimeData', () => ({
  crimeIncidents: Array.from({ length: 50 }, (_, i) => ({
    id: i,
    crimeHeadName: ['Property Offences', 'Cyber Crimes', 'Crimes Against Body', 'Narcotics NDPS', 'Public Nuisance'][i % 5],
    crimeSubHeadName: 'Test Sub Head',
    districtId: (i % 5) + 1,
    districtName: ['Bengaluru Urban', 'Mysuru', 'Belagavi', 'Dakshina Kannada', 'Kalaburagi'][i % 5],
    unitId: (i % 8) + 1,
    unitName: 'Test PS',
    registrationDate: `2026-0${(i % 6) + 1}-${String((i % 28) + 1).padStart(2, '0')}`,
    gravity: String((i % 2) + 1),
    caseStatusName: i % 2 === 0 ? 'Under Investigation' : 'Disposed',
    isAnomaly: i % 7 === 0,
    crimeNo: `100412026000${String(i + 1).padStart(2, '0')}`,
    latitude: 12.97 + (i * 0.01),
    longitude: 77.59 + (i * 0.01),
    time: `${(i % 24).toString().padStart(2, '0')}:00`,
    moPhrase: 'test mo pattern',
  }))
}));

describe('EmergingTrendAlerts', () => {
  it('renders the component title', () => {
    render(
      <FilterProvider>
        <EmergingTrendAlerts />
      </FilterProvider>
    );
    expect(screen.getByText('Emerging Crime Trend Alerts')).toBeInTheDocument();
  });

  it('renders category trend entries', () => {
    render(
      <FilterProvider>
        <EmergingTrendAlerts />
      </FilterProvider>
    );
    expect(screen.getByText('Property Offences')).toBeInTheDocument();
    expect(screen.getByText('Cyber Crimes')).toBeInTheDocument();
  });

  it('renders district filter dropdown', () => {
    render(
      <FilterProvider>
        <EmergingTrendAlerts />
      </FilterProvider>
    );
    expect(screen.getByDisplayValue('All Districts')).toBeInTheDocument();
  });

  it('renders time range filter dropdown', () => {
    render(
      <FilterProvider>
        <EmergingTrendAlerts />
      </FilterProvider>
    );
    expect(screen.getByDisplayValue('Last 3 Months')).toBeInTheDocument();
  });

  it('changes time range on selection', () => {
    render(
      <FilterProvider>
        <EmergingTrendAlerts />
      </FilterProvider>
    );
    const select = screen.getByDisplayValue('Last 3 Months');
    fireEvent.change(select, { target: { value: '1month' } });
    expect(screen.getByDisplayValue('Last 30 Days')).toBeInTheDocument();
  });

  it('displays spike ratio info for each category', () => {
    render(
      <FilterProvider>
        <EmergingTrendAlerts />
      </FilterProvider>
    );
    const entries = screen.getAllByText(/Spike Ratio:/);
    expect(entries.length).toBeGreaterThan(0);
  });
});
