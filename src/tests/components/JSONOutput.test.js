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

it('Renders with the placeholder text if showNewText is false and no text', () => {
  // Initial case, nothing from SUSHI is displayed
  const { getByText } = render(<JSONOutput showNewText={false} text={''} />, container);

  const placeholderText = getByText('Write FHIR definitions here...');

  expect(placeholderText).toBeInTheDocument();
});

it('Renders with the proper text and updates with proper text when loading', () => {
  const { getByText } = render(<JSONOutput showNewText={false} text={''} isWaiting={true} />, container);

  const loadingPlaceholderText = getByText('Loading...');

  expect(loadingPlaceholderText).toBeInTheDocument();
});

// TODO: CodeMirrorComponent doesn't get the package text properly - not sure why
it.skip('Renders with the first profile when text is an object (SUSHI Package)', async () => {
  const { getByText } = render(
    <JSONOutput
      showNewText={true}
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
      isWaiting={true}
      updateTextValue={(text) => text}
      setShowNewText={() => {}}
    />,
    container
  );

  // Because the editor is in JSON mode, the text is split up differently than the fsh mode
  const resultsElement = getByText(
    (content, element) => element.tagName.toLowerCase() === 'span' && content.startsWith('resourceType')
  );
  expect(resultsElement).toBeInTheDocument(); // showNewText is true so results are printed
  expect(resultsElement.parentNode.text).toEqual();
});

it('Renders an Add Definition button that adds a blank definition', () => {
  const simpleProfile = {
    profiles: [
      {
        resourceType: 'StructureDefinition',
        id: 'SimpleProfile'
      }
    ],
    extensions: [],
    instances: [],
    valueSets: [],
    codeSystems: []
  };
  const { getByText, queryByText } = render(
    <JSONOutput
      showNewText={true}
      setShowNewText={() => {}}
      isWaiting={false}
      updateTextValue={() => {}}
      text={JSON.stringify(simpleProfile, null, 2)}
    />,
    container
  );

  const addButton = getByText('Add FHIR Definition');
  let placeholderText = queryByText('Write FHIR definitions here...');
  expect(addButton).toBeInTheDocument();
  expect(placeholderText).not.toBeInTheDocument();

  fireEvent.click(addButton);

  // Add clears out the editor for a new blank definition and displays placeholder text
  placeholderText = queryByText('Write FHIR definitions here...');
  expect(placeholderText).toBeInTheDocument();
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
        showNewText={true}
        setShowNewText={() => {}}
        isWaiting={false}
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
        showNewText={true}
        setShowNewText={() => {}}
        isWaiting={false}
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

  it('displays Untitled if a definition does not have an id', () => {
    const profileWithoutId = {
      profiles: [
        {
          resourceType: 'StructureDefinition'
          // No id field - this is to represent the case when someone removed or never included an id. SUSHI packages should always have ids.
        }
      ],
      extensions: [],
      instances: [],
      valueSets: [],
      codeSystems: []
    };
    const { getByText } = render(
      <JSONOutput
        showNewText={true}
        setShowNewText={() => {}}
        isWaiting={false}
        updateTextValue={() => {}}
        text={JSON.stringify(profileWithoutId, null, 2)}
      />,
      container
    );

    const untitledDef = getByText('Untitled');
    expect(untitledDef).toBeInTheDocument();
  });

  it('renders a delete button that opens a confirmation and then deletes the definition', async () => {
    const updateText = jest.fn();
    const simplePackage = {
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
      extensions: [],
      instances: [],
      valueSets: [],
      codeSystems: []
    };
    const stringifiedPackageAfterDelete = [
      { resourceType: 'StructureDefinition', id: 'ProfileA', def: JSON.stringify(sushiPackage.profiles[0], null, 2) }
    ];

    const { getByTestId, queryByText } = render(
      <JSONOutput
        showNewText={true}
        setShowNewText={() => {}}
        isWaiting={false}
        updateTextValue={updateText}
        text={JSON.stringify(simplePackage, null, 2)}
      />,
      container
    );

    const profileBDelete = getByTestId('ProfileB-delete-button');
    expect(profileBDelete).toBeInTheDocument();
    let deleteButton = queryByText('Delete');
    expect(deleteButton).not.toBeInTheDocument();

    // Clicking the delete icon on a profile opens the modal for that definition
    fireEvent.click(profileBDelete);
    deleteButton = queryByText('Delete');
    expect(deleteButton).toBeInTheDocument();
    const dialogBox = deleteButton.parentNode.parentNode.parentNode; // Not sure why this can't be selected with a label
    expect(dialogBox.textContent).toContain(
      'Are you sure you want to delete the FHIR definition StructureDefinition/ProfileB?'
    );

    // Clicking delete confirmation deletes the definition
    updateText.mockReset();
    fireEvent.click(deleteButton);
    expect(updateText).toHaveBeenCalledTimes(1);
    expect(updateText).toHaveBeenCalledWith(stringifiedPackageAfterDelete);
  });
});
