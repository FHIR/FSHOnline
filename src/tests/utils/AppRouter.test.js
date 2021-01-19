import React from 'react';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import AppRouter from '../../utils/AppRouter';

jest.mock('../../App', () => () => <div>Mock FSH Online</div>);

test('Renders FSH Online App when visiting /FSHOnline', () => {
  const { getByText } = render(
    <MemoryRouter initialEntries={['/FSHOnline']}>
      <AppRouter />
    </MemoryRouter>
  );
  const linkElement = getByText(/Mock FSH Online/i);
  expect(linkElement).toBeInTheDocument();
});

test('Renders FSH Online App when visiting /FSHOnline/share/:id', () => {
  const { getByText } = render(
    <MemoryRouter initialEntries={['/FSHOnline/share/abcd']}>
      <AppRouter />
    </MemoryRouter>
  );
  const linkElement = getByText(/Mock FSH Online/i);
  expect(linkElement).toBeInTheDocument();
});
