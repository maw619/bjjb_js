#!/usr/bin/env node
const { existsSync, readFileSync, writeFileSync } = require('fs');
const { join } = require('path');

const metroPkgPath = join(process.cwd(), 'node_modules', 'metro', 'package.json');

if (!existsSync(metroPkgPath)) {
  process.exit(0);
}

const pkg = JSON.parse(readFileSync(metroPkgPath, 'utf8'));
pkg.exports = pkg.exports || {};

const requiredExports = {
  './src/lib/TerminalReporter': './src/lib/TerminalReporter.js',
  './src/lib/TerminalReporter.js': './src/lib/TerminalReporter.js',
};

let changed = false;
for (const [key, value] of Object.entries(requiredExports)) {
  if (pkg.exports[key] !== value) {
    pkg.exports[key] = value;
    changed = true;
  }
}

if (changed) {
  writeFileSync(metroPkgPath, `${JSON.stringify(pkg, null, 2)}\n`);
  console.log('[metro-patch] Added compatibility exports for TerminalReporter.');
}
