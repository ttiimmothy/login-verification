import '@testing-library/jest-dom'
import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import {OTPInput} from './OTPInput';

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

describe('OTPInput', () => {
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
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: false,
        json: () => Promise.resolve({ message: 'Verification failed' }),
      }) as Promise<Response>
    );

    const { getByText, getByRole } = render(<OTPInput />);
    const verifyButton = getByRole('button', { name: /verify/i });
    fireEvent.click(verifyButton);

    await waitFor(() => {
      expect(getByText('Verification Error')).toBeDefined();
      // expect(getByText('Verification Error')).toBeInTheDocument();
    });
  });
});