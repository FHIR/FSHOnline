import { fhirdefs, sushiImport, utils } from 'fsh-sushi';
import { loadAsFHIRDefs, loadDependenciesInStorage, unzipDependencies } from './Load';
import { findIndex } from 'lodash';

const logger = utils.logger;
const FHIRDefinitions = fhirdefs.FHIRDefinitions;
const FSHTank = sushiImport.FSHTank;
const importText = sushiImport.importText;

export function fillTank(rawFSHes, config) {
  logger.info('Importing FSH text...');
  const docs = importText(rawFSHes);
  return new FSHTank(docs, config);
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
      if (existingObjectStores.contains('resources')) {
        helperReturn.shouldUpdate = true;
      }
      if (existingObjectStores.length === 0 || dependencyArr.length === 0) {
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
  databaseName = 'FSH Playground Dependencies'
) {
  return new Promise((resolve, reject) => {
    let database = null;
    let newDependencies = [];
    let finalDefs = FHIRDefinitions;
    const OpenIDBRequest = indexedDB.open(databaseName, version);
    // If successful the database exists
    console.log('here');
    OpenIDBRequest.onsuccess = async function (event) {
      console.log('ahhhhh');
      database = event.target.result;
      let findR4 = findIndex(dependencyArr, (elem) => elem[0] === 'hl7.fhir.r4.core' && elem[1] === '4.0.1');
      if (findR4 < 0) {
        dependencyArr.push(['hl7.fhir.r4.core', '4.0.1']);
      }
      for (let i = 0; i < dependencyArr.length; i++) {
        let resources = [];
        let shouldUnzip = false;
        const dependency = dependencyArr[i][0];
        const id = dependencyArr[i][1];
        if (newDependencies.includes(`${dependency}${id}`)) {
          shouldUnzip = true;
        }
        if (shouldUnzip) {
          resources = await unzipDependencies(resources, dependency, id);
          await loadDependenciesInStorage(database, resources, dependency, id);
        }
        finalDefs = await loadAsFHIRDefs(FHIRdefs, database, dependency, id);
      }
      database.close();
      resolve(finalDefs);
    };
    // If upgrade is needed to the version, the database does not yet exist
    OpenIDBRequest.onupgradeneeded = function (event) {
      let findR4 = findIndex(dependencyArr, (elem) => elem[0] === 'hl7.fhir.r4.core' && elem[1] === '4.0.1');
      if (findR4 < 0) {
        dependencyArr.push(['hl7.fhir.r4.core', '4.0.1']);
      }
      database = event.target.result;
      let existingObjectStores = database.objectStoreNames;
      for (let i = 0; i < dependencyArr.length; i++) {
        const dependency = dependencyArr[i][0];
        const id = dependencyArr[i][1];
        if (!existingObjectStores.contains(`${dependency}${id}`)) {
          database.createObjectStore(`${dependency}${id}`, {
            keyPath: ['id', 'resourceType']
          });
          newDependencies.push(`${dependency}${id}`);
        }
        if (existingObjectStores.contains('resources')) {
          database.deleteObjectStore('resources');
        }
      }
    };
    // Checks if there is an error
    OpenIDBRequest.onerror = function (event) {
      console.log('ererrerror');
      reject(event);
    };
  });
}
