const fs = require('fs-extra');
const path = require('path');
const config = require(path.resolve(__dirname, 'config'));
const cjs = require('rollup-plugin-commonjs');
const node = require('rollup-plugin-node-resolve');
const replace = require('rollup-plugin-replace');
const { uglify } = require('rollup-plugin-uglify');

const defines = [];

if (config.hasNode) {
  defines.push({
    target: 'commonjs',
    filename: `${config.name}.common.js`,
    format: 'cjs',
  });
}

if (config.hasBrowser) {
  defines.push(
    {
      target: 'esm',
      filename: `${config.name}.esm.js`,
      format: 'es',
    },
    {
      target: 'production',
      filename: `${config.name}.min.js`,
      format: 'umd',
      env: 'production',
      moduleName: config.moduleName,
    },
    {
      target: 'development',
      filename: `${config.name}.js`,
      format: 'umd',
      env: 'development',
      moduleName: config.moduleName,
    },
  );
}

const entries = defines.map(define => {
  const idUmd = define.format === 'umd';
  const isProductionUMD = idUmd && define.env === 'production';

  const plugins = [
    node({
      // extensions: ['.mjs', '.js', '.jsx', '.ts', '.tsx', '.vue', '.json'],
    }),
    cjs(),
  ];

  const cssOutput = path.resolve(
    config.dest,
    config.name + (isProductionUMD ? '.min.css' : '.css'),
  );

  let postCssPlugins;
  if (config.postcss) {
    postCssPlugins = (config.postcss.plugins || []).slice();
    if (isProductionUMD) {
      postCssPlugins.push(
        config.pkg.require('cssnano')({
          ...config.cssnano,
        }),
      );
    }
  }

  if (config.postcss || config.vue) {
    plugins.push(
      config.pkg.require('rollup-plugin-css-only')({
        output: cssOutput,
      }),
    );
  }

  if (config.vue) {
    const baseOpts =
      define.format === 'cjs'
        ? {
            template: { optimizeSSR: true },
          }
        : {};

    plugins.push(
      config.pkg.require('rollup-plugin-vue')({
        style: {
          postcssPlugins: postCssPlugins,
          postcssModulesOptions: {
            generateScopedName: '[local]-[hash:base64:4]',
          },
        },
        ...baseOpts,
        ...config.vue,
      }),
    );
  }

  if (config.typescript) {
    plugins.push(
      config.pkg.require('rollup-plugin-typescript2')({
        ...config.typescript,
      }),
    );
  }

  if (config.babel) {
    plugins.push(
      config.pkg.require('rollup-plugin-babel')({
        ...config.babel,
      }),
    );
  }

  const replaceOptions = { __VERSION__: config.pkg.version };
  if (define.env) {
    replaceOptions['process.env.NODE_ENV'] = JSON.stringify(define.env);
  }
  plugins.push(replace(replaceOptions));

  if (isProductionUMD) {
    plugins.push(
      uglify({
        output: {
          preamble: config.banner,
        },
      }),
    );
  }

  if (config.sass) {
    plugins.push(
      config.pkg.require('rollup-plugin-sass')({
        ...config.sass,
        processor: css => {
          if (!config.postcss) return css;

          return require('postcss')(postCssPlugins)
            .process(css)
            .then(result => result.css);
        },
        output(styles, styleNodes) {
          if (fs.existsSync(cssOutput)) {
            fs.appendFileSync(cssOutput, styles, 'utf8');
          } else {
            fs.writeFileSync(cssOutput, styles, 'utf8');
          }
        },
      }),
    );
  }

  // if (config.postcss) {
  //   const opts = {
  //     ...config.postcss.plugins,
  //     extract: cssOutput,
  //   };
  //   if (!isProductionUMD) delete opts.minimize;
  //   plugins.push(config.pkg.require('rollup-plugin-postcss')(opts));
  // }

  return {
    input: config.entry,
    output: {
      exports: 'named',
      file: path.join(config.dest, define.filename),
      name: config.moduleName,
      format: define.format,
      banner: config.banner,
      globals: config.globals,
    },
    external: config.external,
    plugins,
  };
});

module.exports = entries;
