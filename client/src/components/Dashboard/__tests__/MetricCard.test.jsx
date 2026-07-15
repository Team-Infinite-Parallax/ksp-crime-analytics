import React from 'react';
import { render, screen } from '@testing-library/react';
import MetricCard from '../MetricCard';
import { FolderOpen } from 'lucide-react';
import { describe, it, expect } from 'vitest';

describe('MetricCard', () => {
  const defaultProps = {
    title: 'Test Metric',
    value: '1,234',
    trend: '+12%',
    isPositive: true,
    icon: FolderOpen,
    sparklineData: [100, 110, 105, 120, 115, 130],
    color: 'blue',
  };

  it('renders title and value', () => {
    render(<MetricCard {...defaultProps} />);
    expect(screen.getByText('Test Metric')).toBeInTheDocument();
    expect(screen.getByText('1,234')).toBeInTheDocument();
  });

  it('renders trend indicator', () => {
    render(<MetricCard {...defaultProps} />);
    expect(screen.getByText('+12%')).toBeInTheDocument();
  });

  it('shows positive trend styling for isPositive', () => {
    render(<MetricCard {...defaultProps} />);
    const trend = screen.getByText('+12%');
    expect(trend).toBeInTheDocument();
  });

  it('shows negative trend styling when isPositive is false', () => {
    render(<MetricCard {...defaultProps} isPositive={false} trend="-4%" />);
    expect(screen.getByText('-4%')).toBeInTheDocument();
  });
});
