import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ReportsAnalytics from '../ReportsAnalytics';
import { vi, describe, it, expect } from 'vitest';

const mockCrimes = [
  { id: 1, crimeNo: '10041202600001', crimeHeadName: 'Property Offences', crimeSubHeadName: 'Burglary by Night', districtId: 1, districtName: 'Bengaluru Urban', unitId: 1, unitName: 'Shivajinagar PS', gravity: '1', registrationDate: '2026-01-15', caseStatusName: 'Under Investigation', isAnomaly: false },
  { id: 2, crimeNo: '10041202600002', crimeHeadName: 'Cyber Crimes', crimeSubHeadName: 'Online Financial Fraud', districtId: 1, districtName: 'Bengaluru Urban', unitId: 2, unitName: 'Indiranagar PS', gravity: '2', registrationDate: '2026-02-10', caseStatusName: 'Disposed', isAnomaly: false },
  { id: 3, crimeNo: '10042202600003', crimeHeadName: 'Crimes Against Body', crimeSubHeadName: 'Murder for Gain', districtId: 2, districtName: 'Mysuru', unitId: 3, unitName: 'Devaraja PS', gravity: '1', registrationDate: '2026-03-05', caseStatusName: 'Under Investigation', isAnomaly: true },
  { id: 4, crimeNo: '10043202600004', crimeHeadName: 'Property Offences', crimeSubHeadName: 'Vehicle Theft', districtId: 3, districtName: 'Belagavi', unitId: 5, unitName: 'Belagavi Town PS', gravity: '2', registrationDate: '2026-04-20', caseStatusName: 'Chargesheeted', isAnomaly: false },
  { id: 5, crimeNo: '10044202600005', crimeHeadName: 'Narcotics NDPS', crimeSubHeadName: 'Cannabis Possession', districtId: 4, districtName: 'Dakshina Kannada', unitId: 6, unitName: 'Mangaluru South PS', gravity: '2', registrationDate: '2026-05-12', caseStatusName: 'Disposed', isAnomaly: false },
];

const mockOffenders = [
  { id: 1, name: 'Rajesh', riskScore: 92, caseCount: 11, districtId: 1, unitId: 1 },
];

describe('ReportsAnalytics', () => {
  it('renders the component title', () => {
    render(<ReportsAnalytics crimes={mockCrimes} offenders={mockOffenders} activeRole="SCRB_ADMIN" />);
    expect(screen.getByText('Data Reports & Analytics')).toBeInTheDocument();
  });

  it('renders all metric cards', () => {
    render(<ReportsAnalytics crimes={mockCrimes} offenders={mockOffenders} activeRole="SCRB_ADMIN" />);
    expect(screen.getByText('Total FIRs')).toBeInTheDocument();
    expect(screen.getByText('Heinous Crimes')).toBeInTheDocument();
    expect(screen.getByText('Disposed')).toBeInTheDocument();
    expect(screen.getByText('Under Investigation')).toBeInTheDocument();
  });

  it('renders crime category breakdown', () => {
    render(<ReportsAnalytics crimes={mockCrimes} offenders={mockOffenders} activeRole="SCRB_ADMIN" />);
    expect(screen.getByText('Crime Category Breakdown')).toBeInTheDocument();
    expect(screen.getByText('Property Offences')).toBeInTheDocument();
  });

  it('renders monthly registration trend chart', () => {
    render(<ReportsAnalytics crimes={mockCrimes} offenders={mockOffenders} activeRole="SCRB_ADMIN" />);
    expect(screen.getByText('Monthly Registration Trend')).toBeInTheDocument();
  });

  it('renders station-wise report', () => {
    render(<ReportsAnalytics crimes={mockCrimes} offenders={mockOffenders} activeRole="SCRB_ADMIN" />);
    expect(screen.getByText('Station-Wise Case Disposal Report')).toBeInTheDocument();
  });

  it('renders period filter buttons', () => {
    render(<ReportsAnalytics crimes={mockCrimes} offenders={mockOffenders} activeRole="SCRB_ADMIN" />);
    expect(screen.getByText('monthly')).toBeInTheDocument();
    expect(screen.getByText('quarterly')).toBeInTheDocument();
    expect(screen.getByText('yearly')).toBeInTheDocument();
  });

  it('changes period on button click', () => {
    render(<ReportsAnalytics crimes={mockCrimes} offenders={mockOffenders} activeRole="SCRB_ADMIN" />);
    fireEvent.click(screen.getByText('yearly'));
    expect(screen.getByText('YEARLY CRIME REPORT')).toBeInTheDocument();
  });

  it('renders export PDF button', () => {
    render(<ReportsAnalytics crimes={mockCrimes} offenders={mockOffenders} activeRole="SCRB_ADMIN" />);
    expect(screen.getByText('Export PDF')).toBeInTheDocument();
  });

  it('renders processing efficiency metrics', () => {
    render(<ReportsAnalytics crimes={mockCrimes} offenders={mockOffenders} activeRole="SCRB_ADMIN" />);
    expect(screen.getByText('Processing Efficiency')).toBeInTheDocument();
    expect(screen.getByText('Disposal Rate')).toBeInTheDocument();
    expect(screen.getByText('Chargesheet Rate')).toBeInTheDocument();
  });
});
