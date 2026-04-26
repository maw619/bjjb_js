# bjjbibleotecajs

## Expo startup (Windows) troubleshooting

If you see this error:

`ERR_PACKAGE_PATH_NOT_EXPORTED ... metro ... ./src/lib/TerminalReporter`

it usually means your shell is using an older Expo CLI path instead of the SDK 54 local CLI.

### Fix steps

1. Use the project scripts (they force the local Expo CLI):
   - `npm run start`
   - `npm run android`
   - `npm run web`

2. Ensure you are not using the legacy global CLI:
   - `npm uninstall -g expo-cli`

3. Reinstall dependencies cleanly:
   - delete `node_modules`
   - delete `package-lock.json`
   - run `npm install`

4. Clear Expo cache:
   - `npx expo start --clear`

5. Verify Node version:
   - this project supports Node `>=20 <23`
   - check with `node -v`

### API host tip (physical device)

If Expo Go on a physical phone cannot hit your local backend, set:

- `EXPO_PUBLIC_API_HOST=<your-computer-lan-ip>`
- `EXPO_PUBLIC_API_PORT=8000` (or your backend port)
