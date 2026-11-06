# @suite-mini/desktop-app

Build target for the suite-mini desktop application — a slimmed-down, EVM-only Suite fork. See [PLAN.md](../PLAN.md).

> The @suite-mini/desktop-app package serves as a container for the generated/bundled code from the UI and Electron layers, and is responsible for creating the Electron app. No custom code should be added to this package, and no dependencies from the monorepo should be added to the package.json in @suite-mini/desktop-app. Doing so would break this system.

The `dependencies` defined in this package's `package.json` are [treated as Webpack externals](../desktop-app-main/webpack/core.webpack.config.ts). Electron Builder packages those runtime dependencies with the application; `devDependencies` remain build-time only.

## Development

```
yarn workspace @suite-mini/desktop-app dev
```

[Read more about development and debugging](../../docs/packages/desktop-app/index.md)

---

## Build

Prerequisites:

```
yarn
```

### Linux

```
yarn workspace @suite-mini/desktop-app build:linux
chmod u+x ./suite-mini/desktop-app/build-electron/suite-mini-[version].AppImage
./suite-mini/desktop-app/build-electron/suite-mini-[version].AppImage
```

_Note: On Debian, CentOS and similar distributions you might need to add a `--no-sandbox` flag_

### MacOS

```
yarn workspace @suite-mini/desktop-app build:mac
```

Go to `./suite-mini/desktop-app/build-electron/mac-arm64` and open the app

or start the app from terminal:

```
./suite-mini/desktop-app/build-electron/mac-arm64/suite-mini.app/Contents/MacOS/suite-mini
```

Drop the `-arm64` suffix if you are using an Intel Mac.

### Windows

```
yarn workspace @suite-mini/desktop-app build:win
```

Go to `./suite-mini/desktop-app/build-electron` and install the app

### NixOS

_Note: To run suite-mini.AppImage you need `appimage-run` package. `nix-env -iA nixos.appimage-run`_

```
yarn workspace @suite-mini/desktop-app build:linux
appimage-run ./suite-mini/desktop-app/build-electron/suite-mini-[version].AppImage
```

_Note: If build fails on a missing cache file *(.cache/\*\*/mksquashfsthis)* additionally run `./nixos-fix-binaries.sh` script and repeat build step._

---

## User data dir

Location of data directory depends on platform:

| Platform | User data dir path                 |
| -------- | ---------------------------------- |
| linux    | `/home/<user>/.config/`            |
| macOS    | `~/Library/Application Support/`   |
| Windows  | `C:\Users\<user>\AppData\Roaming\` |

Name of data directory [depends on environment](../../docs/packages/desktop-app/index.md#app-id-and-name-by-environment) and it's `@trezor/suite-desktop`, `@trezor/suite-desktop-dev` or `@trezor/suite-desktop-local`.

You can open current user data dir directly in Suite debug settings via the link in "Wipe app data" description.

## Remove IndexedDB from local machine

To remove a database, delete following folder:

`<user data dir>/IndexedDB`

## Clearing Electron cache

To clear electron cache, delete following folder:

`<user data dir>/Cache`
