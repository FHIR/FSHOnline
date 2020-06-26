import React from 'react';
import { render } from '@testing-library/react';
import { unmountComponentAtNode } from 'react-dom';
import CodeMirrorComponent from '../components/CodeMirrorComponent';

beforeAll(() => {
  document.body.createTextRange = () => {
    return {
      getBoundingClientRect: () => ({ right: 0 }),
      getClientRects: () => ({ left: 0 })
    };
  };
});

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

it('Renders appropriately', () => {
  const { getByText } = render(<CodeMirrorComponent value="Edit FSH Here!" />, container);
  const textElement = getByText(/Edit FSH Here!/i);

  expect(textElement).toBeInTheDocument();
});
