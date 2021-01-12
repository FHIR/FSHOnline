import { unzipDependencies, loadDependenciesInStorage, loadAsFHIRDefs } from '../../utils/Load';
import { fhirdefs } from 'fsh-sushi';
import tarStream from 'tar-stream';
import http from 'http';
import 'fake-indexeddb/auto';

const FHIRDefinitions = fhirdefs.FHIRDefinitions;

describe('#unzipDependencies', () => {
  let getSpy = jest.SpyInstance;
  // let getSpyBad = jest.SpyInstance;
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
    unzipDependencies(resources, 'hl7.fhir.r4.core', '4.0.1');
    const callbackFunction = getSpy.mock.calls[0][1];
    expect(getSpy).toBeCalled();
    expect(getSpy).toBeCalledWith('https://packages.fhir.org/hl7.fhir.r4.core/4.0.1', callbackFunction);
  });

  //TODO - test failed http request

  // it('should add failed http requests to a list of emptyDependencies', async () => {
  //   getSpyBad = jest.spyOn(http, 'get').mockImplementation(() => {
  //     const res = { statusCode: 404 };
  //     return res;
  //   });
  //   const unzipReturn = await unzipDependencies(resources, 'hello', '123');
  //   const callbackFunction = getSpy.mock.calls[0][1];
  //   expect(getSpyBad).toBeCalled();
  //   expect(getSpyBad).toBeCalledWith('https://packages.fhir.org/hello/123', callbackFunction);
  //   expect(unzipReturn).toBe({ resourceArr: resources, emptyDependencies: ['hello#123'] });
  // });
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
        database.createObjectStore('testDependency1.0.0', { keyPath: ['id', 'resourceType'] });
      };
      OpenDB.onsuccess = async (event) => {
        database = event.target.result;
        await loadDependenciesInStorage(database, resourcesTest, 'testDependency', '1.0.0');
        const databaseValue = await database
          .transaction(['testDependency1.0.0'], 'readonly')
          .objectStore('testDependency1.0.0', { keyPath: ['id', 'resourceType'] })
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
        database.createObjectStore('testDependency1.0.0', { keyPath: ['id', 'resourceType'] });
      };
      OpenDB.onsuccess = async (event) => {
        database = event.target.result;
        await loadDependenciesInStorage(database, resourcesTest, 'testDependency', '1.0.0');
        finalDefs = await loadAsFHIRDefs(FHIRdefs, database, 'testDependency', '1.0.0');
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
