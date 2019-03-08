const path = require('path');
const fs = require('fs-extra');
const argv = require(path.resolve(__dirname, 'argv'));
const config = require(path.resolve(__dirname, 'config'));
const { log } = require(path.resolve(__dirname, 'utils'));
const entries = require(path.resolve(__dirname, 'entries'));
const jsonDiff = require('json-diff');

module.exports = function scaffold() {
  const json = JSON.parse(JSON.stringify(config.pkg.json));
  if (!json.version) json.version = '0.1.0';
  json.files = json.files || [];
  entries.forEach(entry => {
    const { output } = entry;
    const { format, file } = output;
    const relativePath = file.replace(config.pkg.dir + path.sep, '');
    if (!json.files.includes(relativePath)) json.files.push(relativePath);
    if (format === 'umd' && /\.min\.js$/.test(file)) {
      json.jsdelivr = relativePath;
      json.unpkg = relativePath;
    }
    if (format === 'cjs') {
      json.main = relativePath;
    }

    if (format === 'es') {
      json.module = relativePath;
      if (!config.hasNode) {
        json.main = relativePath;
      }
    }
  });

  if (config.typescript && config.typescript.declaration) {
    const relativePath = config.typescript.declarationDir.replace(
      config.pkg.dir + path.sep,
      '',
    );
    const dName = path.join(relativePath, config.entryName + '.d.ts');
    if (!json.files.includes(dName)) json.files.push(dName);
    json.types = dName;
  }
  config.files.forEach(file => {
    if (!json.files.includes(file)) json.files.push(file);
  });

  json.sideeffects = false;

  if (!json.scripts) json.scripts = {};
  if (!json.scripts.build) {
    json.scripts.build = 'plugboy';
    if (argv.config) json.scripts.build += ' --config ' + argv.config;
  }

  const outPath = path.join(config.pkg.dir, 'package.json');
  const diff = jsonDiff.diffString(config.pkg.json, json);
  if (diff) {
    fs.writeJsonSync(outPath, json, { spaces: 2 });
    log('✅  I updated package.json as follows.');
    console.log(diff);
  } else {
    log('✅  There was no update content to package.json.');
  }
};
