import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Inbox } from 'lucide-react';
import EmptyState from './EmptyState';

describe('EmptyState', () => {
  it('renders title', () => {
    render(<EmptyState icon={Inbox} title="No items" />);
    expect(screen.getByText('No items')).toBeInTheDocument();
  });

  it('renders description', () => {
    render(
      <EmptyState icon={Inbox} title="No items" description="Try creating one" />,
    );
    expect(screen.getByText('Try creating one')).toBeInTheDocument();
  });

  it('renders children as actions', () => {
    render(
      <EmptyState icon={Inbox} title="No items">
        <button>Create</button>
      </EmptyState>,
    );
    expect(screen.getByRole('button', { name: 'Create' })).toBeInTheDocument();
  });

  it('does not render description if not provided', () => {
    const { container } = render(<EmptyState icon={Inbox} title="Empty" />);
    expect(container.querySelector('p')).toBeNull();
  });
});
