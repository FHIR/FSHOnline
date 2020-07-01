import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Grid } from '@material-ui/core';
import TopBar from './components/TopBar';
import JSONOutput from './components/JSONOutput';
import ConsoleComponent from './components/ConsoleComponent';
import CodeMirrorComponent from './components/CodeMirrorComponent';
import tar from 'tar-stream';
import zlib from 'zlib';
import http from 'http';

const useStyles = makeStyles((theme) => ({
  container: {
    flexGrow: 1
  },
  itemTop: {
    height: '75vh'
  },
  itemBottom: {
    height: '25vh'
  }
}));

export default function App() {
  const classes = useStyles();

  let db;
  let request = indexedDB.deleteDatabase('TESTER');
  request.onsuccess = function (event) {
    request = indexedDB.open('TESTER');
    request.onerror = function (event) {
      console.log('Failed to make db');
    };
    request.onsuccess = function (event) {
      console.log('Opened db');
    };
    request.onupgradeneeded = function (event) {
      console.log('Upgrading db');
      db = event.target.result;
      let objectStore = db.createObjectStore('resources', { keyPath: 'url' });
      objectStore.transaction.oncomplete = function (event) {
        console.log('Filling db');
        http.get('http://packages.fhir.org/hl7.fhir.r4.core/4.0.1', function (res) {
          let extract = tar.extract();
          const resources = [];
          extract.on('entry', function (header, stream, next) {
            let buf = '';
            stream.on('data', function (chunk) {
              buf += chunk.toString();
            });
            stream.on('end', function () {
              try {
                const resource = JSON.parse(buf);
                if (resource.kind === 'resource') {
                  resources.push(resource);
                }
              } catch (e) {}
              next();
            });

            stream.resume();
          });

          extract.on('finish', function () {
            for (res of resources) {
              console.log(res.id);
            }

            const transaction = db.transaction(['resources'], 'readwrite');
            transaction.oncomplete = () => {
              console.log('All done adding data');
              db
                .transaction('resources')
                .objectStore('resources')
                .get('http://hl7.org/fhir/StructureDefinition/Patient').onsuccess = function (event) {
                console.log('We found patient!!!');
                console.log(event.target.result);
              };
            };
            const objectStore = transaction.objectStore('resources');
            resources.forEach((res) => {
              const request = objectStore.add(res);
              request.onsuccess = () => {
                console.log('added ' + res.id);
              };
            });
          });
          res.pipe(zlib.createGunzip()).pipe(extract);
        });
      };
    };
  };

  return (
    <div className="root">
      <TopBar />
      <Grid className={classes.container} container>
        <Grid className={classes.itemTop} item xs={6}>
          <CodeMirrorComponent />
        </Grid>
        <Grid className={classes.itemTop} item xs={6}>
          <JSONOutput />
        </Grid>
        <Grid className={classes.itemBottom} item xs={12}>
          <ConsoleComponent />
        </Grid>
      </Grid>
    </div>
  );
}
