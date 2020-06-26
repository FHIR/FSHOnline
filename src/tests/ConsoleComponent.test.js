import React from 'react';
import { render } from '@testing-library/react';
import { unmountComponentAtNode } from 'react-dom';
import ConsoleComponent from '../components/ConsoleComponent';

let container = null;
beforeEach(() => {
  container = document.createElement('div');
  document.body.appendChild(container);
});

afterEach(() => {
  unmountComponentAtNode(container);
  container.remove();
  container = null;
});

it('Renders with the appropriate label', () => {
  const { getByText } = render(<ConsoleComponent />, container);
  const textElement = getByText(/Console is here/i);

  expect(textElement).toBeInTheDocument();
});
