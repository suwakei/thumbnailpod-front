import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Card from './Card';

describe('Card', () => {
  it('renders children', () => {
    render(<Card>Card content</Card>);
    expect(screen.getByText('Card content')).toBeInTheDocument();
  });

  it('applies interactive variant class', () => {
    const { container } = render(<Card variant="interactive">Content</Card>);
    expect(container.firstChild).toHaveClass('interactive');
  });

  it('applies padding class', () => {
    const { container } = render(<Card padding="lg">Content</Card>);
    expect(container.firstChild).toHaveClass('padlg');
  });
});
