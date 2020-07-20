import { loadExternalDependenciesPlayground, readConfigPlayground, fillTank } from '../../utils/Processing';
import { RawFSH } from 'fsh-sushi/dist/import/RawFSH';
import { FHIRDefinitions } from 'fsh-sushi/dist/fhirdefs';
import * as loadModule from '../../utils/Load';
import 'fake-indexeddb/auto';

describe('#readConfigPlayground', () => {
  it('should hard code the preferred config', () => {
    const config = readConfigPlayground();
    expect(config.fhirVersion).toEqual(['4.0.1']);
    expect(config.id).toEqual('fhir.us.minimal');
    expect(config.FSHOnly).toBe(false);
  });
});

describe('#loadExternalDependenciesPlayground()', () => {
  it('should log an error when it fails to make the database', () => {
    const defs = new FHIRDefinitions();
    const version = -1;
    const dependencyDefs = loadExternalDependenciesPlayground(defs, version);
    return expect(dependencyDefs).rejects.toThrow(TypeError);
  });

  it('should create a new database when one does not yet exist', async () => {
    const defs = new FHIRDefinitions();
    const version = 2;
    const unzipSpy = jest.spyOn(loadModule, 'unzipDependencies').mockImplementation(() => {
      return undefined;
    });
    const loadDefsSpy = jest.spyOn(loadModule, 'loadDependenciesInStorage').mockImplementation(() => {
      return undefined;
    });
    const loadIntoPlaygroundSpy = jest.spyOn(loadModule, 'loadIntoDefsPlayground').mockImplementation(() => {
      return undefined;
    });
    const dependencyDefs = loadExternalDependenciesPlayground(defs, version);
    await dependencyDefs;
    expect(unzipSpy).toBeCalled();
    expect(loadDefsSpy).toBeCalled();
    expect(loadIntoPlaygroundSpy).toBeCalled();
  });

  it('should not make a new database, but instead should load the existing data into FHIRDefs', () => {
    const defs = new FHIRDefinitions();
    const version = 1;
    const unzipSpy = jest.spyOn(loadModule, 'unzipDependencies').mockImplementation(() => {
      return undefined;
    });
    const loadDefsSpy = jest.spyOn(loadModule, 'loadDependenciesInStorage').mockImplementation(() => {
      return undefined;
    });
    const loadIntoPlaygroundSpy = jest.spyOn(loadModule, 'loadIntoDefsPlayground').mockImplementation(() => {
      return undefined;
    });
    const dbRequest = indexedDB.open('FSH Playground Dependencies', version);
    dbRequest.onsuccess = async () => {
      const dependencyDefs = loadExternalDependenciesPlayground(defs, version);
      await dependencyDefs;
      expect(unzipSpy).toBeCalledTimes(0);
      expect(loadDefsSpy).toBeCalledTimes(0);
      expect(loadIntoPlaygroundSpy).toBeCalled();
    };
  });
});

describe('#filltank', () => {
  it('should translate rawFSH and fill tank', () => {
    const input =
      'Alias: SCT = http://snomed.info/sct Profile:FishPatient Parent:Patient Id:fish-patient Title: "Fish Patient" Description: "A patient that is a type of fish."';
    const rawFSH = [new RawFSH(input)];
    const config = readConfigPlayground();
    const tank = fillTank(rawFSH, config);
    expect(tank.docs.length).toEqual(1);
    expect(tank.config.fhirVersion).toEqual(['4.0.1']);
  });
});
