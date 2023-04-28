import tarStream from 'tar-stream';
import zlib from 'zlib';
import https from 'https';
import { utils } from 'fsh-sushi';
const logger = utils.logger;

export function unzipDependencies(resources, dependency, id) {
  let returnPackage = { resourceArr: resources, emptyDependencies: [] };
  return new Promise((resolve) => {
    https
      .get(`https://packages.fhir.org/${dependency}/${id}`, function (res) {
        const extract = tarStream.extract();
        // Unzip files
        extract.on('entry', function (header, stream, next) {
          let buf = '';
          stream.on('data', function (chunk) {
            buf += chunk.toString();
          });
          stream.on('end', function () {
            try {
              const resource = JSON.parse(buf);
              if (resource.resourceType) {
                returnPackage.resourceArr.push(resource);
              }
            } catch {} //eslint-disable-line no-empty
            next();
          });
          stream.resume();
        });
        extract.on('finish', function () {
          resolve(returnPackage);
        });
        if (res.statusCode < 400) {
          res.pipe(zlib.createGunzip()).pipe(extract);
          logger.info(`Downloaded ${dependency}#${id}`);
        } else {
          if (id === 'current' || id === 'dev') {
            logger.error(`FSHOnline does not currently support "current" or "dev" package versions`);
          } else {
            logger.error(`Your dependency ${dependency}#${id} could not be loaded. Your output may be invalid.`);
            returnPackage.emptyDependencies.push(`${dependency}${id}`);
          }
          resolve(returnPackage);
        }
      })
      .on('error', (e) => {
        logger.error('An error occurred while downloading FHIR packages. Your output may be invalid: ', e);
        returnPackage.emptyDependencies.push(`${dependency}${id}`);
        resolve(returnPackage);
      });
  });
}

export function loadDependenciesInStorage(database, resources, dependency, id) {
  return new Promise((resolve, reject) => {
    // Loads parsed json into indexDB
    const transaction = database.transaction([`${dependency}${id}`], 'readwrite');
    transaction.oncomplete = () => {
      resolve();
    };
    transaction.onerror = (event) => {
      reject(event);
    };
    const objectStore = transaction.objectStore(`${dependency}${id}`, { keyPath: ['id', 'resourceType'] });
    resources.forEach((res) => {
      if (res.id && res.resourceType) {
        objectStore.put(res);
      }
    });
  });
}

export function loadAsFHIRDefs(FHIRdefs, database, dependency, id) {
  // Convert database data into FHIR Definitions
  return new Promise((resolve, reject) => {
    let displayLoaded = false;
    const getData = database
      .transaction([`${dependency}${id}`], 'readonly')
      .objectStore(`${dependency}${id}`, { keyPath: ['id', 'resourceType'] })
      .openCursor();
    getData.onerror = function () {
      reject('There is an error getting data out!');
    };
    getData.onsuccess = function () {
      const iterator = getData.result;
      if (iterator) {
        displayLoaded = true;
        FHIRdefs.add(iterator.value);
        iterator.continue();
      } else {
        if (displayLoaded) {
          logger.info(`Loaded package ${dependency}#${id}`);
        }
        resolve(FHIRdefs);
      }
    };
  });
}
