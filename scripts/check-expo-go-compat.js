#!/usr/bin/env node
const { readFileSync } = require('fs');
const { join } = require('path');

const pkg = JSON.parse(readFileSync(join(process.cwd(), 'package.json'), 'utf8'));
const expoRange = String(pkg?.dependencies?.expo || '').trim();
const sdkMatch = expoRange.match(/(\d+)\./);
const sdkMajor = sdkMatch ? Number(sdkMatch[1]) : null;

if (!sdkMajor) {
  process.exit(0);
}

console.log(`[expo-check] Project uses Expo SDK ${sdkMajor} (${expoRange}).`);
console.log(`[expo-check] If Expo Go says incompatible, install matching Expo Go from https://expo.dev/go?sdkVersion=${sdkMajor}&platform=android&device=true`);
