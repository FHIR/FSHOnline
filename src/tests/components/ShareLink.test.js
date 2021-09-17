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
let generateLinkSpy;

beforeEach(() => {
  container = document.createElement('div');
  document.body.appendChild(container);
  generateLinkSpy = jest
    .spyOn(bitlyWorker, 'generateLink')
    .mockReset()
    .mockResolvedValue({ link: 'success', errorNeeded: false });
});

afterEach(() => {
  unmountComponentAtNode(container);
  container.remove();
  container = null;
});

it('copies link to clipboard on button click', async () => {
  const { getByRole, getByText } = render(<ShareLink shareText={'Profile: A'} />, container);

  act(() => {
    const shareButton = getByRole('button', { name: /Share FSH/i });
    fireEvent.click(shareButton);
  });
  await wait(() => {
    expect(generateLinkSpy).toHaveBeenCalled();
  });
  act(() => {
    const copyBtn = getByText('Copy to Clipboard');
    fireEvent.click(copyBtn);
  });
  await wait(() => {
    const linkCopiedBtn = getByText('Link Copied');
    expect(linkCopiedBtn).toBeDefined();
  });
});

it('generates direct link when sharing', async () => {
  const { getByRole } = render(<ShareLink shareText={'Profile: A'} />, container);

  act(() => {
    const shareButton = getByRole('button', { name: /Share FSH/i });
    fireEvent.click(shareButton);
  });
  await wait(() => {
    expect(generateLinkSpy).toHaveBeenCalled();
  });
});

it('generates direct link with configuration when direct link button is clicked', async () => {
  const deflateSpy = jest.spyOn(Zlib, 'deflateSync').mockReset().mockReturnValue('foo');

  const { getByRole } = render(
    <ShareLink shareText={'Profile: A'} config={{ canonical: 'http://example.org' }} />,
    container
  );

  act(() => {
    const shareButton = getByRole('button', { name: /Share FSH/i });
    fireEvent.click(shareButton);
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
  await wait(() => {
    expect(generateLinkSpy).toHaveBeenCalled();
  });
  act(() => {
    const gistBtn = getByText(/Create Link with Gist/i);
    fireEvent.click(gistBtn);
  });
  act(() => {
    const gistInput = document.getElementById('gistURLText');
    fireEvent.change(gistInput, {
      target: { value: 'https://gist.github.com/user/59c573230cd60729df8b44ab8a67b6da' }
    });
  });
  act(() => {
    const gistBtn = getByRole('button', { name: /Generate Link from Gist/i });
    fireEvent.click(gistBtn);
  });
  await wait(() => {
    const linkCopiedBtn = getByText('Link Copied to Clipboard');
    expect(linkCopiedBtn).toBeDefined();
  });
});

it('routes to Gist dialog with error when the FSH file is too long to share', async () => {
  generateLinkSpy.mockResolvedValue({ link: undefined, errorNeeded: true });

  const { getByRole, getByText } = render(<ShareLink shareText={'Profile: AVeryLongProfile'} />, container);
  act(() => {
    const shareButton = getByRole('button', { name: /Share FSH/i });
    fireEvent.click(shareButton);
  });
  await wait(() => {
    const gistButton = getByText(/Generate Link from Gist/i);
    expect(gistButton).toBeInTheDocument();
    const errorMessage = getByText(/Your FSH content is too long to share directly/);
    expect(errorMessage).toBeInTheDocument();
    expect(generateLinkSpy).toHaveBeenCalled();
  });
});
