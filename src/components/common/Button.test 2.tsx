import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '../test/utils';
import { Button } from './Button';
import { Activity } from 'lucide-react';

describe('Button', () => {
  it('renders children correctly', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('handles click events', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    fireEvent.click(screen.getByText('Click me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('renders with icon', () => {
    render(<Button icon={Activity}>With Icon</Button>);
    expect(screen.getByText('With Icon')).toBeInTheDocument();
    expect(document.querySelector('svg')).toBeInTheDocument();
  });

  it('applies correct variant styles', () => {
    const { rerender } = render(<Button variant="primary">Primary</Button>);
    expect(screen.getByText('Primary')).toHaveClass('bg-blue-600');

    rerender(<Button variant="secondary">Secondary</Button>);
    expect(screen.getByText('Secondary')).toHaveClass('bg-white');

    rerender(<Button variant="outline">Outline</Button>);
    expect(screen.getByText('Outline')).toHaveClass('border-gray-300');
  });

  it('applies disabled state correctly', () => {
    render(<Button disabled>Disabled</Button>);
    expect(screen.getByText('Disabled')).toBeDisabled();
    expect(screen.getByText('Disabled')).toHaveClass('opacity-50');
  });

  it('applies full width style when specified', () => {
    render(<Button fullWidth>Full Width</Button>);
    expect(screen.getByText('Full Width')).toHaveClass('w-full');
  });
});