import React from 'react';
import { render, wait, fireEvent } from '@testing-library/react';
import { unmountComponentAtNode } from 'react-dom';
import { act } from 'react-dom/test-utils';
import ShareLink from '../../components/ShareLink';
import * as bitlyWorker from '../../utils/BitlyWorker';
import Zlib from 'browserify-zlib';

// Mock copy to clipboard since we don't need to test the component itself
jest.mock('copy-to-clipboard', () => {
  return jest.fn();
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

it('copies link to clipboard on button click', async () => {
  const { getByRole, getByText } = render(<ShareLink shareText={'Profile: A'} />, container);

  await wait(() => {
    const shareButton = getByRole('button', { name: /Share FSH/i });
    fireEvent.click(shareButton);
  });

  const copyBtn = getByText('Copy to Clipboard');
  fireEvent.click(copyBtn);
  const linkCopiedBtn = getByText('Link Copied');
  expect(linkCopiedBtn).toBeDefined();
});

it('generates direct link when generate direct link button is clicked', async () => {
  const generateLinkSpy = jest
    .spyOn(bitlyWorker, 'generateLink')
    .mockReset()
    .mockResolvedValue({ link: 'success', errorNeeded: false });

  const { getByRole, getByText } = render(<ShareLink shareText={'Profile: A'} />, container);

  act(() => {
    const shareButton = getByRole('button', { name: /Share FSH/i });
    fireEvent.click(shareButton);
  });
  act(() => {
    const generateButton = getByText(/Generate Direct Link/);
    fireEvent.click(generateButton);
  });
  await wait(() => {
    expect(generateLinkSpy).toHaveBeenCalled();
  });
});

it('generates direct link with configuration when direct link button is clicked', async () => {
  const generateLinkSpy = jest
    .spyOn(bitlyWorker, 'generateLink')
    .mockReset()
    .mockResolvedValue({ link: 'success', errorNeeded: false });

  const deflateSpy = jest.spyOn(Zlib, 'deflateSync').mockReset().mockReturnValue('foo');

  const { getByRole, getByText } = render(
    <ShareLink shareText={'Profile: A'} config={{ canonical: 'http://example.org' }} />,
    container
  );

  act(() => {
    const shareButton = getByRole('button', { name: /Share FSH/i });
    fireEvent.click(shareButton);
  });
  act(() => {
    const generateButton = getByText(/Generate Direct Link/);
    fireEvent.click(generateButton);
  });
  await wait(() => {
    expect(deflateSpy).toHaveBeenCalledWith('{"c":"http://example.org"}\nProfile: A');
    expect(generateLinkSpy).toHaveBeenCalledWith('https://fshschool.org/FSHOnline/#/share/foo');
  });
});

it('generates gist link when generate gist link button is clicked', async () => {
  const { getByRole, getByText } = render(<ShareLink shareText={'Profile: A'} />, container);

  act(() => {
    const shareButton = getByRole('button', { name: /Share FSH/i });
    fireEvent.click(shareButton);
  });
  act(() => {
    const generateButton = getByText(/Generate Link from Gist/);
    fireEvent.click(generateButton);
  });
  act(() => {
    const gistInput = document.getElementById('gistURLText');
    fireEvent.change(gistInput, {
      target: { value: 'https://gist.github.com/user/59c573230cd60729df8b44ab8a67b6da' }
    });
  });
  act(() => {
    const generateButton = getByText(/Generate Link from Gist/);
    fireEvent.click(generateButton);
  });
  act(() => {
    const link = document.getElementById('link');
    expect(link.innerHTML).toBe('https://fshschool.org/FSHOnline/#/gist/59c573230cd60729df8b44ab8a67b6da');
  });
});

it('shows an error when the FSH file is too long to share', async () => {
  const generateLinkSpy = jest
    .spyOn(bitlyWorker, 'generateLink')
    .mockReset()
    .mockResolvedValue({ link: undefined, errorNeeded: true });

  const { getByRole, getByText } = render(<ShareLink shareText={'Profile: AVeryLongProfile'} />, container);
  act(() => {
    const shareButton = getByRole('button', { name: /Share FSH/i });
    fireEvent.click(shareButton);
  });
  act(() => {
    const generateButton = getByText(/Generate Direct Link/);
    fireEvent.click(generateButton);
  });
  await wait(() => {
    const swimBtn = getByText(/Keep Swimming!/i);
    expect(swimBtn).toBeInTheDocument();
    expect(generateLinkSpy).toHaveBeenCalled();
  });
});
