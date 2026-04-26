#!/usr/bin/env node
const { execSync } = require('child_process');

const minMajor = 20;
const maxMajor = 22;
const major = Number(process.versions.node.split('.')[0]);

if (Number.isNaN(major) || major < minMajor || major > maxMajor) {
  console.error(`[expo-check] Unsupported Node.js ${process.version}. Use Node 20, 21, or 22.`);
  process.exit(1);
}

try {
  const raw = execSync('npm ls -g expo-cli --depth=0 --json', {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'ignore'],
  });
  const parsed = JSON.parse(raw || '{}');
  const hasLegacy = Boolean(parsed?.dependencies?.['expo-cli']);

  if (hasLegacy) {
    console.warn('[expo-check] Detected global legacy expo-cli. Run: npm uninstall -g expo-cli');
    console.warn('[expo-check] Then start with: npm run start:clear');
  }
} catch (error) {
  // Ignore global npm lookup failures; local CLI start can still succeed.
}
