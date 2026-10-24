# Pillminder 💊

A local-first mobile app that reminds you to take your medications, supplements,
and care products on schedule — and tells you when to reorder before you run out.

Configure a product once (rhythm, dose, stock). After that you just tap **Taken**;
reminders, history, and low-stock alerts happen automatically. All data lives
**on the device** — no backend, no account, no server.

> Full product vision and roadmap: [`CLAUDE.md`](./CLAUDE.md).
> Screen-by-screen design: [`docs/design.md`](./docs/design.md).
> Granular tasks and bugs: [GitHub Issues](https://github.com/pKondaszewski/Pillminder/issues).

## Features (v1)

- **Products** — name, category (medication / supplement / care / nasal spray /
  eye drops / your own), dose, price, store link, photos, stock, notes, and an
  active / archived status.
- **Intake rhythm** — daily, every X days or on chosen weekdays, optionally in
  cycles with breaks and with the quantity changing in steps, at one or more
  times of day, over a date range or indefinitely.
- **Scheduled doses** — the rhythm generates planned dose "slots", each with a
  state (pending / taken / skipped); a pending dose past its time shows as
  overdue. One tap confirms a dose and decrements stock. Medication taken as
  needed is logged separately.
- **Reminders** — local notifications per dose with **Taken** / **Snooze**
  actions directly on the notification.
- **Reorder alerts** — the reorder moment is computed from rhythm + stock; you
  get an amber low-stock badge and a notification with a **Buy** action.
- **History** — a day view you can page through, a month calendar with a status
  per day, and the last 14 days on each product.
- **Today meadow** — the Start screen draws the day as a meadow with a plant per
  dose, following the sunrise and sunset of your location and the season.
- **Trip planner** — pick a date range on one calendar and get what to pack per
  product, with a road scene showing when the stock runs out.
- **Privacy** — optional app lock (biometrics or screen lock).
- **Backup** — Android Auto Backup (Google backup).
- **i18n** — Polish and English, auto-selected from the device locale.

## Tech stack

| Area          | Choice                                                                                                                                     |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| Framework     | [Expo](https://docs.expo.dev/) SDK 57 (React Native 0.86)                                                                                  |
| Language      | TypeScript                                                                                                                                 |
| Navigation    | [Expo Router](https://docs.expo.dev/router/introduction/) (file-based, in `src/app/`)                                                      |
| Database      | [expo-sqlite](https://docs.expo.dev/versions/latest/sdk/sqlite/) + [Drizzle ORM](https://orm.drizzle.team/) (migrations via `drizzle-kit`) |
| Notifications | [expo-notifications](https://docs.expo.dev/versions/latest/sdk/notifications/) + background task                                           |
| i18n          | i18next / react-i18next + expo-localization                                                                                                |
| Tooling       | ESLint + Prettier, native git hooks + lint-staged, GitHub Actions (CI + APK build)                                                         |

## Project structure

Code is grouped by feature module; each module keeps its presentation code in
its own `ui/` folder next to the service, DTOs and pure logic (see
[`CLAUDE.md`](./CLAUDE.md) for the layering rules enforced by ESLint).

```
src/
  app/            # Expo Router routes (tabs: Start, Products, Plan, Settings)
  products/       # product domain: repository, service, reorder logic, DTOs, ui/
  schedules/      # schedule domain: rhythm, cycles, steps, repository, service, ui/
  doses/          # dose domain: planning, status, day view logic, ui/
  intakes/        # as-needed intakes
  notifications/  # scheduling, actions, background task
  scene/          # Skia sky and meadow behind the Start screen
  settings/       # preferences store and Settings screen parts
  location/       # approximate location, sunrise and sunset
  ...             # other feature modules (see `src/`)
  commons/ui/     # theme, shared components, navigation
  config/
    db/           # Drizzle schema + database bootstrap
    i18n/         # i18next setup + PL/EN locale JSON
drizzle/          # generated SQL migrations + snapshots
```

## Local setup

The app uses native modules and notifications, so it does **not** run in Expo Go.
Run it as a **development build** on an Android phone (USB) or emulator.

### Prerequisites

- **Node.js 22** (matches CI) and **npm**
- **JDK 17** and the **Android SDK** (`ANDROID_HOME`, platform tools on `PATH`)
- An Android device with **USB debugging** on, or an emulator. Check it with
  `adb devices -l` (status must be `device`). Details and Samsung-specific
  pitfalls: [`CLAUDE.md`](./CLAUDE.md#running-locally-dev-build).

### Run it

1. Install dependencies:

   ```bash
   npm ci
   ```

2. Build and install the dev build (first run, and after any native, permission
   or `app.json` change):

   ```bash
   npx expo run:android
   ```

3. For JS-only changes, start the dev server and open the installed app
   (hot reload, no rebuild):

   ```bash
   npx expo start --dev-client
   ```

   If the app hangs on the splash screen, run `adb reverse tcp:8081 tcp:8081`
   and relaunch.

## Database & migrations

The schema lives in [`src/config/db/schema.ts`](./src/config/db/schema.ts) and is
the single source of truth. After changing it, generate a migration:

```bash
npx drizzle-kit generate --name <snake_case_description>
```

This diffs the schema against the previous snapshot and writes a new versioned
`.sql` file into `drizzle/`. Migrations are applied on the device at app startup.
You don't hand-write SQL or edit the generated files.

## Building a release APK (Android)

CI builds an APK automatically on every push to `main` (see
[`.github/workflows/cd.yml`](./.github/workflows/cd.yml)) and uploads it as a
build artifact named `pillminder-<version>-<sha7>` (`expo.version` from
`app.json` and the first 7 characters of the commit SHA, e.g.
`pillminder-1.0.0-1ecb685`). The APK requires Android 13 (API 33) or
newer. To build one locally:

```bash
npx expo prebuild --platform android --no-install
cd android && ./gradlew assembleRelease
# output: android/app/build/outputs/apk/release/*.apk
```

## Scripts

| Command                                  | What it does                            |
| ---------------------------------------- | --------------------------------------- |
| `npm start`                              | Start the Expo dev server               |
| `npm run android`                        | Build and run the dev build on Android  |
| `npm run lint`                           | ESLint                                  |
| `npm run typecheck`                      | `tsc --noEmit`                          |
| `npm test`                               | Jest                                    |
| `npx drizzle-kit generate --name <name>` | Generate a DB migration from the schema |

CI runs lint + typecheck + test on every push and PR
([`.github/workflows/ci.yml`](./.github/workflows/ci.yml)).
