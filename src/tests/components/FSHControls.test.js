import React from 'react';
import '@testing-library/jest-dom/extend-expect';
import 'fake-indexeddb/auto';
import { unmountComponentAtNode } from 'react-dom';
import { act } from 'react-dom/test-utils';
import { render, wait, fireEvent } from '@testing-library/react';
import FSHControls from '../../components/FSHControls';
import * as fshHelpers from '../../utils/FSHHelpers';

const badSUSHIPackage = { a: '1', b: '2' };
const emptySUSHIPackage = { config: {}, profiles: [], extensions: [], instances: [], valueSets: [], codeSystems: [] };
const goodSUSHIPackage = {
  profiles: [{ resourceType: 'StructureDefinition', id: 'fish-patient' }],
  extensions: [],
  instances: [],
  valueSets: [],
  codeSystems: []
};

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

it('calls runSUSHI and changes the doRunSUSHI variable onClick, exhibits a bad package', async () => {
  const onClick = jest.fn();
  const resetLogMessages = jest.fn();
  const runSUSHISpy = jest.spyOn(fshHelpers, 'runSUSHI').mockReset().mockResolvedValue(badSUSHIPackage);

  act(() => {
    render(<FSHControls onSUSHIClick={onClick} resetLogMessages={resetLogMessages} exampleConfig={{}} />, container);
  });
  const button = document.querySelector('[testid=Button]');
  act(() => {
    button.dispatchEvent(new MouseEvent('click', { bubbles: true }));
  });

  await wait(() => {
    expect(resetLogMessages).toHaveBeenCalledTimes(1);
    expect(runSUSHISpy).toHaveBeenCalled();
    expect(onClick).toHaveBeenCalledTimes(2);
    expect(onClick).toHaveBeenCalledWith(true, [''], true); // Loading
    expect(onClick).toHaveBeenCalledWith(true, [''], false);
  });
});

it('calls runSUSHI and changes the doRunSUSHI variable onClick, exhibits an empty package', async () => {
  const onClick = jest.fn();
  const resetLogMessages = jest.fn();
  const runSUSHISpy = jest.spyOn(fshHelpers, 'runSUSHI').mockReset().mockResolvedValue(emptySUSHIPackage);

  act(() => {
    render(<FSHControls onSUSHIClick={onClick} resetLogMessages={resetLogMessages} exampleConfig={{}} />, container);
  });
  const button = document.querySelector('[testid=Button]');
  act(() => {
    button.dispatchEvent(new MouseEvent('click', { bubbles: true }));
  });

  await wait(() => {
    expect(resetLogMessages).toHaveBeenCalledTimes(1);
    expect(runSUSHISpy).toHaveBeenCalled();
    expect(onClick).toHaveBeenCalledTimes(2);
    expect(onClick).toHaveBeenCalledWith(true, [''], true); // Loading
    expect(onClick).toHaveBeenCalledWith(true, [''], false);
  });
});

it('calls runSUSHI and changes the doRunSUSHI variable onClick, exhibits a good package', async () => {
  const onClick = jest.fn();
  const resetLogMessages = jest.fn();
  const runSUSHISpy = jest.spyOn(fshHelpers, 'runSUSHI').mockReset().mockResolvedValue(goodSUSHIPackage);

  act(() => {
    render(<FSHControls onSUSHIClick={onClick} resetLogMessages={resetLogMessages} exampleConfig={{}} />, container);
  });
  const button = document.querySelector('[testid=Button]');
  act(() => {
    button.dispatchEvent(new MouseEvent('click', { bubbles: true }));
  });

  await wait(() => {
    expect(resetLogMessages).toHaveBeenCalledTimes(1);
    expect(runSUSHISpy).toHaveBeenCalled();
    expect(onClick).toHaveBeenCalledTimes(2);
    expect(onClick).toHaveBeenCalledWith(true, [''], true); // Loading
    expect(onClick).toHaveBeenCalledWith(true, JSON.stringify(goodSUSHIPackage, null, 2), false);
  });
});

it('calls GoFSH function and returns FSH', async () => {
  const examplePatient = {
    resourceType: 'Patient',
    id: 'MyPatient',
    gender: 'female'
  };
  const simpleFsh = ['Instance: MyPatient', 'InstanceOf: Patient', 'Usage: #example', '* gender = #female'].join('\n');
  const onGoFSHClick = jest.fn();
  const resetLogMessages = jest.fn();
  const runGoFSHSpy = jest.spyOn(fshHelpers, 'runGoFSH').mockReset().mockResolvedValue({ fsh: simpleFsh, config: {} });

  act(() => {
    render(
      <FSHControls
        onGoFSHClick={onGoFSHClick}
        gofshText={[{ def: JSON.stringify(examplePatient, null, 2) }]}
        resetLogMessages={resetLogMessages}
        exampleConfig={{}}
      />,
      container
    );
  });
  const button = document.querySelector('[testid=GoFSH-button]');
  act(() => {
    button.dispatchEvent(new MouseEvent('click', { bubbles: true }));
  });

  await wait(() => {
    expect(resetLogMessages).toHaveBeenCalledTimes(1);
    expect(runGoFSHSpy).toHaveBeenCalledWith([JSON.stringify(examplePatient, null, 2)], { dependencies: [] }); // No IG resource added because canonical and version set to defaults
    expect(onGoFSHClick).toHaveBeenCalledTimes(2);
    expect(onGoFSHClick).toHaveBeenCalledWith('', true); // Loading
    expect(onGoFSHClick).toHaveBeenCalledWith(simpleFsh, false);
  });
});

