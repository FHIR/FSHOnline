import React from 'react';
import { render } from '@testing-library/react';
import { unmountComponentAtNode } from 'react-dom';
import JSONOutput from '../../components/JSONOutput';

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

it('Renders with the default text if displaySUSHI is false', () => {
  // Initial case, nothing from SUSHI is displayed
  const { getByText } = render(
    <JSONOutput displaySUSHI={false} text={'Hello World'} errorsAndWarnings={[]} />,
    container
  );

  // Because the editor is in JSON mode, the text is split up differently than the fsh mode
  const headerElement = getByText(
    (content, element) => element.tagName.toLowerCase() === 'span' && content.startsWith('Hello')
  );

  expect(headerElement).toBeInTheDocument();
  expect(headerElement.parentNode.textContent).toEqual('Hello World');
});

it('Renders with the proper text and updates with proper text when not an object', () => {
  const { getByText } = render(
    <JSONOutput displaySUSHI={true} text={'Loading...'} isObject={false} errorsAndWarnings={[]} isWaiting={true} />,
    container
  );
  const textElement = getByText(
    (content, element) => element.tagName.toLowerCase() === 'span' && content.startsWith('Loading')
  );

  expect(textElement).toBeInTheDocument(); // Mimics the 'loading...' case
  expect(textElement.parentNode.textContent).toEqual('Loading...');
});

// TODO: CodeMirrorComponent doesn't get the package text properly - not sure why
it.skip('Renders with the first profile when text is an object (SUSHI Package)', async () => {
  const { getByText } = render(
    <JSONOutput
      displaySUSHI={true}
      text={JSON.stringify(
        {
          profiles: [
            {
              resourceType: 'StructureDefinition',
              id: 'A'
            }
          ],
          extensions: [],
          instances: [],
          valueSets: [],
          codeSystems: []
        },
        null,
        2
      )}
      isObject={true}
      isWaiting={true}
      errorsAndWarnings={[]}
      updateTextValue={(text) => text}
      setIsOutputObject={() => {}}
    />,
    container
  );

  const resultsElement = getByText(
    (content, element) => element.tagName.toLowerCase() === 'span' && content.startsWith('resourceType')
  );
  expect(resultsElement).toBeInTheDocument(); // isObject is true so results are printed
  expect(resultsElement.parentNode.text).toEqual();
});
