import { unzipDependencies, loadDependenciesInStorage, loadAsFHIRDefs } from '../../utils/Load';
import { FHIRDefinitions } from 'fsh-sushi/dist/fhirdefs/FHIRDefinitions';
import tarStream from 'tar-stream';
import http from 'http';
import 'fake-indexeddb/auto';

describe('#unzipDependencies', () => {
  let getSpy = jest.SpyInstance;
  let tarSpy = jest.SpyInstance;
  let resources = [];
  beforeAll(() => {
    resources = [];
    tarSpy = jest.spyOn(tarStream, 'extract').mockImplementation(() => {
      return undefined;
    });
    getSpy = jest.spyOn(http, 'get').mockImplementation(() => {
      return 'hl7.fhir.r4.core-4.0.1.tgz';
    });
  });
  beforeEach(() => {
    tarSpy.mockClear();
    getSpy.mockClear();
  });
  it('should make an http request and extract data from the resulting zip folder', () => {
    unzipDependencies(resources);
    const callbackFunct = getSpy.mock.calls[0][1];
    expect(getSpy).toBeCalled();
    expect(getSpy).toBeCalledWith('http://packages.fhir.org/hl7.fhir.r4.core/4.0.1', callbackFunct);
  });
});

describe('#loadDependenciesInStorage', () => {
  it('should move the JSON resources into our created indexddb', async () => {
    const databaseReturn = await new Promise((resolve, reject) => {
      const resourcesTest = [
        { id: 1, resourceType: 'number' },
        { id: 2, resourceType: 'string' }
      ];
      let database = null;
      const OpenDB = indexedDB.open('Test Database');
      OpenDB.onupgradeneeded = (event) => {
        database = event.target.result;
        database.createObjectStore('resources', { keyPath: ['id', 'resourceType'] });
      };
      OpenDB.onsuccess = async (event) => {
        database = event.target.result;
        await loadDependenciesInStorage(database, resourcesTest);
        const databaseValue = await database
          .transaction(['resources'], 'readonly')
          .objectStore('resources', { keyPath: ['id', 'resourceType'] })
          .getAll();
        databaseValue.onsuccess = () => {
          resolve(databaseValue.result);
        };
      };
      OpenDB.onerror = () => {
        reject();
      };
    });
    expect(databaseReturn).toHaveLength(2);
    expect(databaseReturn[0]).toEqual({ id: 1, resourceType: 'number' });
  });
});

describe('#loadAsFHIRDefs', () => {
  it('should take data from the database and translate them to FHIRDefs', async () => {
    const databaseReturn = await new Promise((resolve, reject) => {
      const resourcesTest = [
        { resourceType: 'ValueSet', id: 'contract-assettype' },
        { resourceType: 'CodeSystem', id: 'v2-0527' }
      ];
      const FHIRdefs = new FHIRDefinitions();
      let finalDefs = FHIRDefinitions;
      let database = null;
      const OpenDB = indexedDB.open('Test Database');
      OpenDB.onupgradeneeded = (event) => {
        database = event.target.result;
        database.createObjectStore('resources', { keyPath: ['id', 'resourceType'] });
      };
      OpenDB.onsuccess = async (event) => {
        database = event.target.result;
        await loadDependenciesInStorage(database, resourcesTest);
        finalDefs = await loadAsFHIRDefs(FHIRdefs, database);
        resolve(finalDefs);
      };
      OpenDB.onerror = () => {
        reject();
      };
    });
    expect(databaseReturn.allValueSets()).toHaveLength(1);
    expect(databaseReturn.allCodeSystems()).toHaveLength(1);
    expect(databaseReturn.allExtensions()).toHaveLength(0);
  });
});
