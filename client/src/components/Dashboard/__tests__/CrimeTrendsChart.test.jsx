import React from 'react';
import { render, screen } from '@testing-library/react';
import CrimeTrendsChart from '../CrimeTrendsChart';
import { FilterProvider } from '../../../contexts/FilterContext';
import { vi, describe, it, expect, beforeEach } from 'vitest';

const mockData = [
  { label: 'Jan', value: 110 },
  { label: 'Feb', value: 135 },
  { label: 'Mar', value: 125 },
  { label: 'Apr', value: 155 },
  { label: 'May', value: 145 },
  { label: 'Jun', value: 175 },
];

beforeEach(() => {
  vi.restoreAllMocks();
  global.fetch = vi.fn(() =>
    Promise.resolve({
      ok: true,
      headers: { get: () => 'application/json' },
      json: () => Promise.resolve({ anomalies: [] })
    })
  );
});

describe('CrimeTrendsChart', () => {
  it('renders with provided data', () => {
    render(
      <FilterProvider>
        <CrimeTrendsChart title="Crime Volume Test" data={mockData} />
      </FilterProvider>
    );
    expect(screen.getByText('Crime Volume Test')).toBeInTheDocument();
  });

  it('renders all month labels', () => {
    render(
      <FilterProvider>
        <CrimeTrendsChart title="Test" data={mockData} />
      </FilterProvider>
    );
    mockData.forEach(d => {
      expect(screen.getByText(d.label)).toBeInTheDocument();
    });
  });

  it('renders year-on-year indicator', () => {
    render(
      <FilterProvider>
        <CrimeTrendsChart title="Test" data={mockData} />
      </FilterProvider>
    );
    expect(screen.getByText('Year-on-Year')).toBeInTheDocument();
  });

  it('renders nothing with empty data', () => {
    const { container } = render(
      <FilterProvider>
        <CrimeTrendsChart title="Test" data={[]} />
      </FilterProvider>
    );
    expect(container.innerHTML).toBe('');
  });

  it('shows anomalies when enabled', async () => {
    render(
      <FilterProvider>
        <CrimeTrendsChart title="Test" data={mockData} showAnomalies={true} />
      </FilterProvider>
    );
    const el = await screen.findByText('Anomalies Detected');
    expect(el).toBeInTheDocument();
  });
});
