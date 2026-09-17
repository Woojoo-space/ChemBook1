import { fireEvent, render, screen } from '@testing-library/react';
import { expect, test } from 'vitest';
import App from './App';

test('renders the virtual science lab', () => {
  render(<App />);

  expect(screen.getByRole('heading', { name: /what color next/i })).toBeDefined();
  expect(screen.getByRole('button', { name: /open door/i })).toBeDefined();
});

test('unlocks the first word cards after mixing orange', () => {
  render(<App />);

  fireEvent.click(screen.getByRole('button', { name: /red/i }));
  fireEvent.click(screen.getByRole('button', { name: /yellow/i }));
  fireEvent.click(screen.getByRole('button', { name: /open door/i }));

  expect(screen.getByRole('button', { name: 'What' })).toBeDefined();
  expect(screen.getByRole('button', { name: 'How' })).toBeDefined();
  expect(screen.getByRole('button', { name: 'Who' })).toBeDefined();
});
