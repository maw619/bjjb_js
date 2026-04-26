#!/usr/bin/env node
const { join } = require('path');
const { existsSync, readFileSync } = require('fs');

const pkgJsonPath = join(process.cwd(), 'node_modules');
const reactPkg = join(pkgJsonPath, 'react', 'package.json');
const reactDomPkg = join(pkgJsonPath, 'react-dom', 'package.json');

if (!existsSync(reactPkg) || !existsSync(reactDomPkg)) {
  process.exit(0);
}

const reactVersion = JSON.parse(readFileSync(reactPkg, 'utf8')).version;
const reactDomVersion = JSON.parse(readFileSync(reactDomPkg, 'utf8')).version;

if (reactVersion !== reactDomVersion) {
  console.error(`Incompatible React versions found:\n- react: ${reactVersion}\n- react-dom: ${reactDomVersion}`);
  console.error('Run: npm install react@19.1.0 react-dom@19.1.0 --save-exact');
  process.exit(1);
}
