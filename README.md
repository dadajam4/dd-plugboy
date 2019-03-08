# dd-plugboy

CLI for JavaScript plugin development using TypeScript, Babel, CSS preprocessor, etc.

## Instlration

```
npm install dd-plugboy -D
```

## Quick start

- Create your npm project.
- Install this package.
- Create a configuration file for this package. (It is not required)
- `npx plugboy scaffold` (package.json will be updated automatically.)
- Develop your plugin.
- `npx plugboy` (Bundle your plugin.)

## Configuration
It is not required.
However, it is usually necessary to develop plugins.

```
touch path/to/yourproject/plugin.config.js
```

Although the installation location and name of the file are optional, you can omit the setting of the path when executing the CLI command by creating it under the name of "plugin.config.js" directly under the project.

--
### target
##### type `'universal' | 'node' | 'browser'`
##### default `'universal'`

- universal  
Bundle plugins available in both NodeJS and browser environments.
- node  
Bundle plugins that are only used by NodeJS.
- browser  
Bundle plugins that are only used by Browser.

--
### entry
##### type `string`
##### default `'index.js'`

Specify the file path to be the end point of the application.
Both relative path and absolute path can be set.

--
### dest
##### type `string`
##### default `'dist'`

Specify the output destination of the bundle.

--
### name
##### type `string`
##### default `(from package.json)`

Set the name of the bundle.

--
### moduleName
##### type `string`
##### default `(Camel case with capitalized top of "config.name")`

It is handed over to rollup as it is.

--
### browserslist
##### type `string[]`
##### default `['last 2 versions', 'not IE < 11']`

This is the list of browsers supported by the plugin.

--
### vue
##### type `boolean | object`

Please enable it when developing vue plugin.
Some settings such as babel's presets are done automatically.

--
### sass
##### type `boolean | object`

Please set it to valid when using sass (or scss).

--
### cssnano
##### type `object`

This option is set to cssnano.

--
### autoprefixer
##### type `boolean | object`

Please set it to valid when using autoprefixer.

--
### postcss
##### type `boolean | object`

Please set it to valid when using autoprefixer.
If vue is enabled, this setting is automatically enabled.

--
### typescript
##### type `boolean | object`

Please set it to valid when using TypeScript.

--
### external
##### type `string[]`

It is handed over to rollup as it is.

--
### globals
##### type `{ [key: string]: string }`

It is handed over to rollup as it is.

## Requirements
In order to prevent unnecessary modules from being installed for plugin development, only minimal modules are installed in dependencies.

Install the following modules as necessary. (You can check with the message `Cannot find module 'xxxxx'` at the time of CLI execution)

- Use babel or vue `@babel/core`, `rollup-plugin-babel`
- Use vue `@vue/babel-preset-app`, `vue-template-compiler`, `rollup-plugin-vue`
- Use css `rollup-plugin-css-only`, `cssnano`
- Use postcss or vue `rollup-plugin-postcss`
- Use autoprefixer `autoprefixer`
- Use sass `node-sass`, `rollup-plugin-sass`
- Use TypeScript `typescript`, `rollup-plugin-typescript2`