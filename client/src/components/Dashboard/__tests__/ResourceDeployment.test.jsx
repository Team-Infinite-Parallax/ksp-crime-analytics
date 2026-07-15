import React from 'react';
import { render, screen } from '@testing-library/react';
import ResourceDeployment from '../ResourceDeployment';
import { FilterProvider } from '../../../contexts/FilterContext';
import { describe, it, expect } from 'vitest';

describe('ResourceDeployment', () => {
  it('renders the component title', () => {
    render(
      <FilterProvider>
        <ResourceDeployment />
      </FilterProvider>
    );
    expect(screen.getByText('Smart Resource Deployment')).toBeInTheDocument();
  });

  it('renders patrol deficit metric', () => {
    render(
      <FilterProvider>
        <ResourceDeployment />
      </FilterProvider>
    );
    expect(screen.getByText('Patrol Deficit')).toBeInTheDocument();
  });

  it('renders high priority units metric', () => {
    render(
      <FilterProvider>
        <ResourceDeployment />
      </FilterProvider>
    );
    expect(screen.getByText('High Priority Units')).toBeInTheDocument();
  });

  it('renders adequately staffed count', () => {
    render(
      <FilterProvider>
        <ResourceDeployment />
      </FilterProvider>
    );
    expect(screen.getByText('Adequately Staffed')).toBeInTheDocument();
  });

  it('renders deployment recommendation', () => {
    render(
      <FilterProvider>
        <ResourceDeployment />
      </FilterProvider>
    );
    expect(screen.getByText(/additional patrol vehicles/i)).toBeInTheDocument();
  });
});
