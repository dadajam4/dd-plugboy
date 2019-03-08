const fs = require('fs-extra');
const path = require('path');
const { error } = require(path.resolve(__dirname, 'utils'));

const parentDir = sourcePath => {
  let dir = path.dirname(sourcePath);
  if (!dir || dir.length < 2) dir = '';
  return dir;
};

let findedPath = null;
let cwdEntered = false;
let searchDir = parentDir(parentDir(parentDir(__dirname)));

while (!findedPath && !!searchDir) {
  const searchPath = path.join(searchDir, 'package.json');
  if (fs.pathExistsSync(searchPath)) {
    findedPath = searchPath;
  } else {
    searchDir = parentDir(searchDir);
    if (!searchDir && !cwdEntered) {
      cwdEntered = true;
      searchDir = process.cwd();
    }
  }
}

if (!findedPath) throw error('Missing package.json');

const json = require(findedPath);
const dir = path.dirname(findedPath);
const pkg = {
  dir,
  json,
  resolve(sourcePath) {
    if (path.isAbsolute(sourcePath)) return sourcePath;
    return path.join(dir, sourcePath);
  },
  require(modulePath) {
    return require(this.resolve('node_modules/' + modulePath));
  },
};

module.exports = pkg;
