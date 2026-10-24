# Medication and Supplement Management App

## Goal

Relieve the user from having to remember to take medications, supplements, and other health products regularly, and from keeping track of when to reorder them.

## How it works

The user configures a product once. After that, they just tap "taken". The rest happens automatically.

---

## Scope — version 1

### Product card

- name, dose / quantity, notes
- category: medication / supplement / care / custom (user-defined)
- price, link to pharmacy or store
- status: active (green) / archived (gray)
- date of last use
- note on completion (e.g. "taking a break", "substitute")

### Taking

- flexible rhythm: daily / every X days / at a specific time
- period: from-to or indefinite
- reminder with notification
- tapping "taken / used"

### Stock

- unit counter
- automatic alert when to reorder (calculated from rhythm and stock level)

### History

- when you took it, when you skipped
- month summary in the calendar

---

## Out of scope — version 1

- doctor visits (maybe version 2)
- medical knowledge base / drug interactions
- well-being analysis / health charts
- daily hygiene (soap, shampoo, etc.)

---

## Product boundary

Belongs in the app: anything that has an intake rhythm and health consequences if you forget.
Does not belong: products without a rhythm and without health consequences.

---

## Estimated time

- weekend 1-2: product card + taking + reminder
- weekend 3: stock + reorder alert
- weekend 4: history + UI polishing

## Platform

- **Expo** (React Native)
- **Android only for now** — no iOS or web code (no platform branches, no
  `.ios` / `.web` variants) until decided otherwise
- data stored locally on the device (no backend, no API, no server)
- push notifications built into Expo
- priority: smartphone, laptop out of scope

---

## Decisions (locked)

These are settled and should not be re-litigated without a reason:

- **Stack**: Expo (SDK 57) + React Native + **TypeScript**
- **Navigation**: **Expo Router** (file-based routes in `src/app/`)
- **Database**: **expo-sqlite** + **Drizzle ORM** — type-safe schema and
  queries, migrations generated with `drizzle-kit`
- **Language (UI)**: **PL + EN** — i18n from the start
- **Users**: single user, one list (no profiles)
- **Backup**: **Android Auto Backup**; the app has no export / import
- **Taking model**: **scheduled slots** — the rhythm generates planned doses,
  each with a state (taken / skipped / pending); doses left unconfirmed past
  their time automatically become "skipped". Enables full history ("22 of 30").
- **Reminders**: **notification actions** — "Taken" / "Snooze" buttons directly
  on the notification, no need to open the app.

## Process

- `CLAUDE.md` = high-level roadmap (this file)
- GitHub Issues = granular tasks, bugs, and v2 ideas

## Running locally (dev build)

Notifications require a **dev build** on a physical device — Expo Go disables
notifications entirely, so all notification testing
uses `expo run:android`, never Expo Go.

Test device: **Samsung Galaxy S26 Ultra** (SM-S948B, serial `R3GL604XT6K`),
connected by **USB cable**.

Preconditions (check every time — these silently break the connection):

- **Cable plugged in** — this is a wired workflow, no wireless.
- **USB debugging ON** — phone: Developer options → USB debugging. On first
  connect, accept the RSA "Allow USB debugging?" prompt ("Always allow").
- **Samsung Auto Blocker OFF** — it re-enables itself ~every 30 min and
  silently disables USB debugging, so `adb devices` goes empty mid-session.
  Turn it off: Settings → Security and privacy → Auto Blocker. This — not the
  cable — is the usual cause of the device dropping.

Steps:

```bash
export ANDROID_SERIAL=R3GL604XT6K

# 1. Verify the device is visible and authorized (status must be "device",
#    not "unauthorized" or empty)
adb devices -l

# 2. First build, or after any native / permission / app.json change
npx expo run:android

# 3. Subsequent JS-only runs (hot reload, no rebuild)
npx expo start --dev-client
```

If the app hangs on the splash / "Unable to load script" after an
`adb kill-server` or restart, the Metro tunnel is lost — re-run
`adb reverse tcp:8081 tcp:8081`, then relaunch.

Toolchain (Apple Silicon Mac): Temurin JDK 17, Android cmdline-tools, SDK at
`~/Library/Android/sdk`; env in `~/.zprofile`. RN 0.86 needs JDK 17 (AGP 8.x).

## Conventions

- **Expo has changed** — read the exact versioned docs at
  https://docs.expo.dev/versions/v57.0.0/ before writing any code.
- **Commits** — follow Conventional Commits
  (https://www.conventionalcommits.org/en/v1.0.0/).
- **Layout** — code is grouped by feature module (`src/products`,
  `src/schedules`, `src/doses`, ...). Each module keeps its presentation code in
  its own `ui/` folder (components and hooks, tests in `ui/__tests__`), next to
  the service, DTOs and pure logic. Shared UI (theme, base components,
  navigation, `use-theme`, ...) lives in `src/commons/ui`; `src/config` stays as
  is. Routes stay in `src/app`. A hook lives in the module whose service it
  wraps; a hook combining several modules lives in the module that owns the
  effect (e.g. `notifications/ui`).
- **UI boundary** — enforced by ESLint (`no-restricted-imports`):
  `ui/` imports the service, DTOs and pure logic of modules, never a
  repository, helper or the db (also not via a relative path like
  `../product-repository`). Nothing outside `ui/` imports from `ui/`, except
  the routes in `src/app`. Pure logic files must not import `ui/` or native
  modules, so they stay testable in Jest.
- **Code style** — order by importance, public first. In every file the
  exported (`export`) functions go above private helpers: the public API reads
  first, the implementation details below it.
- **DTOs** — an interface or type passed between services, or from a service
  to the UI, goes to the module's `dto/` folder and is re-exported from the
  module service; other modules and the UI import it from the service. A constant
  a type is derived from (an options list) goes to `dto/` together with it. A type
  used only inside one file or one module stays next to the code. File names
  in `dto/` are kebab-case after the concept, with `-input` for data a
  service accepts (`new-product-input.ts`), `-output` for data it returns
  (`today-dose-output.ts`), `-result` for a query result
  (`replace-doses-query-result.ts`) and no suffix for a plain noun
  (`coords.ts`, `reorder-status.ts`); closely related types share one file.
  Types inferred from drizzle (`$inferSelect`) stay in the repository and are
  only re-exported from the service.
- **Migrations** — generate with a descriptive snake_case name, e.g.
  `npx drizzle-kit generate --name add_dose_note` (the file becomes
  `0005_add_dose_note.sql`; without `--name` drizzle picks a random one).
  The migrations were squashed into `0000_init` before the first release; its
  `when` matches the last pre-squash migration, so existing devices skip it.
- **Transactions** — the body of `db.transaction(...)` must not be `async` or
  contain `await`. The expo-sqlite driver in drizzle is synchronous and
  commits as soon as the callback returns, so awaited work would run outside
  the transaction. Run queries with `.run()` / `.get()` / `.all()`.
  TypeScript does not catch this.
- **Tests** — files are `*-test.ts` in a `__tests__` folder next to the code.
  Every test has three marked sections, in this order: `// given` (input
  data), `// when` (a single call, result in a variable), `// then`
  (assertions). Skip only an empty `// given`. Pass `now` and any other source
  of nondeterminism (random, timers, locale) in explicitly.
