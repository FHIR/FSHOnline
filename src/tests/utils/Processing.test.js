import { loadExternalDependencies, fillTank, checkForDatabaseUpgrade } from '../../utils/Processing';
import { fhirdefs, sushiImport } from 'fsh-sushi';
import * as loadModule from '../../utils/Load';
import 'fake-indexeddb/auto';

const FHIRDefinitions = fhirdefs.FHIRDefinitions;
const RawFSH = sushiImport.RawFSH;

describe('#checkForDatabaseUpgrade()', () => {
  it('should say we need to upgrade database if we have no ObjectStores or dependency inputs and should return proper version number', async () => {
    const dependencyArr = [];
    const checkForDatabaseUpgradeReturn = await checkForDatabaseUpgrade(dependencyArr);
    expect(checkForDatabaseUpgradeReturn.shouldUpdate).toEqual(true);
    expect(checkForDatabaseUpgradeReturn.version).toEqual(1);
  });

  it('should not upgrade database if we have the correct objectStores needed for our dependency array', async () => {
    let helperReturn = { shouldUpdate: false, version: 1 };
    await new Promise((resolve, reject) => {
      let database = null;
      const OpenIDBRequest = indexedDB.open('Test Database');
      OpenIDBRequest.onsuccess = function (event) {
        database = event.target.result;
        database.close();
        resolve(helperReturn);
      };
      OpenIDBRequest.onupgradeneeded = function (event) {
        database = event.target.result;
        database.createObjectStore('testDependency1.0.0', { keyPath: ['id', 'resourceType'] });
      };
      OpenIDBRequest.onerror = function (event) {
        reject(event);
      };
    });
    const dependencyArr = [['testDependency', '1.0.0']];
    let checkForDatabaseUpgradeReturn = await checkForDatabaseUpgrade(dependencyArr, 'Test Database');
    expect(checkForDatabaseUpgradeReturn.shouldUpdate).toEqual(false);
  });

  it('should upgrade the database if we have new dependencies with no existing objectStores', async () => {
    let helperReturn = { shouldUpdate: false, version: 1 };
    await new Promise((resolve, reject) => {
      let database = null;
      const OpenIDBRequest = indexedDB.open('Test Database');
      OpenIDBRequest.onsuccess = function (event) {
        database = event.target.result;
        database.close();
        resolve(helperReturn);
      };
      OpenIDBRequest.onupgradeneeded = function (event) {
        database = event.target.result;
        database.createObjectStore('testDependency1.0.0', { keyPath: ['id', 'resourceType'] });
      };
      OpenIDBRequest.onerror = function (event) {
        reject(event);
      };
    });
    const dependencyArr = [
      ['testDependency', '1.0.0'],
      ['newTestDependency', '2.0.0']
    ];
    let checkForDatabaseUpgradeReturn = await checkForDatabaseUpgrade(dependencyArr, 'Test Database');
    expect(checkForDatabaseUpgradeReturn.shouldUpdate).toEqual(true);
  });

  it('should upgrade the database if we have the "resources" objectStore still existing', async () => {
    let helperReturn = { shouldUpdate: false, version: 1 };
    await new Promise((resolve, reject) => {
      let database = null;
      const OpenIDBRequest = indexedDB.open('Test Database');
      OpenIDBRequest.onsuccess = function (event) {
        database = event.target.result;
        database.close();
        resolve(helperReturn);
      };
      OpenIDBRequest.onupgradeneeded = function (event) {
        database = event.target.result;
        database.createObjectStore('resources', { keyPath: ['id', 'resourceType'] });
      };
      OpenIDBRequest.onerror = function (event) {
        reject(event);
      };
    });
    const dependencyArr = [];
    let checkForDatabaseUpgradeReturn = await checkForDatabaseUpgrade(dependencyArr, 'Test Database');
    expect(checkForDatabaseUpgradeReturn.shouldUpdate).toEqual(true);
  });
});

describe('#loadExternalDependencies()', () => {
  it('should log an error when it fails to make the database', () => {
    const defs = new FHIRDefinitions();
    const version = -1;
    const dependencyDefs = loadExternalDependencies(defs, version, []);
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
    const dependencyDefs = loadExternalDependencies(defs, version, []);
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
      const dependencyDefs = loadExternalDependencies(defs, version, []);
      await dependencyDefs;
      expect(unzipSpy).toBeCalledTimes(0);
      expect(loadInStorageSpy).toBeCalledTimes(0);
      expect(loadAsDefsSpy).toBeCalled();
    };
  });

  it.only('should delete the the "resources" objectStore if it exists', async () => {
    const defs = new FHIRDefinitions();
    const version = 1;
    let database = null;
    let existingObjectStores = null;
    const unzipSpy = jest.spyOn(loadModule, 'unzipDependencies').mockImplementation(() => {
      return undefined;
    });
    const loadInStorageSpy = jest.spyOn(loadModule, 'loadDependenciesInStorage').mockImplementation(() => {
      return undefined;
    });
    const loadAsDefsSpy = jest.spyOn(loadModule, 'loadAsFHIRDefs').mockImplementation(() => {
      return undefined;
    });
    await new Promise((resolve, reject) => {
      const OpenIDBRequest = indexedDB.open('Test Database');
      OpenIDBRequest.onsuccess = async function (event) {
        database = event.target.result;
        resolve();
      };
      OpenIDBRequest.onupgradeneeded = function (event) {
        database = event.target.result;
        database.createObjectStore('resources', { keyPath: ['id', 'resourceType'] });
      };
    });
    console.log('here');
    await loadExternalDependencies(defs, version + 1, [], 'Test Database');
    expect(existingObjectStores.contains('resources')).toBeFalsy();
    expect(unzipSpy).toBeCalledTimes(0);
    expect(loadInStorageSpy).toBeCalledTimes(0);
    expect(loadAsDefsSpy).toBeCalled();
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
