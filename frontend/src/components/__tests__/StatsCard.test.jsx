import React from 'react';
import { render, screen } from '@testing-library/react';
import { StatsCard } from '../analytics/StatsCard';

// Dummy icon component for testing
const MockIcon = () => <svg data-testid="mock-icon" />;

describe('StatsCard Component', () => {
  it('renders the title and value', () => {
    render(<StatsCard title="Total Clicks" value="1,234" icon={MockIcon} />);
    expect(screen.getByText('Total Clicks')).toBeInTheDocument();
    expect(screen.getByText('1,234')).toBeInTheDocument();
    expect(screen.getByTestId('mock-icon')).toBeInTheDocument();
  });
});
