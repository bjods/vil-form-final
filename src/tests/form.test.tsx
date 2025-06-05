import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../App';

describe('Multi-step Form', () => {
  beforeEach(() => {
    render(<App />);
  });

  it('starts with the welcome page', () => {
    expect(screen.getByText('Welcome to Our Service Inquiry Form')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /get started/i })).toBeInTheDocument();
  });

  it('navigates to service selection after clicking get started', async () => {
    const startButton = screen.getByRole('button', { name: /get started/i });
    await userEvent.click(startButton);
    
    expect(screen.getByText('Service Selection')).toBeInTheDocument();
    expect(screen.getByText('Landscape Design & Build')).toBeInTheDocument();
  });

  it('requires at least one service to be selected', async () => {
    // Navigate to service selection
    await userEvent.click(screen.getByRole('button', { name: /get started/i }));
    
    // Try to continue without selecting a service
    const continueButton = screen.getByRole('button', { name: /continue/i });
    expect(continueButton).toBeDisabled();
    
    // Select a service
    await userEvent.click(screen.getByText('Landscape Design & Build'));
    expect(continueButton).toBeEnabled();
  });

  it('validates address input', async () => {
    // Navigate to address collection
    await userEvent.click(screen.getByRole('button', { name: /get started/i }));
    await userEvent.click(screen.getByText('Landscape Design & Build'));
    await userEvent.click(screen.getByRole('button', { name: /continue/i }));
    
    // Try to continue without address
    const continueButton = screen.getByRole('button', { name: /continue/i });
    await userEvent.click(continueButton);
    
    expect(screen.getByText('Address is required')).toBeInTheDocument();
  });

  it('validates personal information', async () => {
    // Navigate to personal information
    // ... (previous navigation steps)
    
    const emailInput = screen.getByLabelText(/email/i);
    await userEvent.type(emailInput, 'invalid-email');
    
    expect(screen.getByText('Invalid email format')).toBeInTheDocument();
    
    await userEvent.clear(emailInput);
    await userEvent.type(emailInput, 'valid@email.com');
    
    expect(screen.queryByText('Invalid email format')).not.toBeInTheDocument();
  });
});