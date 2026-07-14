import React from 'react';
import { render, screen } from '@testing-library/react';
import TrendForecasts from '../TrendForecasts';
import { FilterProvider } from '../../../contexts/FilterContext';
import { vi, describe, it, expect, beforeEach } from 'vitest';

beforeEach(() => {
  vi.restoreAllMocks();
  global.fetch = vi.fn(() =>
    Promise.resolve({
      ok: true,
      headers: new Map([['content-type', 'application/json']]),
      json: () => Promise.resolve({
        forecasts: [
          { district: 'Bengaluru Urban', districtId: 1, currentAvg: 15, forecast: Array.from({ length: 12 }, (_, i) => ({ ds: `2026-0${(i % 9) + 1}-01`, yhat: 15 + i, yhat_lower: 10 + i, yhat_upper: 20 + i })), trendDirection: 'INCREASING', peakWeek: '2026-09-01' },
        ]
      })
    })
  );
});

describe('TrendForecasts', () => {
  it('renders the component title', () => {
    render(
      <FilterProvider>
        <TrendForecasts />
      </FilterProvider>
    );
    expect(screen.getByText('12-Week Crime Forecasts')).toBeInTheDocument();
  });

  it('displays forecast data after loading', async () => {
    render(
      <FilterProvider>
        <TrendForecasts />
      </FilterProvider>
    );
    const district = await screen.findByText('Bengaluru Urban');
    expect(district).toBeInTheDocument();
  });

  it('shows trend direction', async () => {
    render(
      <FilterProvider>
        <TrendForecasts />
      </FilterProvider>
    );
    const trend = await screen.findByText('INCREASING');
    expect(trend).toBeInTheDocument();
  });
});
