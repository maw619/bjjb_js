# bjjbibleotecajs

## If `npx expo start` fails with `TerminalReporter`

If you see:

`ERR_PACKAGE_PATH_NOT_EXPORTED ... metro ... ./src/lib/TerminalReporter`

stop using `npx expo start` for this project and use the local CLI scripts below.

## Fast fix (Windows PowerShell)

```powershell
npm uninstall -g expo-cli
npm run repair:expo
```

## Daily start commands

```powershell
npm run start
# or, if cache issues:
npm run start:clear
```

`prestart` now checks your Node version and warns if legacy global `expo-cli` is still installed.

## Manual recovery (if needed)

1. `npm uninstall -g expo-cli`
2. Delete `node_modules` and `package-lock.json`
3. `npm install`
4. `npm run start:clear`

## Important

- If you still use `npx`, force the modern CLI: `npx expo@54 start --clear`
- Supported Node range for this project: `>=20 <23`

## API host tip (physical device)

If Expo Go on a physical phone cannot hit your local backend, set:

- `EXPO_PUBLIC_API_HOST=<your-computer-lan-ip>`
- `EXPO_PUBLIC_API_PORT=8000` (or your backend port)
