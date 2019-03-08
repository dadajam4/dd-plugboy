#!/usr/bin/env node

const path = require('path');
const argv = require(path.resolve(__dirname, 'argv'));
const executer = require(path.resolve(__dirname, argv._command));
executer();
