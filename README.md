# Pillminder 💊

A local-first mobile app that reminds you to take your medications, supplements,
and care products on schedule — and tells you when to reorder before you run out.

Configure a product once (rhythm, dose, stock). After that you just tap **Taken**;
reminders, history, and low-stock alerts happen automatically. All data lives
**on the device** — no backend, no account, no server.

> Full product vision and roadmap: [`CLAUDE.md`](./CLAUDE.md).
> Current granular tasks: [`TODO.md`](./TODO.md).

## Features (v1)

- **Products** — name, category (medication / supplement / care), dose, price,
  store link, stock, notes, and an active / archived status.
- **Intake rhythm** — daily or every X days, at one or more times of day, over a
  date range or indefinitely.
- **Scheduled doses** — the rhythm generates planned dose "slots", each with a
  state (pending / taken / skipped). One tap confirms a dose and decrements stock.
- **Reminders** — local notifications per dose with **Taken** / **Snooze**
  actions directly on the notification.
- **Reorder alerts** — the reorder moment is computed from rhythm + stock; you
  get an amber low-stock badge and a notification with a **Buy** action.
- **History** — per-product list of what was taken / skipped.
- **i18n** — Polish and English, auto-selected from the device locale.

## Tech stack

| Area          | Choice                                                                                                                                     |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| Framework     | [Expo](https://docs.expo.dev/) SDK 56 (React Native 0.85)                                                                                  |
| Language      | TypeScript                                                                                                                                 |
| Navigation    | [Expo Router](https://docs.expo.dev/router/introduction/) (file-based, in `src/app/`)                                                      |
| Database      | [expo-sqlite](https://docs.expo.dev/versions/latest/sdk/sqlite/) + [Drizzle ORM](https://orm.drizzle.team/) (migrations via `drizzle-kit`) |
| Notifications | [expo-notifications](https://docs.expo.dev/versions/latest/sdk/notifications/) + background task                                           |
| i18n          | i18next / react-i18next + expo-localization                                                                                                |
| Tooling       | ESLint + Prettier, Husky + lint-staged, GitHub Actions (CI + APK build)                                                                    |

## Project structure

```
src/
  app/            # Expo Router routes (index = Today, products, schedules)
  products/       # product domain: repository, service, reorder logic, DTOs
  schedules/      # schedule domain: repository, service, helpers
  doses/          # dose domain: repository, service, validation, DTOs
  notifications/  # scheduling, actions, background task
  config/
    db/           # Drizzle schema + database bootstrap
    i18n/         # i18next setup + PL/EN locale JSON
  ui/
    components/   # screens and reusable components
    hooks/        # data hooks (live SQLite queries)
    commons/      # theme, formatting helpers
drizzle/          # generated SQL migrations + snapshots
```

## Local setup

### Prerequisites

- **Node.js 22** (matches CI)
- **npm**
- A phone with the **Expo Go** app installed
  ([iOS App Store](https://apps.apple.com/app/expo-go/id982107779) /
  [Google Play](https://play.google.com/store/apps/details?id=host.exp.exponent)),
  on the **same Wi-Fi network** as your computer.

### Run it

1. Install dependencies:

   ```bash
   npm install
   ```

2. Start the Expo dev server:

   ```bash
   npm start
   ```

3. A **QR code** appears in the terminal. Open it with your phone:
   - **Android** — open **Expo Go** → _Scan QR code_.
   - **iOS** — open the **Camera** app, point it at the QR code, tap the banner.

   The app loads on your phone and hot-reloads as you edit files. Shake the phone
   for the dev menu.

> **Emulator / simulator instead of a phone?** With the dev server running, press
> `a` for an Android emulator or `i` for an iOS simulator in the terminal
> (or use `npm run android` / `npm run ios`).

### A note on notifications in Expo Go

Expo Go is great for the UI and everyday flows. However, the **full notification
behaviour** — background action handling and responding to **Taken** / **Snooze**
while the app is killed — relies on native code and a registered background task,
which Expo Go can't run. For that, use a **development build** or the **release
APK** (see below). The in-app dose flow and history work fine in Expo Go.

## Database & migrations

The schema lives in [`src/config/db/schema.ts`](./src/config/db/schema.ts) and is
the single source of truth. After changing it, generate a migration:

```bash
npx drizzle-kit generate
```

This diffs the schema against the previous snapshot and writes a new versioned
`.sql` file into `drizzle/`. Migrations are applied on the device at app startup.
You don't hand-write SQL or edit the generated files.

## Building a release APK (Android)

CI builds an APK automatically on every push to `main` (see
[`.github/workflows/cd.yml`](./.github/workflows/cd.yml)) and uploads it as a
build artifact (`pillminder-apk`). To build one locally:

```bash
npx expo prebuild --platform android --no-install
cd android && ./gradlew assembleRelease
# output: android/app/build/outputs/apk/release/*.apk
```

## Scripts

| Command                    | What it does                            |
| -------------------------- | --------------------------------------- |
| `npm start`                | Start the Expo dev server (QR code)     |
| `npm run android`          | Start and open on an Android emulator   |
| `npm run ios`              | Start and open on an iOS simulator      |
| `npm run web`              | Run in the browser (limited)            |
| `npm run lint`             | ESLint                                  |
| `npm run typecheck`        | `tsc --noEmit`                          |
| `npx drizzle-kit generate` | Generate a DB migration from the schema |

CI runs lint + typecheck + test on every push and PR
([`.github/workflows/ci.yml`](./.github/workflows/ci.yml)).
