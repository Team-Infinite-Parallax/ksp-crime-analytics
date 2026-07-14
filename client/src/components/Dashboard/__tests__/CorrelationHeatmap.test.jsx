import React from 'react';
import { render, screen } from '@testing-library/react';
import CorrelationHeatmap from '../CorrelationHeatmap';
import { FilterProvider } from '../../../contexts/FilterContext';
import { vi, describe, it, expect } from 'vitest';

describe('CorrelationHeatmap', () => {
  it('renders the component title', () => {
    render(
      <FilterProvider>
        <CorrelationHeatmap />
      </FilterProvider>
    );
    expect(screen.getByText('Feature Importance & Crime Correlations')).toBeInTheDocument();
  });

  it('renders feature importance data after loading', async () => {
    render(
      <FilterProvider>
        <CorrelationHeatmap />
      </FilterProvider>
    );
    const feature = await screen.findByText(/poverty index/i);
    expect(feature).toBeInTheDocument();
  });

  it('renders how to interpret section', async () => {
    render(
      <FilterProvider>
        <CorrelationHeatmap />
      </FilterProvider>
    );
    const interpret = await screen.findByText('How to Interpret');
    expect(interpret).toBeInTheDocument();
  });

  it('renders insight section', async () => {
    render(
      <FilterProvider>
        <CorrelationHeatmap />
      </FilterProvider>
    );
    const insight = await screen.findByText(/Insight:/);
    expect(insight).toBeInTheDocument();
  });
});
