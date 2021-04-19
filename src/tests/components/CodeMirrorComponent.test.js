import React from 'react';
import { render, fireEvent, wait } from '@testing-library/react';
import { unmountComponentAtNode } from 'react-dom';
import CodeMirrorComponent from '../../components/CodeMirrorComponent';

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

it('Renders initial text in the editor', () => {
  const { getByText } = render(<CodeMirrorComponent initialText="Edit FSH here!" />, container);
  const textElement = getByText(/Edit FSH here!/i);

  expect(textElement).toBeInTheDocument();
});

it('Renders a drawer when one is provided in props', () => {
  const renderDrawer = () => <div>Simple drawer contents</div>;
  const { getByText, getByRole } = render(
    <CodeMirrorComponent initialText="Some text" renderDrawer={renderDrawer} />,
    container
  );
  const drawerText = getByText(/simple drawer contents/i);
  const collapseButton = getByRole('button', { name: /collapse/i });
  expect(collapseButton).toBeInTheDocument();
  expect(drawerText).toBeInTheDocument();
});

it('Drawer can be collapsed and expanded', async () => {
  const renderDrawer = () => <div>Simple drawer contents</div>;
  const { getByRole, queryByRole, getByTestId } = render(
    <CodeMirrorComponent initialText="Some text" renderDrawer={renderDrawer} />,
    container
  );
  let drawer = getByTestId('editor-drawer');
  let expandButton = queryByRole('button', { name: /expand/i });
  expect(drawer.firstChild).toBeVisible(); // Drawer visible
  expect(expandButton).not.toBeInTheDocument();

  // Click collapse and drawer is collapsed (visibility: hidden)
  const collapseButton = getByRole('button', { name: /collapse/i });
  fireEvent.click(collapseButton);
  expandButton = getByRole('button', { name: /expand/i });
  await wait(() => {
    expect(drawer.firstChild).not.toBeVisible(); // Drawer is not visible, but still in DOM so can't check that it's not in document
    expect(expandButton).toBeInTheDocument(); // Expand button is rendered when drawer hidden
  });

  // Click expand and drawer is opened again
  fireEvent.click(expandButton);
  expandButton = queryByRole('button', { name: /expand/i });
  await wait(() => {
    expect(drawer.firstChild).toBeVisible(); // Drawer is visible again
    expect(expandButton).not.toBeInTheDocument(); // Expand button removed
  });
});

it('Does not renders a drawer or expand button when one is not provided in props', () => {
  // No renderDrawer prop passed in
  const { queryByRole } = render(<CodeMirrorComponent initialText="Some text" />, container);
  const expandButton = queryByRole('button', { name: /expand/i });
  const collapseButton = queryByRole('button', { name: /collapse/i });
  expect(expandButton).not.toBeInTheDocument();
  expect(collapseButton).not.toBeInTheDocument();
});
