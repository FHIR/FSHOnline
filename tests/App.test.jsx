import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import App, { decodeFSH } from '../src/App';

it('should render the basic app', () => {
  const { getByText } = render(<App match={{}} />);
  const linkElement = getByText(/FSH Online/i);
  expect(linkElement).toBeInTheDocument();
});

it('decodeFSH will return a properly decoded string from full base64 encoding', async () => {
  const base64 = 'eJzzyNRRKMnILFYAokSFktTiEoW0/CKFlNTk/JTMvHQ9ALALCwU=';
  const decoded = await decodeFSH(base64);
  const expectedDecoded = 'Hi, this is a test for decoding.';
  expect(decoded).toEqual(expectedDecoded);
});

it('decodeFSH will return a properly decoded string from an existing short link', async () => {
  global.fetch = vi.spyOn(global, 'fetch').mockResolvedValueOnce({
    ok: true,
    text: () => Promise.resolve('eJzzyNRRKMnILFYAokSFktTiEoW0/CKFlNTk/JTMvHQ9ALALCwU=')
  });
  const base64 = 'fakeurl';
  const decoded = await decodeFSH(base64);
  const expectedDecoded = 'Hi, this is a test for decoding.';
  expect(decoded).toEqual(expectedDecoded);
});

it('decodeFSH will return an empty string if no existing short URL can be found but 7 character encoding passed in', async () => {
  const base64 = '2Lpe5ZL';
  const decoded = await decodeFSH(base64);
  expect(decoded).toEqual('');
});

it('decodeFSH will return an empty string when no encoded text provided', async () => {
  const emptyShare = '';
  const decoded = await decodeFSH(emptyShare);
  expect(decoded).toEqual('');
});

it('line wrapping selection is reflected in parent on selection of checkbox', async () => {
  const { container, getByRole, getByLabelText } = render(<App match={{}} />);
  // wrapping not set by default
  expect(container.querySelector('.CodeMirror')).toBeInTheDocument();
  expect(container.querySelector('.CodeMirror-wrap')).not.toBeInTheDocument();

  // click check box for line wrapping
  const configButton = getByRole('button', { name: /Configuration/i });
  fireEvent.click(configButton);
  const isLineWrappedCheckbox = getByLabelText('Line wrap within code editors');
  expect(isLineWrappedCheckbox).not.toBeChecked();
  fireEvent.click(isLineWrappedCheckbox);

  // line wrapping set after clicked
  expect(container.querySelector('.CodeMirror')).toBeInTheDocument();
  expect(container.querySelector('.CodeMirror-wrap')).toBeInTheDocument();
});