it('calls GoFSH with user provided canonical and version in mini ImplementationGuide resource if either are set', async () => {
  const examplePatient = {
    resourceType: 'Patient',
    id: 'MyPatient',
    gender: 'female'
  };
  const simpleFsh = ['Instance: MyPatient', 'InstanceOf: Patient', 'Usage: #example', '* gender = #female'].join('\n');
  const onGoFSHClick = jest.fn();
  const resetLogMessages = jest.fn();
  const runGoFSHSpy = jest.spyOn(fshHelpers, 'runGoFSH').mockReset().mockResolvedValue({ fsh: simpleFsh, config: {} });
  const { getByRole, getByLabelText } = render(
    <FSHControls
      onGoFSHClick={onGoFSHClick}
      gofshText={[{ def: JSON.stringify(examplePatient, null, 2) }]}
      resetLogMessages={resetLogMessages}
      exampleConfig={{}}
    />,
    container
  );

  const configButton = getByRole('button', { name: /Configuration/i });
  fireEvent.click(configButton);
  const canonicalInput = getByLabelText('Canonical URL');
  expect(canonicalInput.value).toEqual(''); // Default
  fireEvent.change(canonicalInput, { target: { value: 'http://other.org' } });
  const versionInput = getByLabelText('Version');
  expect(versionInput.value).toEqual(''); // Default
  fireEvent.change(versionInput, { target: { value: '2.0.0' } });

  const button = document.querySelector('[testid=GoFSH-button]');
  act(() => {
    button.dispatchEvent(new MouseEvent('click', { bubbles: true }));
  });

  const expectedIgResource = {
    resourceType: 'ImplementationGuide',
    fhirVersion: ['4.0.1'],
    id: '1',
    url: 'http://other.org/ImplementationGuide/1',
    version: '2.0.0'
  };

  await wait(() => {
    expect(resetLogMessages).toHaveBeenCalledTimes(1);
    expect(runGoFSHSpy).toHaveBeenCalledWith(
      [JSON.stringify(examplePatient, null, 2), JSON.stringify(expectedIgResource, null, 2)], // Adds IG resource with canonical and version
      { dependencies: [] }
    );
    expect(onGoFSHClick).toHaveBeenCalledTimes(2);
    expect(onGoFSHClick).toHaveBeenCalledWith('', true); // Loading
    expect(onGoFSHClick).toHaveBeenCalledWith(simpleFsh, false);
  });
});

it('uses user provided canonical when calling runSUSHI', async () => {
  const onClick = jest.fn();
  const resetLogMessages = jest.fn();
  const runSUSHISpy = jest.spyOn(fshHelpers, 'runSUSHI').mockReset().mockResolvedValue(goodSUSHIPackage);

  const { getByRole, getByLabelText } = render(
    <FSHControls onSUSHIClick={onClick} resetLogMessages={resetLogMessages} exampleConfig={{}} />,
    container
  );

  const configButton = getByRole('button', { name: /Configuration/i });
  fireEvent.click(configButton);
  const canonicalInput = getByLabelText('Canonical URL');
  expect(canonicalInput.value).toEqual(''); // Default

  fireEvent.change(canonicalInput, { target: { value: 'http://other.org' } });

  const button = document.querySelector('[testid=Button]');
  act(() => {
    button.dispatchEvent(new MouseEvent('click', { bubbles: true }));
  });

  const expectedConfig = {
    canonical: 'http://other.org',
    version: '1.0.0',
    FSHOnly: true,
    fhirVersion: ['4.0.1']
  };
  await wait(() => {
    expect(runSUSHISpy).toHaveBeenCalledWith(undefined, expectedConfig, []); // Includes new config
  });
});

