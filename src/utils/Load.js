import tarStream from 'tar-stream';
import zlib from 'zlib';
import http from 'http';

export function unzipDependencies(resources) {
  return new Promise((resolve) => {
    http.get('http://packages.fhir.org/hl7.fhir.r4.core/4.0.1', function (res) {
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
              resources.push(resource);
            }
          } catch {} //eslint-disable-line no-empty
          next();
        });
        stream.resume();
      });
      extract.on('finish', function () {
        resolve(resources);
      });
      res.pipe(zlib.createGunzip()).pipe(extract);
    });
  });
}

export function loadDependenciesInStorage(database, resources) {
  return new Promise((resolve, reject) => {
    // Loads parsed json into indexDB
    const transaction = database.transaction(['resources'], 'readwrite');
    transaction.oncomplete = () => {
      resolve();
    };
    transaction.onerror = (event) => {
      reject(event);
    };
    const objectStore = transaction.objectStore('resources', { keyPath: ['id', 'resourceType'] });
    resources.forEach((res) => {
      objectStore.add(res);
    });
  });
}

export function loadAsFHIRDefs(FHIRdefs, database) {
  // Convert database data into FHIR Definitions
  return new Promise((resolve, reject) => {
    const getData = database
      .transaction(['resources'], 'readonly')
      .objectStore('resources', { keyPath: ['id', 'resourceType'] })
      .openCursor();
    getData.onerror = function () {
      reject('There is an error getting data out!');
    };
    getData.onsuccess = function () {
      const iterator = getData.result;
      if (iterator) {
        FHIRdefs.add(iterator.value);
        iterator.continue();
      } else {
        resolve(FHIRdefs);
      }
    };
  });
}
