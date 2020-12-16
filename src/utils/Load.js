import tarStream from 'tar-stream';
import zlib from 'zlib';
import http from 'http';

export async function unzipDependencies(resources, dependencyArr) {
  for (let i = 0; i < dependencyArr.length; i++) {
    let dependency = dependencyArr[i][0];
    let id = dependencyArr[i][1];
    await new Promise((resolve) => {
      http.get(`http://packages.fhir.org/${dependency}/${id}`, function (res) {
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
        if (res.statusCode < 400) {
          res.pipe(zlib.createGunzip()).pipe(extract);
        } else {
          console.log(`error your depdendency ${dependency}#${id} could not be loaded. Your output may be invalid.`);
          resolve(resources);
        }
      });
    });
  }
  return resources;
}

export function loadDependenciesInStorage(database, resources) {
  return new Promise((resolve, reject) => {
    // Loads parsed json into indexDB
    const transaction = database.transaction(['resources'], 'readwrite');
    transaction.oncomplete = () => {
      console.log('hello');
      resolve();
    };
    transaction.onerror = (event) => {
      reject(event);
    };
    const objectStore = transaction.objectStore('resources', { keyPath: ['id', 'resourceType'] });
    resources.forEach((res) => {
      objectStore.put(res);
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
