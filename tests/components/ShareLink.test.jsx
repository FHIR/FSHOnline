import React from 'react';
import { render, waitFor, fireEvent } from '@testing-library/react';
import { unmountComponentAtNode } from 'react-dom';
import { act } from 'react-dom/test-utils';
import ShareLink from '../../src/components/ShareLink';

// Mock copy to clipboard since we don't need to test the component itself
vi.mock('copy-to-clipboard', () => ({
  default: vi.fn()
}));
const { deflateSpy } = vi.hoisted(() => {
  return { deflateSpy: vi.fn(() => 'foo') };
});
vi.mock('browserify-zlib', () => ({
  default: vi.fn(),
  deflateSync: deflateSpy
}));

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

it('generates direct link when sharing', async () => {
  const { getByRole, getByText } = render(<ShareLink shareText={'Profile: A'} />, container);

  act(() => {
    const shareButton = getByRole('button', { name: /Share FSH/i });
    fireEvent.click(shareButton);
  });
  await waitFor(() => {
    expect(deflateSpy).toHaveBeenCalledWith('Profile: A');
    const linkText = getByText('https://fshonline.fshschool.org/#/share/foo');
    expect(linkText).toBeInTheDocument();
  });
});

it('generates direct link with configuration when direct link button is clicked', async () => {
  const { getByRole, getByText } = render(
    <ShareLink shareText={'Profile: A'} config={{ canonical: 'http://example.org' }} />,
    container
  );

  act(() => {
    const shareButton = getByRole('button', { name: /Share FSH/i });
    fireEvent.click(shareButton);
  });
  await waitFor(() => {
    expect(deflateSpy).toHaveBeenCalledWith('{"c":"http://example.org"}\nProfile: A');
    const linkText = getByText('https://fshonline.fshschool.org/#/share/foo');
    expect(linkText).toBeInTheDocument();
  });
});

it('generates gist link when generate gist link button is clicked', async () => {
  const { getByRole, getByText } = render(<ShareLink shareText={'Profile: A'} />, container);

  act(() => {
    const shareButton = getByRole('button', { name: /Share FSH/i });
    fireEvent.click(shareButton);
  });
  await waitFor(() => {
    expect(deflateSpy).toHaveBeenCalled();
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
  await waitFor(() => {
    const shareModal = getByText('Share');
    expect(shareModal).toBeDefined();
  });
});

it('routes to Gist dialog with error when the FSH file is too long to share', async () => {
  deflateSpy.mockImplementationOnce(() => 'example'.padEnd('2049', '.'));

  const { getByRole, getByText } = render(<ShareLink shareText={'Profile: AVeryLongProfile'} />, container);
  act(() => {
    const shareButton = getByRole('button', { name: /Share FSH/i });
    fireEvent.click(shareButton);
  });
  await waitFor(() => {
    const gistButton = getByText(/Generate Link from Gist/i);
    expect(gistButton).toBeInTheDocument();
    const errorMessage = getByText(/Your FSH content is too long to share directly/);
    expect(errorMessage).toBeInTheDocument();
    expect(deflateSpy).toHaveBeenCalled();
  });
});
