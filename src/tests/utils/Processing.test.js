import { loadExternalDependencies, fillTank, checkForDatabaseUpgrade, cleanDatabase } from '../../utils/Processing';
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
      return { resourceArr: [], emptyDependencies: [] };
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
      return { resourceArr: [], emptyDependencies: [] };
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

  it('should delete the the "resources" objectStore if it exists', async () => {
    const defs = new FHIRDefinitions();
    const version = 1;
    let database = null;
    let existingObjectStores = null;
    const unzipSpy = jest.spyOn(loadModule, 'unzipDependencies').mockImplementation(() => {
      return { resourceArr: [], emptyDependencies: [] };
    });
    const loadInStorageSpy = jest.spyOn(loadModule, 'loadDependenciesInStorage').mockImplementation(() => {
      return undefined;
    });
    const loadAsDefsSpy = jest.spyOn(loadModule, 'loadAsFHIRDefs').mockImplementation(() => {
      return undefined;
    });

    // Open and set up a test database to have 'resources' objectStore
    await new Promise((resolve) => {
      const OpenIDBRequest = indexedDB.open('Test Database Resources', version);
      OpenIDBRequest.onsuccess = async (event) => {
        database = event.target.result;
        existingObjectStores = database.objectStoreNames;
        database.close();
        resolve();
      };
      OpenIDBRequest.onupgradeneeded = async (event) => {
        database = event.target.result;
        database.createObjectStore('resources', { keyPath: ['id', 'resourceType'] });
      };
    });

    // This call should upgrade our database and delete the 'resources' objectStore
    await loadExternalDependencies(defs, version + 1, [], 'Test Database Resources');

    // Reopen the database to update our existingObjectStores variable
    await new Promise((resolve) => {
      const OpenIDBRequest = indexedDB.open('Test Database Resources', version + 1);
      OpenIDBRequest.onsuccess = async (event) => {
        database = event.target.result;
        existingObjectStores = database.objectStoreNames;
        database.close();
        resolve();
      };
    });

    expect(existingObjectStores.contains('resources')).toBeFalsy();
    expect(unzipSpy).toBeCalled();
    expect(loadInStorageSpy).toBeCalled();
    expect(loadAsDefsSpy).toBeCalled();
  });

  it('should add empty objectStores to the emptyDependencies array', async () => {
    const defs = new FHIRDefinitions();
    const version = 2;
    const unzipSpy = jest.spyOn(loadModule, 'unzipDependencies').mockImplementation(() => {
      return { resourceArr: [], emptyDependencies: ['hello#123'] };
    });
    const loadInStorageSpy = jest.spyOn(loadModule, 'loadDependenciesInStorage').mockImplementation(() => {
      return undefined;
    });
    const loadAsDefsSpy = jest.spyOn(loadModule, 'loadAsFHIRDefs').mockImplementation(() => {
      return undefined;
    });
    const dependencyDefs = await loadExternalDependencies(defs, version, [], true);
    expect(dependencyDefs).toEqual({ finalDefs: undefined, emptyDependencies: [['hello#123']] });
    expect(unzipSpy).toBeCalled();
    expect(loadInStorageSpy).toBeCalled();
    expect(loadAsDefsSpy).toBeCalled();
  });
});

describe('#cleanDatabase()', () => {
  it('should delete empty objectStores', async () => {
    let database = null;
    const version = 1;
    let existingObjectStores = null;
    const emptyDependencies = [['test#123'], ['test456'], ['#789'], ['badObjectStore']];

    // Open and set up a test database
    await new Promise((resolve) => {
      const OpenIDBRequest = indexedDB.open('Test Database Empty ObjectStores', version);
      OpenIDBRequest.onsuccess = async (event) => {
        database = event.target.result;
        existingObjectStores = database.objectStoreNames;
        database.close();
        resolve();
      };
      OpenIDBRequest.onupgradeneeded = async (event) => {
        database = event.target.result;
        database.createObjectStore('test#123', { keyPath: ['id', 'resourceType'] });
        database.createObjectStore('test456', { keyPath: ['id', 'resourceType'] });
        database.createObjectStore('#789', { keyPath: ['id', 'resourceType'] });
        database.createObjectStore('badObjectStore', { keyPath: ['id', 'resourceType'] });
      };
    });

    // This call should upgrade our database and delete the empty objectStores
    await cleanDatabase(emptyDependencies, version + 1, 'Test Database Empty ObjectStores');

    // Reopen the database to check if our empty objectStores are gone
    await new Promise((resolve) => {
      const OpenIDBRequest = indexedDB.open('Test Database Empty ObjectStores', version + 1);
      OpenIDBRequest.onsuccess = async (event) => {
        database = event.target.result;
        existingObjectStores = database.objectStoreNames;
        database.close();
        resolve();
      };
    });

    expect(existingObjectStores).toHaveLength(0);
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
