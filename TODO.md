# TODO — Pillminder

Current tasks. The high-level roadmap lives in `CLAUDE.md`.
Tick `[x]` in the commit that closes a task.

## ✅ Setup (done)

- [x] Expo project init (SDK 56, TypeScript, Expo Router)
- [x] Install `expo-sqlite`
- [x] `.gitignore` (+ `.idea/`)
- [x] Project decisions written down in `CLAUDE.md`
- [x] ESLint + Prettier
- [x] Architecture: `domain/` (pure logic), `db/`, `app/`, `components/`, `hooks/`

## Weekend 1–2 — product card + taking + reminders

- [x] SQLite schema (tables: `products`, `schedules`, `doses`, `notes`) + migrations
- [x] Data-access layer (`src/db/`) — CRUD functions for products
- [x] Product list screen (`src/app/index.tsx`)
- [x] Add / edit / delete product screen (name, category, price, link, stock)
- [x] Intake rhythm config (daily / every X days / at a time; range from–to or indefinite)
- [x] Generate planned doses (slots) from the rhythm
- [x] "Taken" button → persist dose state (in-app, on the Home/Today tab)
- [x] Decrement stock on "taken" (and restore on undo) — atomic via a single
      `db.transaction` in setDoseState; guarded by state transition
- [x] i18n — PL + EN translation scaffold, organize dictionaries in alphabetical order
- [x] Push notifications (Expo) with "Taken" / "Snooze" actions — local
      scheduled notifications per dose (`expo-notifications`), category actions
      open the app and run the handler (`takeDose` / `snoozeDose`). Synced with
      doses on schedule create/edit, cancelled on take, rescheduled on undo.
      Note: true background action handling (act without opening app) deferred.
- [x] In-app "taken" also dismisses the delivered notification (not just the
      scheduled one) — `dismissDoseReminder`. Double-take (app + notification) is
      already stock-safe via the state-transition guard in `setDoseState`.
- [x] Dose status indicator on the Today tab — pulsing blue dot = pending,
      solid green = taken (`DoseStatusDot`, reanimated).
- [x] Snooze is persisted (`doses.snoozed_until`) and surfaced on the Today tab
      ("snoozed → HH:MM"); cleared on take/undo.

## Weekend 3 — stock + reorder alert

- [x] Unit counter on the product — stock field with +/- stepper buttons in
      the editor for quick top-ups; auto-decrement on take already in place.
- [x] Compute reorder alert moment (from rhythm and stock) — pure
      `reorderStatus` in `src/products/reorder.ts`: dailyConsumption summed
      across schedules, `daysLeft = stock / dailyConsumption`, low when fewer
      than the threshold (default 7) days of supply remain.
