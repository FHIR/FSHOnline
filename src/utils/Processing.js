import { fhirdefs, sushiImport, utils } from 'fsh-sushi';
import { loadAsFHIRDefs, loadDependenciesInStorage, unzipDependencies } from './Load';
import { findIndex, flatten } from 'lodash';

const logger = utils.logger;
const FHIRDefinitions = fhirdefs.FHIRDefinitions;
const FSHTank = sushiImport.FSHTank;
const importText = sushiImport.importText;

export function fillTank(rawFSHes, config) {
  logger.info('Importing FSH text...');
  const docs = importText(rawFSHes);
  return new FSHTank(docs, config);
}

export function cleanDatabase(emptyDependencies, version, databaseName = 'FSH Playground Dependencies') {
  const mergedEmpties = flatten(emptyDependencies);
  return new Promise((resolve, reject) => {
    let database = null;
    const OpenIDBRequest = indexedDB.open(databaseName, version);
    OpenIDBRequest.onsuccess = function (event) {
      database = event.target.result;
      database.close();
      resolve();
    };
    OpenIDBRequest.onupgradeneeded = async function (event) {
      database = event.target.result;
      let existingObjectStores = database.objectStoreNames;

      // Checks existing objectStores to see if any are empty - failsafe for users who previously had blank objectStores created
      for (let objectStore of existingObjectStores) {
        await new Promise((resolve) => {
          let transaction = event.target.transaction;
          const objStore = transaction.objectStore(`${objectStore}`).getAll();
          objStore.onsuccess = (event) => {
            let items = event.target.result;
            if (items.length === 0 && !mergedEmpties.includes(objectStore)) {
              mergedEmpties.push(objectStore);
            }
            resolve();
          };
        });
      }
      // Deletes objectStores that are empty
      for (let i = 0; i < mergedEmpties.length; i++) {
        if (existingObjectStores.contains(mergedEmpties[i])) {
          database.deleteObjectStore(mergedEmpties[i]);
        }
      }
    };
    OpenIDBRequest.onerror = function (event) {
      reject(event);
    };
  });
}

export function checkForDatabaseUpgrade(dependencyArr, databaseName = 'FSH Playground Dependencies') {
  let helperReturn = { shouldUpdate: false, version: 1 };
  return new Promise((resolve, reject) => {
    let database = null;
    const OpenIDBRequest = indexedDB.open(databaseName);
    OpenIDBRequest.onsuccess = function (event) {
      database = event.target.result;
      let existingObjectStores = database.objectStoreNames;
      helperReturn.version = database.version;
      if (
        existingObjectStores.length === 0 ||
        dependencyArr.length === 0 ||
        existingObjectStores.contains('resources')
      ) {
        helperReturn.shouldUpdate = true;
        database.close();
        resolve(helperReturn);
      } else {
        for (let i = 0; i < dependencyArr.length; i++) {
          let dependency = dependencyArr[i][0];
          let id = dependencyArr[i][1];
          if (!existingObjectStores.contains(`${dependency}${id}`)) {
            helperReturn.shouldUpdate = true;
          }
        }
        database.close();
        resolve(helperReturn);
      }
    };
    OpenIDBRequest.onupgradeneeded = function (event) {
      database = event.target.result;
    };
    OpenIDBRequest.onerror = function (event) {
      reject(event);
    };
  });
}

export async function loadExternalDependencies(
  FHIRdefs,
  version,
  dependencyArr,
  databaseName = 'FSH Playground Dependencies',
  shouldUnzip = false
) {
  return new Promise((resolve, reject) => {
    let database = null;
    let newDependencies = [];
    let returnPackage = { defs: FHIRDefinitions, emptyDependencies: [] };
    const OpenIDBRequest = indexedDB.open(databaseName, version);

    // If successful the database exists
    OpenIDBRequest.onsuccess = async function (event) {
      database = event.target.result;
      let findR4 = findIndex(dependencyArr, (elem) => elem[0] === 'hl7.fhir.r4.core' && elem[1] === '4.0.1');
      if (findR4 < 0) {
        dependencyArr.push(['hl7.fhir.r4.core', '4.0.1']);
      }
      for (let i = 0; i < dependencyArr.length; i++) {
        let resources = [];
        shouldUnzip = false;
        const dependency = dependencyArr[i][0];
        const id = dependencyArr[i][1];
        if (newDependencies.includes(`${dependency}${id}`)) {
          shouldUnzip = true;
        }
        if (shouldUnzip) {
          let unzipReturn = await unzipDependencies(resources, dependency, id);
          if (unzipReturn.emptyDependencies.length !== 0) {
            returnPackage.emptyDependencies.push(unzipReturn.emptyDependencies);
          }
          await loadDependenciesInStorage(database, unzipReturn.resourceArr, dependency, id);
        }
        returnPackage.defs = await loadAsFHIRDefs(FHIRdefs, database, dependency, id);
      }
      database.close();
      resolve(returnPackage);
    };

    // If upgrade is needed to the version, the database does not yet exist
    OpenIDBRequest.onupgradeneeded = function (event) {
      let findR4 = findIndex(dependencyArr, (elem) => elem[0] === 'hl7.fhir.r4.core' && elem[1] === '4.0.1');
      if (findR4 < 0) {
        dependencyArr.push(['hl7.fhir.r4.core', '4.0.1']);
      }
      database = event.target.result;
      let existingObjectStores = database.objectStoreNames;
      if (existingObjectStores.contains('resources')) {
        database.deleteObjectStore('resources');
      }
      for (let i = 0; i < dependencyArr.length; i++) {
        const dependency = dependencyArr[i][0];
        const id = dependencyArr[i][1];
        if (!existingObjectStores.contains(`${dependency}${id}`)) {
          database.createObjectStore(`${dependency}${id}`, {
            keyPath: ['id', 'resourceType']
          });
          newDependencies.push(`${dependency}${id}`);
        }
      }
    };

    // Checks if there is an error
    OpenIDBRequest.onerror = function (event) {
      reject(event);
    };
  });
}
