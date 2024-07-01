#!/usr/bin/env node

const path = require('path');

// Get the routes directory from the command line arguments
const args = process.argv.slice(2);

process.env.HIVE_SRC = path.resolve(process.cwd(), args[0]);

require('./../starter/src/app.js');
