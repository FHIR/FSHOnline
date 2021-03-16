import React from 'react';
import { render, fireEvent } from '@testing-library/react';
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

it('Renders with the placeholder text if displaySUSHI is false, isObject is false, and no text', () => {
  // Initial case, nothing from SUSHI is displayed
  const { getByText } = render(
    <JSONOutput displaySUSHI={false} isObject={false} text={''} errorsAndWarnings={[]} />,
    container
  );

  // Because the editor is in JSON mode, the text is split up differently than the fsh mode
  const placeholderText = getByText('Edit and view FHIR Definitions here!');

  expect(placeholderText).toBeInTheDocument();
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

describe('file tree display', () => {
  let sushiPackage;
  beforeAll(() => {
    sushiPackage = {
      profiles: [
        {
          resourceType: 'StructureDefinition',
          id: 'ProfileA'
        },
        {
          resourceType: 'StructureDefinition',
          id: 'ProfileB'
        }
      ],
      extensions: [
        {
          resourceType: 'StructureDefinition',
          id: 'ExtensionA'
        }
      ],
      instances: [
        {
          resourceType: 'Patient',
          id: 'MyPatient'
        },
        {
          resourceType: 'Observation',
          id: 'AnObservationExample'
        }
      ],
      valueSets: [
        {
          resourceType: 'ValueSet',
          id: 'MyValueSet'
        }
      ],
      codeSystems: [
        {
          resourceType: 'CodeSystem',
          id: 'MyCS'
        }
      ]
    };
  });

  it('renders a list of JSON definitions in a file tree', () => {
    const { getAllByTestId } = render(
      <JSONOutput
        displaySUSHI={true}
        isObject={true}
        isWaiting={false}
        setIsOutputObject={() => {}}
        updateTextValue={() => {}}
        text={JSON.stringify(sushiPackage, null, 2)}
      />,
      container
    );

    const sdList = getAllByTestId('StructureDefinitions-defId');
    const vsList = getAllByTestId('ValueSets-defId');
    const csList = getAllByTestId('CodeSystems-defId');
    const instanceList = getAllByTestId('Instances-defId');

    expect(sdList).toHaveLength(3); // Profiles and Extensions grouped together
    expect(sdList[0].textContent).toEqual('ExtensionA'); // Sorted alphabetically
    expect(sdList[1].textContent).toEqual('ProfileA');
    expect(sdList[2].textContent).toEqual('ProfileB');

    expect(vsList).toHaveLength(1); // VS get their own category
    expect(vsList[0].textContent).toEqual('MyValueSet');

    expect(csList).toHaveLength(1); // CS get their own category
    expect(csList[0].textContent).toEqual('MyCS');

    expect(instanceList).toHaveLength(2); // All other resourceTypes are grouped to Instances
    expect(instanceList[0].textContent).toEqual('AnObservationExample'); // Sorted alphabetically
    expect(instanceList[1].textContent).toEqual('MyPatient');
  });

  it('resets currentDef and initialText of editor when a new definition is clicked', () => {
    const { getByText } = render(
      <JSONOutput
        displaySUSHI={true}
        isObject={true}
        isWaiting={false}
        setIsOutputObject={() => {}}
        updateTextValue={() => {}}
        text={JSON.stringify(sushiPackage, null, 2)}
      />,
      container
    );

    const extensionDef = getByText('ExtensionA');
    expect(extensionDef.className).toContain('listItem');
    expect(extensionDef.className).not.toContain('listItemSelected');
    fireEvent.click(extensionDef);
    expect(extensionDef.className).toContain('listItemSelected');
    // Can also test that the text in the editor updates when we can access the text correctly
  });
});
