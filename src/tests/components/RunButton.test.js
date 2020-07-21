import React from 'react';
import * as runSUSHI from '../../utils/RunSUSHI';
import { act } from 'react-dom/test-utils';
import { render, wait } from '@testing-library/react';
import { unmountComponentAtNode } from 'react-dom';
import RunButton from '../../components/RunButton';
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

it('calls runSUSHI and changes the SUSHIShouldRun variable onClick, exhibits a bad package', async () => {
  const onClick = jest.fn();
  const runSUSHISpy = jest.spyOn(runSUSHI, 'runSUSHI').mockReset().mockResolvedValue(badSUSHIPackage);

  act(() => {
    render(<RunButton onClick={onClick} />, container);
  });
  const button = document.querySelector('[testid=Button]');
  act(() => {
    button.dispatchEvent(new MouseEvent('click', { bubbles: true }));
  });

  await wait(() => {
    expect(runSUSHISpy).toHaveBeenCalled();
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(onClick).toHaveBeenCalledWith(true, 'Your FSH is invalid. Just keep swimming!');
  });
});

it('calls runSUSHI and changes the SUSHIShouldRun variable onClick, exhibits an empty package', async () => {
  const onClick = jest.fn();
  const runSUSHISpy = jest.spyOn(runSUSHI, 'runSUSHI').mockReset().mockResolvedValue(emptySUSHIPackage);

  act(() => {
    render(<RunButton onClick={onClick} />, container);
  });
  const button = document.querySelector('[testid=Button]');
  act(() => {
    button.dispatchEvent(new MouseEvent('click', { bubbles: true }));
  });

  await wait(() => {
    expect(runSUSHISpy).toHaveBeenCalled();
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(onClick).toHaveBeenCalledWith(true, 'Your FSH is invalid. Just keep swimming!');
  });
});

it('calls runSUSHI and changes the SUSHIShouldRun variable onClick, exhibits a good package', async () => {
  const onClick = jest.fn();
  const runSUSHISpy = jest.spyOn(runSUSHI, 'runSUSHI').mockReset().mockResolvedValue(goodSUSHIPackage);

  act(() => {
    render(<RunButton onClick={onClick} />, container);
  });
  const button = document.querySelector('[testid=Button]');
  act(() => {
    button.dispatchEvent(new MouseEvent('click', { bubbles: true }));
  });

  await wait(() => {
    expect(runSUSHISpy).toHaveBeenCalled();
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(onClick).toHaveBeenCalledWith(true, JSON.stringify(goodSUSHIPackage, null, 2));
  });
});
