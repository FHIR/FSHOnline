import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { unmountComponentAtNode } from 'react-dom';
import { act } from 'react-dom/test-utils';
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

//Test for the editor to trigger the prop changing functions. Having trouble figuring out how to get the keypress event acknowledged by codeMirror

// it('Changes the runVariable state when changed', () => {
//   const handleChangeBoth = jest.fn();

//   act(() => {
//     render(<CodeMirrorComponent handleText={handleChangeBoth} handleRunVariable={handleChangeBoth} />, container);
//   });

//   const editor = document.querySelector('.react-codemirror2');

//   //const event = new KeyboardEvent('keydown', { keyCode: 65 });

//   act(() => {
//     //editor.dispatchEvent(event);
//     fireEvent.change(editor, { key: 'A', code: 'KeyA' });
//   });

//   expect(handleChangeBoth).toHaveBeenCalledTimes(2);
// });
