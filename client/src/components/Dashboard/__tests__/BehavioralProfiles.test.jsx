import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import BehavioralProfiles from '../BehavioralProfiles';
import { FilterProvider } from '../../../contexts/FilterContext';
import { vi, describe, it, expect, beforeEach } from 'vitest';

beforeEach(() => {
  vi.restoreAllMocks();
  global.fetch = vi.fn(() =>
    Promise.resolve({
      ok: true,
      headers: { get: () => 'application/json' },
      json: () => Promise.resolve({
        clusters: [
          { id: 0, size: 12, centroid: { frequency: 0.85, mobility: 0.3, severity: 0.75, evasion: 0.4, specialization: 0.2 }, members: [{ id: '1', name: 'Rajesh Choudhary', frequency: 0.9, mobility: 0.3, severity: 0.8, evasion: 0.3, specialization: 0.2, rawData: { caseCount: 11 } }] },
        ],
        typologies: [
          { clusterIdx: 0, typology: 'Organized Network', icon: '', color: '#cc3333', description: 'Coordinated multi-crime syndicate', memberCount: 12, characteristics: { avgFrequency: '85', avgSeverity: '75', avgMobility: '30', avgSpecialization: '20' } },
        ],
        summary: [{ typology: 'Organized Network', count: 12, percentage: '40.0' }],
      })
    })
  );
});

describe('BehavioralProfiles', () => {
  it('renders the component title', async () => {
    render(
      <FilterProvider>
        <BehavioralProfiles />
      </FilterProvider>
    );
    const title = await screen.findByText('Offender Behavioral Profiles');
    expect(title).toBeInTheDocument();
  });

  it('renders typology data after loading', async () => {
    render(
      <FilterProvider>
        <BehavioralProfiles />
      </FilterProvider>
    );
    const typology = await screen.findByTestId('typology-organized-network', {}, { timeout: 3000 });
    expect(typology).toBeInTheDocument();
  });

  it('selects a cluster on click', async () => {
    render(
      <FilterProvider>
        <BehavioralProfiles />
      </FilterProvider>
    );
    const typology = await screen.findByTestId('typology-organized-network', {}, { timeout: 3000 });
    fireEvent.click(typology);
    const member = await screen.findByText('Rajesh Choudhary');
    expect(member).toBeInTheDocument();
  });
});
