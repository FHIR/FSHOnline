import React from 'react';
import { render } from '@testing-library/react';
import App from '../App';

beforeAll(() => {
  document.body.createTextRange = () => {
    return {
      getBoundingClientRect: () => ({ right: 0 }),
      getClientRects: () => ({ left: 0 })
    };
  };
});

test('renders learn react link', () => {
  const { getByText } = render(<App />);
  const linkElement = getByText(/FSH Playground/i);
  expect(linkElement).toBeInTheDocument();
});
