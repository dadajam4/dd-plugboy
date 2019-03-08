const path = require('path');
const fs = require('fs-extra');
const chalk = require('chalk');
const rollup = require('rollup');
const config = require(path.resolve(__dirname, 'config'));
const clean = require(path.resolve(__dirname, 'clean'));
const entries = require(path.resolve(__dirname, 'entries'));
const { log, getCodeSize, getGzipedCodeSize } = require(path.resolve(
  __dirname,
  'utils',
));

async function prependBanner(filePath) {
  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, 'utf8');
    fs.writeFileSync(filePath, config.banner + '\n' + content);
  }
}

module.exports = async function bundle() {
  clean();

  log('Building for production mode as plugin ...');

  for (const entry of entries) {
    await bundleEntry(entry);
  }

  if (config.typescript && config.typescript.declaration) {
    await moveTsDeclarationFiles();
  }

  await removeUnnecessaryFiles();
  await prependBanner(path.join(config.dest, config.name + '.css'));
  await prependBanner(path.join(config.dest, config.name + '.min.css'));

  console.log();
  log(
    `✅  Build complete. The ${chalk.cyan(
      config.destDirName,
    )} directory is ready to be deployed.`,
  );
};

async function bundleEntry(config) {
  const bundle = await rollup.rollup(config);
  const { output } = await bundle.generate(config.output);
  const { code } = output[0];

  await bundle.write(config.output);

  const size = getCodeSize(code);
  const gZipedSize = await getGzipedCodeSize(code);
  log(
    `📦  ${chalk.blue.bold(
      path.relative(process.cwd(), config.output.file),
    )} ${size} (gzipped: ${gZipedSize})`,
  );
}

async function moveTsDeclarationFiles() {
  const relativePath = config.entryDir.replace(config.pkg.dir, '');
  const outedDir = path.join(config.dest, relativePath);
  fs.moveSync(outedDir, config.typescript.declarationDir);
}

async function removeUnnecessaryFiles() {
  const files = fs.readdirSync(config.dest, { withFileTypes: true });
  const targets = [];
  files.forEach(file => {

    // fix for typeof Dirent
    if (typeof file !== 'string') file = file.name;

    if (file === config.name + '.css' || file === config.name + '.min.css')
      return;

    // fix for typeof Dirent
    file = typeof file === 'string' ? file : file.name;

    const filePath = path.join(config.dest, file);
    if (!entries.find(e => e.output.file === filePath)) {
      targets.push(filePath);
    }
  });
  targets.forEach(target => {
    fs.removeSync(target);
  });
}
