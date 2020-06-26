import React from 'react';
import { render } from '@testing-library/react';
import { unmountComponentAtNode } from 'react-dom';
import RunButton from '../components/RunButton';
import { act } from 'react-dom/test-utils';

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

it('Calls the proper function to change the shouldRunSUSHI variable when clicked', () => {
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