it('uses user provided version when calling runSUSHI', async () => {
  const onClick = jest.fn();
  const resetLogMessages = jest.fn();
  const runSUSHISpy = jest.spyOn(fshHelpers, 'runSUSHI').mockReset().mockResolvedValue(goodSUSHIPackage);

  const { getByRole, getByLabelText } = render(
    <FSHControls onSUSHIClick={onClick} resetLogMessages={resetLogMessages} exampleConfig={{}} />,
    container
  );

  const configButton = getByRole('button', { name: /Configuration/i });
  fireEvent.click(configButton);
  const versionInput = getByLabelText('Version');
  expect(versionInput.value).toEqual(''); // Default

  fireEvent.change(versionInput, { target: { value: '2.0.0' } });

  const button = document.querySelector('[testid=Button]');
  act(() => {
    button.dispatchEvent(new MouseEvent('click', { bubbles: true }));
  });

  const expectedConfig = {
    canonical: 'http://example.org',
    version: '2.0.0',
    FSHOnly: true,
    fhirVersion: ['4.0.1']
  };

  await wait(() => {
    expect(runSUSHISpy).toHaveBeenCalledWith(undefined, expectedConfig, []); // Includes new version
  });
});

it('uses user provided dependencies when calling runSUSHI', async () => {
  const onClick = jest.fn();
  const resetLogMessages = jest.fn();
  const runSUSHISpy = jest.spyOn(fshHelpers, 'runSUSHI').mockReset().mockResolvedValue(goodSUSHIPackage);

  const { getByRole, getByLabelText } = render(
    <FSHControls onSUSHIClick={onClick} resetLogMessages={resetLogMessages} exampleConfig={{}} />,
    container
  );

  const configButton = getByRole('button', { name: /Configuration/i });
  fireEvent.click(configButton);
  const dependencyInput = getByLabelText('Dependencies');
  expect(dependencyInput.value).toEqual(''); // Default

  fireEvent.change(dependencyInput, { target: { value: 'hl7.fhir.us.core#3.1.1, hello#123' } });

  const button = document.querySelector('[testid=Button]');
  act(() => {
    button.dispatchEvent(new MouseEvent('click', { bubbles: true }));
  });

  const defaultConfig = { FSHOnly: true, canonical: 'http://example.org', fhirVersion: ['4.0.1'], version: '1.0.0' };

  const expectedDependencyArr = [
    ['hl7.fhir.us.core', '3.1.1'],
    ['hello', '123']
  ];

  await wait(() => {
    expect(runSUSHISpy).toHaveBeenCalledWith(undefined, defaultConfig, expectedDependencyArr); // Called with new dependencies
  });
});

it('should not call runSUSHI while waiting for SUSHI or GoFSH', async () => {
  const onClick = jest.fn();
  const resetLogMessages = jest.fn();
  const runSUSHISpy = jest.spyOn(fshHelpers, 'runSUSHI').mockReset().mockResolvedValue(badSUSHIPackage);
  const manifestArr = [
    { id: 'manifestObj-1', name: 'manifestObj-1' },
    { id: 'manifestObj-2', name: 'manifestObj-2' }
  ];
  const metadataObj = {
    'manifestObj-1': { name: 'manifestObj-1', description: 'First manifest object' },
    'manifestObj-2': { name: 'manifestObj-2', description: 'Second manifest object' }
  };

  act(() => {
    render(
      <FSHControls
        onSUSHIClick={onClick}
        resetLogMessages={resetLogMessages}
        isWaiting={true}
        exampleConfig={manifestArr}
        exampleMetadata={metadataObj}
      />,
      container
    );
  });
  const button = document.querySelector('[testid=Button]');
  act(() => {
    button.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    button.dispatchEvent(new MouseEvent('click', { bubbles: true }));
  });

  await wait(() => {
    expect(runSUSHISpy).toHaveBeenCalledTimes(0);
  });
});

it('should not call runGoFSH while waiting for SUSHI or GoFSH', async () => {
  const onGoFSHClick = jest.fn();
  const resetLogMessages = jest.fn();
  const runGoFSHSpy = jest.spyOn(fshHelpers, 'runGoFSH').mockReset().mockResolvedValue({ fsh: '', config: {} });
  const manifestArr = [
    { id: 'manifestObj-1', name: 'manifestObj-1' },
    { id: 'manifestObj-2', name: 'manifestObj-2' }
  ];
  const metadataObj = {
    'manifestObj-1': { name: 'manifestObj-1', description: 'First manifest object' },
    'manifestObj-2': { name: 'manifestObj-2', description: 'Second manifest object' }
  };

  act(() => {
    render(
      <FSHControls
        onGoFSHClick={onGoFSHClick}
        resetLogMessages={resetLogMessages}
        isWaiting={true}
        exampleConfig={manifestArr}
        exampleMetadata={metadataObj}
      />,
      container
    );
  });

  const button = document.querySelector('[testid=GoFSH-button]');
  act(() => {
    button.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    button.dispatchEvent(new MouseEvent('click', { bubbles: true }));
  });

  await wait(() => {
    expect(runGoFSHSpy).toHaveBeenCalledTimes(0);
  });
});
