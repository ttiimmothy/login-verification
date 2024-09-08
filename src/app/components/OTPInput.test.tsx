import '@testing-library/jest-dom'
import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import {OTPInput} from './OTPInput';

// Mock the next/navigation module
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

// Mock the fetch function
global.fetch = jest.fn();

const mockFetch = global.fetch as jest.MockedFunction<typeof global.fetch>;

describe('OTPInput', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders 6 input fields', () => {
    const { getAllByRole } = render(<OTPInput />);
    const inputs = getAllByRole('textbox') as HTMLInputElement[];
    expect(inputs).toHaveLength(6);
  });

  it('allows input of digits', () => {
    const { getAllByRole } = render(<OTPInput />);
    const inputs = getAllByRole('textbox') as HTMLInputElement[];
    fireEvent.change(inputs[0], { target: { value: '1' } });
    expect(inputs[0].value).toBe('1');
  });

  it('moves focus to next input after entering a digit', () => {
    const { getAllByRole } = render(<OTPInput />);
    const inputs = getAllByRole('textbox') as HTMLInputElement[];
    fireEvent.change(inputs[0], { target: { value: '1' } });
    expect(document.activeElement).toBe(inputs[1]);
  });

  it('handles paste event', () => {
    const { getAllByRole } = render(<OTPInput />);
    const inputs = getAllByRole('textbox') as HTMLInputElement[];
    const pasteEvent = {
      clipboardData: {
        getData: () => '123456',
      },
      preventDefault: jest.fn(),
    };
    fireEvent.paste(inputs[0], pasteEvent);
    expect(inputs[0].value).toBe('1');
    expect(inputs[5].value).toBe('6');
  });

  it('displays error message on verification failure', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve({ message: 'Verification failed' }),
    } as Response);

    const { getByText, getByRole } = render(<OTPInput />);
    const verifyButton = getByRole('button', { name: /verify/i });
    fireEvent.click(verifyButton);

    await waitFor(() => {
      expect(getByText('Verification Error')).toBeDefined();
      // expect(getByText('Verification Error') as HTMLElement).toBeInTheDocument();
    });
  });

  it('redirects on successful verification', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ message: 'Verification successful' }),
    } as Response);

    const { getByText, getAllByRole } = render(<OTPInput />);
    const inputs = getAllByRole('textbox');
    inputs.forEach((input, index) => {
      fireEvent.change(input, { target: { value: String(index + 1) } });
    });

    const verifyButton = getByText('Verify');
    fireEvent.click(verifyButton);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(`${process.env.NEXT_PUBLIC_API_URL}/api/verify`, expect.any(Object));
    });
  });

  it('submits the form when Enter key is pressed', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ message: 'Verification successful' }),
    } as Response);

    const { getAllByRole } = render(<OTPInput />);
    const inputs = getAllByRole('textbox');
    inputs.forEach((input, index) => {
      fireEvent.change(input, { target: { value: String(index + 1) } });
    });

    fireEvent.keyDown(inputs[5], { key: 'Enter', code: 'Enter' });

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(`${process.env.NEXT_PUBLIC_API_URL}/api/verify`, expect.any(Object));
    });
  });

  it('does not submit the form when a key other than Enter is pressed', async () => {
    const { getAllByRole } = render(<OTPInput />);
    const inputs = getAllByRole('textbox');
    inputs.forEach((input, index) => {
      fireEvent.change(input, { target: { value: String(index + 1) } });
    });

    fireEvent.keyDown(inputs[5], { key: 'A', code: 'KeyA' });

    await waitFor(() => {
      expect(global.fetch).not.toHaveBeenCalled();
    });
  });
});