import React from 'react';
import '@testing-library/jest-dom/extend-expect';
import 'fake-indexeddb/auto';
import { unmountComponentAtNode } from 'react-dom';
import { act } from 'react-dom/test-utils';
import { render, wait, fireEvent } from '@testing-library/react';
import FSHControls from '../../components/FSHControls';
import * as fshHelpers from '../../utils/FSHHelpers';
import * as bitlyWorker from '../../utils/BitlyWorker';

// Mock copy to clipboard since we don't need to test the component itself
jest.mock('copy-to-clipboard', () => {
  return jest.fn();
});

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
    render(<FSHControls onClick={onClick} resetLogMessages={resetLogMessages} />, container);
  });
  const button = document.querySelector('[testid=Button]');
  act(() => {
    button.dispatchEvent(new MouseEvent('click', { bubbles: true }));
  });

  await wait(() => {
    expect(resetLogMessages).toHaveBeenCalledTimes(1);
    expect(runSUSHISpy).toHaveBeenCalled();
    expect(onClick).toHaveBeenCalledTimes(2);
    expect(onClick).toHaveBeenCalledWith(true, [''], false, true); // Loading
    expect(onClick).toHaveBeenCalledWith(true, [''], false, false);
  });
});

it('calls runSUSHI and changes the doRunSUSHI variable onClick, exhibits an empty package', async () => {
  const onClick = jest.fn();
  const resetLogMessages = jest.fn();
  const runSUSHISpy = jest.spyOn(fshHelpers, 'runSUSHI').mockReset().mockResolvedValue(emptySUSHIPackage);

  act(() => {
    render(<FSHControls onClick={onClick} resetLogMessages={resetLogMessages} />, container);
  });
  const button = document.querySelector('[testid=Button]');
  act(() => {
    button.dispatchEvent(new MouseEvent('click', { bubbles: true }));
  });

  await wait(() => {
    expect(resetLogMessages).toHaveBeenCalledTimes(1);
    expect(runSUSHISpy).toHaveBeenCalled();
    expect(onClick).toHaveBeenCalledTimes(2);
    expect(onClick).toHaveBeenCalledWith(true, [''], false, true); // Loading
    expect(onClick).toHaveBeenCalledWith(true, [''], false, false);
  });
});

it('calls runSUSHI and changes the doRunSUSHI variable onClick, exhibits a good package', async () => {
  const onClick = jest.fn();
  const resetLogMessages = jest.fn();
  const runSUSHISpy = jest.spyOn(fshHelpers, 'runSUSHI').mockReset().mockResolvedValue(goodSUSHIPackage);

  act(() => {
    render(<FSHControls onClick={onClick} resetLogMessages={resetLogMessages} />, container);
  });
  const button = document.querySelector('[testid=Button]');
  act(() => {
    button.dispatchEvent(new MouseEvent('click', { bubbles: true }));
  });

  await wait(() => {
    expect(resetLogMessages).toHaveBeenCalledTimes(1);
    expect(runSUSHISpy).toHaveBeenCalled();
    expect(onClick).toHaveBeenCalledTimes(2);
    expect(onClick).toHaveBeenCalledWith(true, [''], false, true); // Loading
    expect(onClick).toHaveBeenCalledWith(true, JSON.stringify(goodSUSHIPackage, null, 2), true, false);
  });
});

it('calls GoFSH function and returns FSH', async () => {
  const simpleFsh = ['Instance: MyPatient', 'InstanceOf: Patient', 'Usage: #example', '* gender = #female'].join('\n');
  const onGoFSHClick = jest.fn();
  const resetLogMessages = jest.fn();
  const runGoFSHSpy = jest.spyOn(fshHelpers, 'runGoFSH').mockReset().mockResolvedValue(simpleFsh);

  act(() => {
    render(<FSHControls onGoFSHClick={onGoFSHClick} gofshText={[]} resetLogMessages={resetLogMessages} />, container);
  });
  const button = document.querySelector('[testid=GoFSH-button]');
  act(() => {
    button.dispatchEvent(new MouseEvent('click', { bubbles: true }));
  });

  await wait(() => {
    expect(resetLogMessages).toHaveBeenCalledTimes(1);
    expect(runGoFSHSpy).toHaveBeenCalled();
    expect(onGoFSHClick).toHaveBeenCalledTimes(2);
    expect(onGoFSHClick).toHaveBeenCalledWith('', true); // Loading
    expect(onGoFSHClick).toHaveBeenCalledWith(simpleFsh, false);
  });
});

