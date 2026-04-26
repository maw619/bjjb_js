#!/usr/bin/env node
const { existsSync, rmSync } = require('fs');
const { spawnSync } = require('child_process');

const run = (cmd, args) => {
  const result = spawnSync(cmd, args, { stdio: 'inherit', shell: process.platform === 'win32' });
  if (result.status !== 0) {
    process.exit(result.status || 1);
  }
};

console.log('\n[expo-repair] Removing node_modules and package-lock.json...');
if (existsSync('node_modules')) {
  rmSync('node_modules', { recursive: true, force: true });
}
if (existsSync('package-lock.json')) {
  rmSync('package-lock.json', { force: true });
}

console.log('[expo-repair] Installing dependencies...');
run('npm', ['install']);

console.log('[expo-repair] Clearing Expo cache and starting app...');
run('node', ['./node_modules/expo/bin/cli', 'start', '--clear']);
