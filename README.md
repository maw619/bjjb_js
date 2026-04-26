# bjjbibleotecajs

## If `npx expo start` fails with `TerminalReporter`

If you see:

`ERR_PACKAGE_PATH_NOT_EXPORTED ... metro ... ./src/lib/TerminalReporter`

you are usually hitting a legacy Expo CLI path (or stale dependencies).

## Use these commands (Windows PowerShell)

```powershell
npm uninstall -g expo-cli
npm run repair:expo
```

That script removes `node_modules`, regenerates `package-lock.json`, reinstalls, and starts Expo with `--clear`.

## Manual recovery (if needed)

1. `npm uninstall -g expo-cli`
2. Delete `node_modules` and `package-lock.json`
3. `npm install`
4. `npm run start:clear`

## Important

- Prefer `npm run start` (or `npm run start:clear`) over `npx expo start` in this repo.
- If you still use `npx`, force the modern CLI: `npx expo@54 start --clear`
- Supported Node range for this project: `>=20 <23`

## API host tip (physical device)

If Expo Go on a physical phone cannot hit your local backend, set:

- `EXPO_PUBLIC_API_HOST=<your-computer-lan-ip>`
- `EXPO_PUBLIC_API_PORT=8000` (or your backend port)
