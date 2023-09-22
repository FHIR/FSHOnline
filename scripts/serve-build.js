const express = require('express');
const serveStatic = require('serve-static');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const buildDir = path.resolve(__dirname, '../build');
if (!fs.existsSync(buildDir)) {
  console.error('No build dir detected. Run "npm run build" first.');
  process.exit(1);
}

const app = express();
app.use(cors());
app.use('/FSHOnline', serveStatic(path.resolve(__dirname, '../build')));
app.listen(8000, (err) => {
  if (err != null) {
    console.error(err);
  }
  console.log('NOTE: This is a development server intended to test static deployment ');
  console.log('of FSH Online. This server is not intended for production use.');
  console.log();
  console.log(`Source directory: ${buildDir}`);
  console.log('URL: http://localhost:8000/FSHOnline/');
});
