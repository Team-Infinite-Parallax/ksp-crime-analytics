import React from 'react';
import { render, screen } from '@testing-library/react';
import NetworkGraph from '../NetworkGraph';
import { vi, describe, it, expect } from 'vitest';

// Mock cytoscape and cytoscape-fcose
vi.mock('cytoscape', () => {
  const cyMock = {
    use: vi.fn(),
    elements: vi.fn().mockReturnThis(),
    nodes: vi.fn().mockReturnThis(),
    edges: vi.fn().mockReturnThis(),
    remove: vi.fn(),
    add: vi.fn(),
    layout: vi.fn().mockReturnValue({ run: vi.fn(), stop: vi.fn(), on: vi.fn() }),
    on: vi.fn(),
    off: vi.fn(),
    destroy: vi.fn(),
    filter: vi.fn().mockReturnValue([]),
    addClass: vi.fn().mockReturnThis(),
    removeClass: vi.fn().mockReturnThis(),
    animate: vi.fn(),
    center: vi.fn(),
  };
  return {
    default: vi.fn(() => cyMock)
  };
});
vi.mock('cytoscape-fcose', () => ({ default: vi.fn() }));

describe('NetworkGraph Component', () => {
  it('renders the graph container successfully', () => {
    render(<NetworkGraph />);
    expect(screen.getByRole('region', { name: /Interactive Criminal Intelligence Network Graph/i })).toBeInTheDocument();
  });

  it('renders the screen-reader fallback table', () => {
    render(<NetworkGraph />);
    expect(screen.getByRole('table')).toBeInTheDocument();
    expect(screen.getByText('Network Graph Elements')).toBeInTheDocument();
  });
});
