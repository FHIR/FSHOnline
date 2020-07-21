import { loadExternalDependencies, fillTank } from '../../utils/Processing';
import { RawFSH } from 'fsh-sushi/dist/import/RawFSH';
import { FHIRDefinitions } from 'fsh-sushi/dist/fhirdefs';
import * as loadModule from '../../utils/Load';
import 'fake-indexeddb/auto';

describe('#loadExternalDependencies()', () => {
  it('should log an error when it fails to make the database', () => {
    const defs = new FHIRDefinitions();
    const version = -1;
    const dependencyDefs = loadExternalDependencies(defs, version);
    return expect(dependencyDefs).rejects.toThrow(TypeError);
  });

  it('should create a new database when one does not yet exist', async () => {
    const defs = new FHIRDefinitions();
    const version = 2;
    const unzipSpy = jest.spyOn(loadModule, 'unzipDependencies').mockImplementation(() => {
      return undefined;
    });
    const loadInStorageSpy = jest.spyOn(loadModule, 'loadDependenciesInStorage').mockImplementation(() => {
      return undefined;
    });
    const loadAsDefsSpy = jest.spyOn(loadModule, 'loadAsFHIRDefs').mockImplementation(() => {
      return undefined;
    });
    const dependencyDefs = loadExternalDependencies(defs, version);
    await dependencyDefs;
    expect(unzipSpy).toBeCalled();
    expect(loadInStorageSpy).toBeCalled();
    expect(loadAsDefsSpy).toBeCalled();
  });

  it('should not make a new database, but instead should load the existing data into FHIRDefs', () => {
    const defs = new FHIRDefinitions();
    const version = 1;
    const unzipSpy = jest.spyOn(loadModule, 'unzipDependencies').mockImplementation(() => {
      return undefined;
    });
    const loadInStorageSpy = jest.spyOn(loadModule, 'loadDependenciesInStorage').mockImplementation(() => {
      return undefined;
    });
    const loadAsDefsSpy = jest.spyOn(loadModule, 'loadAsFHIRDefs').mockImplementation(() => {
      return undefined;
    });
    const dbRequest = indexedDB.open('FSH Playground Dependencies', version);
    dbRequest.onsuccess = async () => {
      const dependencyDefs = loadExternalDependencies(defs, version);
      await dependencyDefs;
      expect(unzipSpy).toBeCalledTimes(0);
      expect(loadInStorageSpy).toBeCalledTimes(0);
      expect(loadAsDefsSpy).toBeCalled();
    };
  });
});

describe('#filltank', () => {
  it('should translate rawFSH and fill tank', () => {
    const input =
      'Alias: SCT = http://snomed.info/sct Profile:FishPatient Parent:Patient Id:fish-patient Title: "Fish Patient" Description: "A patient that is a type of fish."';
    const rawFSH = [new RawFSH(input)];
    const config = { canonical: 'http://default.org' };
    const tank = fillTank(rawFSH, config);
    expect(tank.docs.length).toEqual(1);
  });
});
