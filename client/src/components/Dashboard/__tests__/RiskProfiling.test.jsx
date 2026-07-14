import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import RiskProfiling from '../RiskProfiling';
import { vi, describe, it, expect } from 'vitest';

const mockOffenders = [
  { id: 1, name: 'Rajesh Choudhary', riskScore: 92, age: 34, gender: 'Male', caseCount: 11, distinctDistricts: 3, districtId: 1, unitId: 1, moPhrase: 'posed as bank official' },
  { id: 2, name: 'Imran Basappa', riskScore: 84, age: 29, gender: 'Male', caseCount: 8, distinctDistricts: 2, districtId: 1, unitId: 1, moPhrase: 'gained entry through rear window' },
  { id: 3, name: 'Sneha Yellappa', riskScore: 45, age: 31, gender: 'Female', caseCount: 3, distinctDistricts: 1, districtId: 2, unitId: 3, moPhrase: 'created fake documents' },
];

describe('RiskProfiling', () => {
  it('renders risk distribution metrics', () => {
    render(<RiskProfiling offenders={mockOffenders} />);
    expect(screen.getByText('Total Tracked')).toBeInTheDocument();
    expect(screen.getByText('Critical Risk')).toBeInTheDocument();
    expect(screen.getByText('Elevated Risk')).toBeInTheDocument();
    expect(screen.getByText('Low Risk')).toBeInTheDocument();
  });

  it('displays correct offender counts', () => {
    render(<RiskProfiling offenders={mockOffenders} />);
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('renders offender watchlist', () => {
    render(<RiskProfiling offenders={mockOffenders} />);
    expect(screen.getByText('Offender Watchlist')).toBeInTheDocument();
    expect(screen.getByText('Rajesh Choudhary')).toBeInTheDocument();
  });

  it('immediate attention section highlights high-risk offenders', () => {
    render(<RiskProfiling offenders={mockOffenders} />);
    const names = screen.getAllByText(/Rajesh Choudhary|Imran Basappa/);
    expect(names.length).toBeGreaterThan(0);
    expect(screen.getByText('Immediate Attention Required')).toBeInTheDocument();
  });

  it('filters offenders by risk level', () => {
    render(<RiskProfiling offenders={mockOffenders} />);
    const select = screen.getByDisplayValue('All Levels');
    fireEvent.change(select, { target: { value: 'high' } });
    expect(screen.getByDisplayValue('Critical')).toBeInTheDocument();
  });

  it('expands offender details on click', () => {
    render(<RiskProfiling offenders={mockOffenders} />);
    const offender = screen.getByText('Rajesh Choudhary');
    fireEvent.click(offender);
    expect(screen.getByText('Modus Operandi')).toBeInTheDocument();
  });

  it('renders district case footprint section', () => {
    render(<RiskProfiling offenders={mockOffenders} />);
    expect(screen.getByText('District Case Footprint')).toBeInTheDocument();
  });
});
