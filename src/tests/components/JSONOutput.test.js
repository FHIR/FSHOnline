import React from 'react';
import { render } from '@testing-library/react';
import { unmountComponentAtNode } from 'react-dom';
import JSONOutput from '../../components/JSONOutput';

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

it('Renders with the default heading if displaySUSHI is false', () => {
  // Initial case, nothing from SUSHI is displayed
  const { getByText, queryByText } = render(
    <JSONOutput displaySUSHI={false} text={'Hello World'} errors={[]} />,
    container
  );
  const headerElement = getByText(/SUSHI Output/i);
  const resultsElement = queryByText(/Results/i);
  const errorsElement = queryByText(/Errors/i);

  expect(headerElement).toBeInTheDocument();
  expect(resultsElement).not.toBeInTheDocument();
  expect(errorsElement).not.toBeInTheDocument();
});

it('Renders with the proper heading and updates with proper text when not an object', () => {
  const { getByText, queryByText } = render(
    <JSONOutput displaySUSHI={true} text={'Hello World'} isObject={false} errors={[]} />,
    container
  );
  const resultsElement = queryByText(/Results/i);
  const errorsElement = queryByText(/Errors/i);
  const textElement = getByText(/Hello World/i);

  expect(resultsElement).not.toBeInTheDocument();
  expect(errorsElement).not.toBeInTheDocument();
  expect(textElement).toBeInTheDocument(); // Mimics the 'loading...' case
});

it('Renders with the proper headings when text is an object (SUSHI Package)', () => {
  const { getByText, queryByText } = render(
    <JSONOutput displaySUSHI={true} text={JSON.stringify({ profiles: [] })} isObject={true} errors={[]} />,
    container
  );
  const resultsElement = getByText(/Results/i);
  const errorsElement = queryByText(/Errors/i);

  expect(resultsElement).toBeInTheDocument(); // isObject is true so results are printed
  expect(errorsElement).not.toBeInTheDocument(); // No errors
});

it('Renders error messages if present', () => {
  const { getByText } = render(
    <JSONOutput
      displaySUSHI={true}
      isObject={false}
      text={'Hello World'}
      errors={['error Unexpected input', 'error Something else wrong']}
    />,
    container
  );
  const errorHeading = getByText(/Errors/);
  const firstError = getByText(/Unexpected input/);
  const secondError = getByText(/Something else wrong/);

  expect(errorHeading).toBeInTheDocument();
  expect(firstError).toBeInTheDocument();
  expect(secondError).toBeInTheDocument();
});
