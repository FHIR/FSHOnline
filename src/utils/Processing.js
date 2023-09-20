import { flatten } from 'lodash';
import { fhirdefs, sushiImport } from 'fsh-sushi';
import { getLatestVersionNumber, loadAsFHIRDefs, loadDependenciesInStorage, unzipDependencies } from './Load';
import { fshOnlineLogger as logger } from './logger';

const FHIRDefinitions = fhirdefs.FHIRDefinitions;
const FSHTank = sushiImport.FSHTank;
const importText = sushiImport.importText;

export function fillTank(rawFSHes, config) {
  logger.info('Importing FSH text...');
  const docs = importText(rawFSHes);
  return new FSHTank(docs, config);
}

export async function loadAndCleanDatabase(defs, dependencies) {
  dependencies = await resolveDependencies(dependencies);

  let helperUpdate = await checkForDatabaseUpgrade(dependencies);
  let loadExternalDependenciesReturn = { defs, emptyDependencies: [] };

  if (helperUpdate.shouldUpdate) {
    loadExternalDependenciesReturn = await loadExternalDependencies(defs, helperUpdate.version + 1, dependencies);
    defs = loadExternalDependenciesReturn.defs;
  } else {
    loadExternalDependenciesReturn = await loadExternalDependencies(defs, helperUpdate.version, dependencies);
    defs = loadExternalDependenciesReturn.defs;
  }

  // Cleans out database of any empty objectStores
  await cleanDatabase(loadExternalDependenciesReturn.emptyDependencies, helperUpdate.version + 2);
  return defs;
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

export function checkForDatabaseUpgrade(dependencies, databaseName = 'FSH Playground Dependencies') {
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
        dependencies.length === 0 ||
        existingObjectStores.contains('resources')
      ) {
        helperReturn.shouldUpdate = true;
        database.close();
        resolve(helperReturn);
      } else {
        dependencies.forEach((dep) => {
          const { packageId, version } = dep;
          if (!existingObjectStores.contains(`${packageId}${version}`)) {
            helperReturn.shouldUpdate = true;
          }
        });
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
  dependencies,
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
      for (let i = 0; i < dependencies.length; i++) {
        let resources = [];
        shouldUnzip = false;
        const { packageId, version } = dependencies[i];
        if (newDependencies.includes(`${packageId}${version}`)) {
          shouldUnzip = true;
        }
        if (shouldUnzip) {
          let unzipReturn = await unzipDependencies(resources, packageId, version);
          if (unzipReturn.emptyDependencies.length !== 0) {
            returnPackage.emptyDependencies.push(unzipReturn.emptyDependencies);
          }
          await loadDependenciesInStorage(database, unzipReturn.resourceArr, packageId, version);
        }
        returnPackage.defs = await loadAsFHIRDefs(FHIRdefs, database, packageId, version);
      }
      database.close();
      resolve(returnPackage);
    };

    // If upgrade is needed to the version, the database does not yet exist
    OpenIDBRequest.onupgradeneeded = function (event) {
      database = event.target.result;
      let existingObjectStores = database.objectStoreNames;
      if (existingObjectStores.contains('resources')) {
        database.deleteObjectStore('resources');
      }
      for (let i = 0; i < dependencies.length; i++) {
        const { packageId, version } = dependencies[i];
        if (!existingObjectStores.contains(`${packageId}${version}`)) {
          database.createObjectStore(`${packageId}${version}`, {
            keyPath: ['id', 'resourceType']
          });
          newDependencies.push(`${packageId}${version}`);
        }
      }
    };

    // Checks if there is an error
    OpenIDBRequest.onerror = function (event) {
      reject(event);
    };
  });
}

export async function resolveDependencies(dependencies) {
  // Replace any 'latest' versions with the latest version number
  const resolvedDependencies = await Promise.all(dependencies.map(async (dep) => replaceLatestVersion(dep)));

  // Remove any dependencies that can't identify a latest version
  const filteredResolvedDependencies = resolvedDependencies.filter((d) => d.version !== null);

  return filteredResolvedDependencies;
}

async function replaceLatestVersion(dependency) {
  const { packageId, version } = dependency;
  let updatedVersion = version;
  if (version === 'latest') {
    await getLatestVersionNumber(dependency)
      .then((latestId) => {
        updatedVersion = latestId;
      })
      .catch(() => {
        // No 'latest' version could be found, so mark
        // this to be filtered out of the list to be loaded
        updatedVersion = null;
      });
  }
  return { packageId, version: updatedVersion };
}
