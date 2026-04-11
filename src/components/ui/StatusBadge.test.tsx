import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import StatusBadge from './StatusBadge';

describe('StatusBadge', () => {
  it('renders pending status', () => {
    render(<StatusBadge status="pending" />);
    expect(screen.getByText('Pending')).toBeInTheDocument();
  });

  it('renders processing status', () => {
    render(<StatusBadge status="processing" />);
    expect(screen.getByText('Processing')).toBeInTheDocument();
  });

  it('renders completed status', () => {
    render(<StatusBadge status="completed" />);
    expect(screen.getByText('Completed')).toBeInTheDocument();
  });

  it('renders failed status', () => {
    render(<StatusBadge status="failed" />);
    expect(screen.getByText('Failed')).toBeInTheDocument();
  });

  it('renders training status', () => {
    render(<StatusBadge status="training" />);
    expect(screen.getByText('Training')).toBeInTheDocument();
  });

  it('renders ready status', () => {
    render(<StatusBadge status="ready" />);
    expect(screen.getByText('Ready')).toBeInTheDocument();
  });

  it('renders unknown status as raw string', () => {
    render(<StatusBadge status="custom_status" />);
    expect(screen.getByText('custom_status')).toBeInTheDocument();
  });
});
