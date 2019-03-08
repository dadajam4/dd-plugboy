const path = require('path');
const pkg = require(path.resolve(__dirname, '../package.json'));
const chalk = require('chalk');
const zlib = require('zlib');

const log = message => {
  return console.log(`[${pkg.name}] ${message}`);
};

const warn = message => {
  return console.warn(`[${pkg.name}] ⚠️  ${message}`);
};

const error = message => {
  return new Error(`[${pkg.name}] ${message}`);
};

const classifyRE = /(?:^|[-_\/])(\w)/g;

const toUpper = (_, c) => (c ? c.toUpperCase() : '');
const classify = str => str.replace(classifyRE, toUpper);
const isUndef = v => v === undefined || v === null;
const isDef = v => v !== undefined && v !== null;
const isObject = obj => obj !== null && typeof obj === 'object';

function normalizeModuleName(name) {
  if (!isDef(name)) {
    warn(
      `${chalk.yellow.bold('name')} is undefined in ${chalk.yellow.bold(
        'package.json',
      )}`,
    );
  }
  return name;
}

function normalizeLicense(license) {
  if (!isDef(license)) {
    warn(
      `${chalk.yellow.bold('license')} is undefined in ${chalk.yellow.bold(
        'package.json',
      )}`,
    );
  }
  return license;
}

function normalizeVersion(version) {
  if (!isDef(version)) {
    warn(
      `${chalk.yellow.bold('version')} is undefined in ${chalk.yellow.bold(
        'package.json',
      )}`,
    );
  }
  return version;
}

function normalizeAuthor(_author) {
  let author = '';
  if (typeof _author === 'string') {
    author = _author;
  } else if (isObject(_author)) {
    author = _author.name;
  } else {
    warn(
      `${chalk.yellow.bold('author')} is undefined in ${chalk.yellow.bold(
        'package.json',
      )}`,
    );
  }
  return author;
}

const getCodeSize = code => (code.length / 1024).toFixed(2) + 'kb';

const getGzipedCodeSize = code => {
  return new Promise((resolve, reject) => {
    zlib.gzip(code, (err, zipped) => {
      if (err) return reject(err);
      resolve(getCodeSize(zipped));
    });
  });
};

module.exports = {
  log,
  warn,
  error,
  toUpper,
  classify,
  isUndef,
  isDef,
  isObject,
  normalizeModuleName,
  normalizeLicense,
  normalizeVersion,
  normalizeAuthor,
  getCodeSize,
  getGzipedCodeSize,
};