it('uses user provided canonical when calling runSUSHI', async () => {
  const onClick = jest.fn();
  const resetLogMessages = jest.fn();
  const runSUSHISpy = jest.spyOn(fshHelpers, 'runSUSHI').mockReset().mockResolvedValue(goodSUSHIPackage);

  const { getByText, getByLabelText } = render(
    <FSHControls onClick={onClick} resetLogMessages={resetLogMessages} />,
    container
  );

  const configButton = getByText('Configuration');
  fireEvent.click(configButton);
  const canonicalInput = getByLabelText('Canonical URL');
  expect(canonicalInput.value).toEqual('http://example.org'); // Default

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

  const { getByText, getByLabelText } = render(
    <FSHControls onClick={onClick} resetLogMessages={resetLogMessages} />,
    container
  );

  const configButton = getByText('Configuration');
  fireEvent.click(configButton);
  const canonicalInput = getByLabelText('Version');
  expect(canonicalInput.value).toEqual('1.0.0'); // Default

  fireEvent.change(canonicalInput, { target: { value: '2.0.0' } });

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

  const { getByText, getByLabelText } = render(
    <FSHControls onClick={onClick} resetLogMessages={resetLogMessages} />,
    container
  );

  const configButton = getByText('Configuration');
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

it('copies link to clipboard on button click', async () => {
  const onClick = jest.fn();
  const resetLogMessages = jest.fn();
  const generateLinkSpy = jest
    .spyOn(bitlyWorker, 'generateLink')
    .mockReset()
    .mockResolvedValue({ link: 'success', errorNeeded: false });

  const { getByText } = render(
    <FSHControls onClick={onClick} fshText={'Edit FSH Here'} resetLogMessages={resetLogMessages} />,
    container
  );

  await wait(() => {
    const shareButton = getByText('Share FSH');
    fireEvent.click(shareButton);
    expect(generateLinkSpy).toHaveBeenCalled();
  });

  const copyBtn = getByText('Copy to Clipboard');
  fireEvent.click(copyBtn);
  const linkCopiedBtn = getByText('Link Copied');
  expect(linkCopiedBtn).toBeDefined();
});

it('generates link when share button is clicked', async () => {
  const onClick = jest.fn();
  const resetLogMessages = jest.fn();
  const generateLinkSpy = jest
    .spyOn(bitlyWorker, 'generateLink')
    .mockReset()
    .mockResolvedValue({ link: 'success', errorNeeded: false });

  const { getByText } = render(
    <FSHControls onClick={onClick} fshText={'Edit FSH Here'} resetLogMessages={resetLogMessages} />,
    container
  );

  act(() => {
    const shareButton = getByText('Share FSH');
    fireEvent.click(shareButton);
  });
  await wait(() => {
    expect(generateLinkSpy).toHaveBeenCalled();
  });
});

it('shows an error when the FSH file is too long to share', async () => {
  const onClick = jest.fn();
  const resetLogMessages = jest.fn();
  const generateLinkSpy = jest
    .spyOn(bitlyWorker, 'generateLink')
    .mockReset()
    .mockResolvedValue({ link: undefined, errorNeeded: true });

  const { getByText } = render(
    <FSHControls onClick={onClick} fshText={'Edit FSH Here'} resetLogMessages={resetLogMessages} />,
    container
  );
  act(() => {
    const shareButton = getByText('Share FSH');
    fireEvent.click(shareButton);
  });
  await wait(() => {
    const swimBtn = getByText(/Keep Swimming!/i);
    expect(swimBtn).toBeInTheDocument();
    expect(generateLinkSpy).toHaveBeenCalled();
  });
});
