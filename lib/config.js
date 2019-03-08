const path = require('path');
const fs = require('fs-extra');
const browserslist = require('browserslist');
const pkg = require(path.resolve(__dirname, 'package'));
const argv = require(path.resolve(__dirname, 'argv'));
const {
  normalizeModuleName,
  normalizeLicense,
  normalizeVersion,
  normalizeAuthor,
  classify,
} = require(path.resolve(__dirname, 'utils'));

let argvConfigPath = argv.config;
if (argvConfigPath && !path.isAbsolute(argvConfigPath)) {
  argvConfigPath = pkg.resolve(argvConfigPath);
}
const CONFIG_PATH = argvConfigPath || path.join(pkg.dir, 'plugin.config.js');
const browsersDefaults = ['last 2 versions', 'not IE < 11']; // or browserslist.defaults

const config = {};
if (fs.pathExistsSync(CONFIG_PATH)) {
  Object.assign(config, require(CONFIG_PATH));
}

const packageJson = pkg.json;

config.target = config.target || 'universal'; // 'universal' | 'node' | 'browser'
config.hasNode = config.target === 'universal' || config.target === 'node';
config.hasBrowser =
  config.target === 'universal' || config.target === 'browser';
config.entry = config.entry || 'index.js';
config.entry = pkg.resolve(config.entry);
const entryParsed = path.parse(config.entry);
config.entryDir = entryParsed.dir;
config.entryBase = entryParsed.base;
config.entryName = entryParsed.name;
config.dest = config.dest || 'dist';
config.dest = pkg.resolve(config.dest);
config.destDirName = path.parse(config.dest).name;

config.name = normalizeModuleName(config.name || packageJson.name);
config.moduleName = config.moduleName || classify(config.name);
config.version = normalizeVersion(packageJson.version);
config.license = normalizeLicense(packageJson.license);
config.author = normalizeAuthor(packageJson.author);
config.year = config.year || new Date().getFullYear();
config.banner =
  '/*!\n' +
  ` * ${config.name} v${config.version} \n` +
  ` * (c) ${config.year} ${config.author}\n` +
  ` * Released under the ${config.license} License.\n` +
  ' */';

if (config.vue) {
  if (typeof config.vue !== 'object') config.vue = {};
  config.vue.css = config.vue.css === undefined ? false : config.vue.css;
}

if (!config.browserslist) {
  config.browserslist =
    browserslist.findConfig(pkg.dir) || browsersDefaults.slice();
}

if (config.babel || config.vue) {
  if (typeof config.babel !== 'object') config.babel = {};
  if (config.vue) {
    config.babel.babelrc =
      config.babel.babelrc === undefined ? false : config.babel.babelrc;
    if (!config.babel.babelrc) {
      // https://cli.vuejs.org/guide/browser-compatibility.html#polyfills-when-building-as-library-or-web-components
      const vueAppPreset =
        config.babel.presets &&
        config.babel.presets.find(p => {
          return (
            p === '@vue/babel-preset-app' || p[0] === '@vue/babel-preset-app'
          );
        });
      if (!vueAppPreset) {
        config.babel.presets = config.babel.presets || [];
        config.babel.presets.push([
          '@vue/babel-preset-app',
          { useBuiltIns: false },
        ]);
      }
    }
  }
  if (!config.babel.babelrc) {
    config.babel.extensions = config.babel.extensions || [];
    config.babel.extensions = config.babel.extensions.concat([
      '.js',
      '.jsx',
      '.es6',
      '.es',
      '.ts',
      '.tsx',
      '.mjs',
      '.vue',
    ]);
    config.babel.extensions = [...new Set(config.babel.extensions)];
  }
  config.babel.runtimeHelpers =
    config.babel.runtimeHelpers === undefined
      ? true
      : config.babel.runtimeHelpers;
}

if (config.sass) {
  if (typeof config.sass !== 'object') config.sass = {};
}

if (config.autoprefixer) {
  if (typeof config.autoprefixer !== 'object') config.autoprefixer = {};
  config.autoprefixer.browsers =
    config.autoprefixer.browsers || config.browserslist;
}

config.cssnano = config.cssnano || {};
config.cssnano.zindex =
  config.cssnano.zindex === undefined ? false : config.cssnano.zindex;

if (config.postcss || config.vue) {
  if (typeof config.postcss !== 'object') config.postcss = {};
  const testPass = pkg.resolve('postcss.config.js');
  if (fs.existsSync(testPass)) {
    config.postcss = require(testPass);
  } else {
    config.postcss = {};
  }
  config.postcss.plugins = config.postcss.plugins || [];
  if (config.autoprefixer) {
    config.postcss.plugins.push(
      pkg.require('autoprefixer')({
        ...config.autoprefixer,
      }),
    );
  }
  config.postcss.minimize = {
    ...config.cssnano,
  };
}

if (config.typescript) {
  if (typeof config.typescript !== 'object') config.typescript = {};
  const ts = config.typescript;
  ts.tsconfig = ts.tsconfig || pkg.resolve('tsconfig.json');
  ts.typescript = ts.typescript || pkg.resolve('node_modules/typescript');
  if (typeof ts.typescript === 'string') ts.typescript = require(ts.typescript);
  ts.declaration = true;
  ts.declarationDir = pkg.resolve(ts.declarationDir || 'types');
  ts.tsconfigOverride = {
    ...ts.tsconfigOverride,
  };
  ts.tsconfigOverride.compilerOptions = {
    ...ts.tsconfigOverride.compilerOptions,
    declaration: ts.declaration,
    declarationDir: ts.declarationDir,
  };
  ts.useTsconfigDeclarationDir = false;
  ts.clean = true;
}

config.external = config.external || [];
const mergedDependencies = {
  ...packageJson.dependencies,
  ...packageJson.peerDependencies,
};
for (const name in mergedDependencies) {
  if (!config.external.includes(name)) {
    config.external.push(name);
  }
}

config.files = config.files || [];

config.pkg = pkg;

module.exports = config;