- [x] Visual low-stock alert — amber badge on the product list, fed by
      `useReorderStatuses` (joins each product's stock with its schedules).
- [ ] Reorder notification — a dedicated, fire-once notification when a product
      crosses the low-stock threshold (`reorderStatus.isLow`), separate from the
      per-dose "take" reminder. Different timing (one-shot, not per dose) and a
      different action ("Buy" → `storeLink`). Reuses the existing
      `notification-service` plumbing with a new category. Re-arm after stock is
      topped up so it can fire again next time.

## Weekend 4 — history + polish

- [ ] History screen (taken / skipped)
- [ ] "What was active in a period" view (for the doctor)
- [ ] JSON data export / import
- [ ] UI polish, active/archived statuses

## Version 2 — app growth (deferred)

- [ ] Product images — multiple per product, not one field. Use case: at the
      pharmacy you forget the name/look, so you show a photo. Roles: box (name +
      dose backup), pill (recognise loose tablets in an organiser), receipt /
      prescription (price + where to buy + refill). Local: `expo-image-picker`
      (camera/gallery) → file in the document directory (`expo-file-system`),
      store only the path in the DB (not a blob). Schema: a `product_images`
      table (`productId`, `uri`, `role`), not an `imageUri` column. Needs: file
      cleanup on product delete, decision on images in JSON export/import.
      Rejected for now: fetching the image from the link (scraping `og:image`) —
      fragile and conflicts with local-first / no-backend.
- [ ] Escalating reminders — miss the first → a sharper one after X min → a
      third. Pure notifications + timers over the existing dose slots. Biggest
      lever on "I forgot". Extend Snooze with a time picker while here.
- [ ] Adherence stats — "22/30 this month" + streak ("12 days in a row"). Data
      already exists in the dose slots; this is a view + a counter. Real value
      at the doctor and for motivation.
- [ ] Quiet hours / smart timing — don't fire at night; shift a dose into the
      user's active window. Fewer ignored notifications = fewer misses.
- [ ] Bulk confirm — evening review: list today's pending doses, confirm them in
      one tap. Lowers confirmation friction.
- [ ] Travel planning — given a trip (away N days), compute the doses needed
      (from the rhythm) and check against current stock. Two prompts: "buy a
      refill now — you'll run out while away / right after you get back" and
      "pack X portions for the trip — you can't buy them there". Reuses the
      rhythm + stock the reorder logic already needs.
- [ ] Search / filter / sort for list views — starting with the product list
      (by name, category, status). Extend to other views as they are defined.
- [ ] Home tab dashboard — expand beyond today's doses: next doses due in X
      time, low-stock / reorder reminders, summary widgets. Exact layout TBD.
      (Home is already the index route with today's doses + "Taken".)

## Backlog / later (GitHub Issue candidates)

- [ ] Revisit tab swiping (`TabSwipe`). Current impl: Fling gesture → router
      navigate + a Keyframe enter animation, with a `key` remount on focus
      (resets scroll / re-subscribes live queries). It's a workaround because
      expo-router 56 dropped classic react-navigation, so real drag-follow
      paging (material-top-tabs / pager-view across routes) isn't supported.
      Reconsider if expo-router adds swipeable tabs, or move the 3 tabs into a
      non-routed PagerView if drag-follow becomes important.
- [ ] Version the CD APK build. Inject a version label into the artifact name
      (and optionally the `.apk` filename) — via a `workflow_dispatch` input
      and/or the git tag (`github.ref_name`). Decide on a versioning scheme
      (app `version` in `app.json`, `versionCode`, semver tags) before wiring.
- [ ] Notification actions without opening the app. Currently both actions use
      `opensAppToForeground: true`, so "Taken"/"Snooze" launch the app. To act
      in-place: `opensAppToForeground: false` + a background task
      (`expo-task-manager` / `registerTaskAsync`) that writes the dose state to
      SQLite while the app is backgrounded/killed. Needs a native module +
      rebuild; iOS has extra limitations.
- [ ] Notification delivery reliability under OEM battery optimization.
      CONFIRMED cause (Android 10): the app was battery-restricted, so Doze /
      App Standby coalesced and held scheduled alarms; setting the app to
      "unrestricted" delivered them (a held alarm fired immediately). Not a
      code bug and not exactness (`SCHEDULE_EXACT_ALARM` is Android 12+).
      Productize the fix: a one-time onboarding flow that detects the
      restriction and deep-links the user to disable battery optimization
      (`expo-intent-launcher` → battery settings, or
      `REQUEST_IGNORE_BATTERY_OPTIMIZATIONS`). Standard for alarm/medication
      apps. Consider exact-alarm permissions separately for 12+ devices.
- [ ] Speed up the dev/test loop. The CD APK build is slow (~15-20 min per
      change), too slow for iterating on notification behaviour. Use a faster
      path for everyday testing: an Android emulator + dev build with Metro
      (`expo run:android` / `--dev-client`) so JS changes hot-reload without a
      full rebuild, reserving the CD APK for milestone/device checks. Evaluate
      a local emulator setup and/or EAS build caching to cut turnaround.
