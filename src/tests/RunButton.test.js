import React from 'react';
import { render } from '@testing-library/react';
import { unmountComponentAtNode } from 'react-dom';
import RunButton from '../components/RunButton';
import { act } from 'react-dom/test-utils';
import 'fake-indexeddb/auto';

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

it('Changes the onChange function to change the runVariable when clicked', () => {
  const onClick = jest.fn();

  act(() => {
    render(<RunButton onClick={onClick} />, container);
  });

  const button = document.querySelector('[testid=Button]');

  act(() => {
    button.dispatchEvent(new MouseEvent('click', { bubbles: true }));
  });

  expect(onClick).toHaveBeenCalledTimes(1);
});
