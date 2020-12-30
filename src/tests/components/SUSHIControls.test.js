import React from 'react';
import * as runSUSHI from '../../utils/RunSUSHI';
import { sliceDependency } from '../../components/SUSHIControls';
import { act } from 'react-dom/test-utils';
import { render, wait, fireEvent } from '@testing-library/react';
import { unmountComponentAtNode } from 'react-dom';
import SUSHIControls from '../../components/SUSHIControls';
//import { generateLink } from '../../components/SUSHIControls';
import 'fake-indexeddb/auto';

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
  const runSUSHISpy = jest.spyOn(runSUSHI, 'runSUSHI').mockReset().mockResolvedValue(badSUSHIPackage);

  act(() => {
    render(<SUSHIControls onClick={onClick} resetLogMessages={resetLogMessages} />, container);
  });
  const button = document.querySelector('[testid=Button]');
  act(() => {
    button.dispatchEvent(new MouseEvent('click', { bubbles: true }));
  });

  await wait(() => {
    expect(resetLogMessages).toHaveBeenCalledTimes(1);
    expect(runSUSHISpy).toHaveBeenCalled();
    expect(onClick).toHaveBeenCalledTimes(2);
    expect(onClick).toHaveBeenCalledWith(true, 'Loading...', false);
    expect(onClick).toHaveBeenCalledWith(true, '', false);
  });
});

it('calls runSUSHI and changes the doRunSUSHI variable onClick, exhibits an empty package', async () => {
  const onClick = jest.fn();
  const resetLogMessages = jest.fn();
  const runSUSHISpy = jest.spyOn(runSUSHI, 'runSUSHI').mockReset().mockResolvedValue(emptySUSHIPackage);

  act(() => {
    render(<SUSHIControls onClick={onClick} resetLogMessages={resetLogMessages} />, container);
  });
  const button = document.querySelector('[testid=Button]');
  act(() => {
    button.dispatchEvent(new MouseEvent('click', { bubbles: true }));
  });

  await wait(() => {
    expect(resetLogMessages).toHaveBeenCalledTimes(1);
    expect(runSUSHISpy).toHaveBeenCalled();
    expect(onClick).toHaveBeenCalledTimes(2);
    expect(onClick).toHaveBeenCalledWith(true, 'Loading...', false);
    expect(onClick).toHaveBeenCalledWith(true, '', false);
  });
});

it('calls runSUSHI and changes the doRunSUSHI variable onClick, exhibits a good package', async () => {
  const onClick = jest.fn();
  const resetLogMessages = jest.fn();
  const runSUSHISpy = jest.spyOn(runSUSHI, 'runSUSHI').mockReset().mockResolvedValue(goodSUSHIPackage);

  act(() => {
    render(<SUSHIControls onClick={onClick} resetLogMessages={resetLogMessages} />, container);
  });
  const button = document.querySelector('[testid=Button]');
  act(() => {
    button.dispatchEvent(new MouseEvent('click', { bubbles: true }));
  });

  await wait(() => {
    expect(resetLogMessages).toHaveBeenCalledTimes(1);
    expect(runSUSHISpy).toHaveBeenCalled();
    expect(onClick).toHaveBeenCalledTimes(2);
    expect(onClick).toHaveBeenCalledWith(true, 'Loading...', false);
    expect(onClick).toHaveBeenCalledWith(true, JSON.stringify(goodSUSHIPackage, null, 2), true);
  });
});

it('uses user provided canonical when calling runSUSHI', async () => {
  const onClick = jest.fn();
  const resetLogMessages = jest.fn();
  const runSUSHISpy = jest.spyOn(runSUSHI, 'runSUSHI').mockReset().mockResolvedValue(goodSUSHIPackage);

  const { getByText, getByLabelText } = render(
    <SUSHIControls onClick={onClick} resetLogMessages={resetLogMessages} />,
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
  const runSUSHISpy = jest.spyOn(runSUSHI, 'runSUSHI').mockReset().mockResolvedValue(goodSUSHIPackage);

  const { getByText, getByLabelText } = render(
    <SUSHIControls onClick={onClick} resetLogMessages={resetLogMessages} />,
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
  const runSUSHISpy = jest.spyOn(runSUSHI, 'runSUSHI').mockReset().mockResolvedValue(goodSUSHIPackage);

  const { getByText, getByLabelText } = render(
    <SUSHIControls onClick={onClick} resetLogMessages={resetLogMessages} />,
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
    expect(runSUSHISpy).toHaveBeenCalledWith(undefined, defaultConfig, expectedDependencyArr); // Includes new version
  });
});

describe('#sliceDependency()', () => {
  it('should correctly parse a given array of dependencies', () => {
    const input = 'hl7.fhir.us.core#3.1.1, , testing#123';
    const returnArr = sliceDependency(input);
    expect(returnArr).toEqual([
      ['hl7.fhir.us.core', '3.1.1'],
      ['testing', '123']
    ]);
  });

  it('should correctly parse an empty array of dependencies', () => {
    const input = '';
    const returnArr = sliceDependency(input);
    expect(returnArr).toEqual([]);
  });
});

// it('copies link to clipboard on button click', () => {
//   const onClick = jest.fn();
//   const resetLogMessages = jest.fn();
//   const generateLinkSpy = jest.spyOn(spy, 'generateLink').mockImplementation(() => {});
//   document.execCommand = jest.fn();

//   const { getByText } = render(<SUSHIControls onClick={onClick} resetLogMessages={resetLogMessages} />, container);

//   const shareButton = getByText('Share');
//   fireEvent.click(shareButton);
//   const copyButton = getByText('Copy to Clipboard');
//   fireEvent.click(copyButton);

//   expect(generateLinkSpy).toHaveBeenCalled();
//   expect(document.execCommand).toHaveBeenCalledWith('copy');
// });

// it('generates link when share button is clicked', () => {
//   const onClick = jest.fn();
//   const resetLogMessages = jest.fn();
//   const generateLinkSpy = jest
//     .spyOn(generateLink, 'generateLink')
//     .mockReset()
//     .mockImplementation(() => {
//       return 'success';
//     });

//   const { getByText } = render(<SUSHIControls onClick={onClick} resetLogMessages={resetLogMessages} />, container);
//   const shareButton = getByText('Share');
//   fireEvent.click(shareButton);

//   expect(generateLinkSpy).toHaveBeenCalled();
// });

// it('will return a shortened bitly url', async () => {
//   const fsh = 'Edit FSH Here!';
//   let shortLink = await generateLink(fsh);
//   await wait(() => {
//     expect(shortLink).toContain('bit.ly/');
//   });
// });

/* 
tests I need:
- generateLink function
- clicking share button
- copy to clipboard
*/
