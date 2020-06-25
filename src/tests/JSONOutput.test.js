import React from 'react';
import { render } from '@testing-library/react';
import { unmountComponentAtNode } from 'react-dom';
import JSONOutput from '../components/JSONOutput';

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

it('Renders with the proper heading as default', () => {
  const { getByText } = render(<JSONOutput />, container);
  const textElement = getByText(/Your Output Will Display Here:/i);

  expect(textElement).toBeInTheDocument();
});
it('Renders with the proper heading and updates with proper text', () => {
  const { getByText } = render(<JSONOutput value={true} text={'Hello World'} />, container);
  const textElement = getByText(/Hello World/i);

  expect(textElement).toBeInTheDocument();
});

it('Renders with the default heading if runVariable is false', () => {
  const { getByText } = render(<JSONOutput value={false} text={'Hello World'} />, container);
  const textElement = getByText(/Your Output Will Display Here:/i);

  expect(textElement).toBeInTheDocument();
});
