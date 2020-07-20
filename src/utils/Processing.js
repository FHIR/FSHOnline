import { logger } from 'fsh-sushi/dist/utils';
import { loadIntoDefsPlayground, loadDependenciesInStorage, unzipDependencies } from './Load';
import { FHIRDefinitions } from 'fsh-sushi/dist/fhirdefs';
import { FSHTank, importText, importConfiguration } from 'fsh-sushi/dist/import';
import { minimalConfig } from './MinimalConfig';

export function fillTank(rawFSHes, config) {
  logger.info('Importing FSH text...');
  const docs = importText(rawFSHes);
  return new FSHTank(docs, config);
}

export function readConfigPlayground() {
  const yamlContents = JSON.stringify(minimalConfig, null);

  const defaultPlaygroundConfigYaml = importConfiguration(yamlContents, '/test/import/fixtures/minimal-config.yaml');
  return defaultPlaygroundConfigYaml;
}

export async function loadExternalDependenciesPlayground(FHIRdefs, version) {
  return new Promise((resolve, reject) => {
    let database = null;
    let shouldUnzip = false;
    let finalDefs = FHIRDefinitions;
    const OpenIDBRequest = indexedDB.open('FSH Playground Dependencies', version);
    // If successful the database exists
    OpenIDBRequest.onsuccess = async function (event) {
      // @ts-ignore
      database = event.target.result;
      const resources = [];
      if (shouldUnzip) {
        await unzipDependencies(resources);
        await loadDependenciesInStorage(database, resources);
      }
      finalDefs = await loadIntoDefsPlayground(FHIRdefs, database);
      resolve(finalDefs);
    };
    // If upgrade is needed to the version, the database does not yet exist
    OpenIDBRequest.onupgradeneeded = function (event) {
      shouldUnzip = true;
      // @ts-ignore
      database = event.target.result;
      // @ts-ignore
      database.createObjectStore('resources', {
        keyPath: ['id', 'resourceType']
      });
    };
    // Checks if there is an error
    OpenIDBRequest.onerror = function (event) {
      reject(event);
    };
  });
}
