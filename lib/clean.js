const path = require('path');
const fs = require('fs-extra');
const config = require(path.resolve(__dirname, 'config'));
const { log } = require(path.resolve(__dirname, 'utils'));

const dirs = [
  config.dest,
  config.typescript && config.typescript.declarationDir,
].filter(d => !!d);

function clean() {
  dirs.forEach(dir => {
    fs.removeSync(dir);
    log(`Removed ${dir}`);
  });
}

module.exports = clean;
