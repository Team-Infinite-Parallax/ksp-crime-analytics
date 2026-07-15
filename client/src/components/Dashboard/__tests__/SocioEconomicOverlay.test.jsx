import React from 'react';
import { render, screen } from '@testing-library/react';
import SocioEconomicOverlay from '../SocioEconomicOverlay';
import { FilterProvider } from '../../../contexts/FilterContext';
import { vi, describe, it, expect } from 'vitest';

vi.mock('../../../data/mockCrimeData', () => ({
  crimeIncidents: [
    { id: 1, districtId: 1, unitId: 1, crimeHeadName: 'Property Offences', gravity: '1', registrationDate: '2026-01-15', caseStatusName: 'Under Investigation', isAnomaly: false, latitude: 12.97, longitude: 77.59, time: '14:00', crimeSubHeadName: 'Burglary', crimeNo: '1001', unitName: 'Shivajinagar PS', districtName: 'Bengaluru Urban', moPhrase: 'test mo' },
    { id: 2, districtId: 1, unitId: 1, crimeHeadName: 'Cyber Crimes', gravity: '2', registrationDate: '2026-02-10', caseStatusName: 'Disposed', isAnomaly: false, latitude: 12.98, longitude: 77.60, time: '10:00', crimeSubHeadName: 'Online Fraud', crimeNo: '1002', unitName: 'Indiranagar PS', districtName: 'Bengaluru Urban', moPhrase: 'test mo' },
    { id: 3, districtId: 2, unitId: 3, crimeHeadName: 'Crimes Against Body', gravity: '1', registrationDate: '2026-03-05', caseStatusName: 'Under Investigation', isAnomaly: true, latitude: 12.30, longitude: 76.65, time: '22:00', crimeSubHeadName: 'Murder', crimeNo: '1003', unitName: 'Devaraja PS', districtName: 'Mysuru', moPhrase: 'test mo' },
  ]
}));

describe('SocioEconomicOverlay', () => {
  it('renders the component title', () => {
    render(
      <FilterProvider>
        <SocioEconomicOverlay />
      </FilterProvider>
    );
    expect(screen.getByText('Socio-Economic Crime Correlation')).toBeInTheDocument();
  });

  it('renders factor selector buttons', () => {
    render(
      <FilterProvider>
        <SocioEconomicOverlay />
      </FilterProvider>
    );
    expect(screen.getByTestId('factor-button-povertyIndex')).toBeInTheDocument();
    expect(screen.getByTestId('factor-button-populationDensity')).toBeInTheDocument();
  });

  it('renders district correlation data', () => {
    render(
      <FilterProvider>
        <SocioEconomicOverlay />
      </FilterProvider>
    );
    expect(screen.getByTestId('district-card-1')).toBeInTheDocument();
  });

  it('renders insight section', () => {
    render(
      <FilterProvider>
        <SocioEconomicOverlay />
      </FilterProvider>
    );
    expect(screen.getByText(/Insight:/)).toBeInTheDocument();
  });
});
