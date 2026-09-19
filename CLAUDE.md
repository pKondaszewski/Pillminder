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
- what was active during a given period (useful at the doctor's)

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
- iOS + Android from a single codebase
- data stored locally on the device (no backend, no API, no server)
- push notifications built into Expo
- priority: smartphone, laptop out of scope

---

## Decisions (locked)

These are settled and should not be re-litigated without a reason:

- **Stack**: Expo (SDK 56) + React Native + **TypeScript**
- **Navigation**: **Expo Router** (file-based routes in `src/app/`)
- **Database**: **expo-sqlite** + **Drizzle ORM** — type-safe schema and
  queries, migrations generated with `drizzle-kit`
- **Language (UI)**: **PL + EN** — i18n from the start
- **Users**: single user, one list (no profiles)
- **Backup**: simple **JSON export / import** (in scope for v1)
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
notifications entirely (`isSupported = false`), so all notification testing
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
  https://docs.expo.dev/versions/v56.0.0/ before writing any code.
- **Commits** — follow Conventional Commits
  (https://www.conventionalcommits.org/en/v1.0.0/).
- **Code style** — order by importance, public first. In every file the
  exported (`export`) functions go above private helpers: the public API reads
  first, the implementation details below it.
