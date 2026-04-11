import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Input from './Input';

describe('Input', () => {
  it('renders with label', () => {
    render(<Input label="Email" />);
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
  });

  it('accepts user input', async () => {
    render(<Input label="Name" />);
    const input = screen.getByLabelText('Name');
    await userEvent.type(input, 'hello');
    expect(input).toHaveValue('hello');
  });

  it('shows error message', () => {
    render(<Input label="Email" error="Required" />);
    expect(screen.getByText('Required')).toBeInTheDocument();
  });

  it('shows hint when no error', () => {
    render(<Input label="Email" hint="Enter your email" />);
    expect(screen.getByText('Enter your email')).toBeInTheDocument();
  });

  it('hides hint when error is present', () => {
    render(<Input label="Email" error="Required" hint="Enter your email" />);
    expect(screen.queryByText('Enter your email')).not.toBeInTheDocument();
  });

  it('calls onChange', async () => {
    const onChange = vi.fn();
    render(<Input label="Test" onChange={onChange} />);
    await userEvent.type(screen.getByLabelText('Test'), 'a');
    expect(onChange).toHaveBeenCalled();
  });
});
