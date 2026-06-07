# TODO — PillPal

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
- [ ] Generate planned doses (slots) from the rhythm
- [ ] "Taken" button → persist dose state
- [ ] Push notifications (Expo) with "Taken" / "Snooze" actions
- [x] i18n — PL + EN translation scaffold, organize dictionaries in alphabetical order

## Weekend 3 — stock + reorder alert

- [ ] Unit counter on the product
- [ ] Decrement stock on "taken"
- [ ] Compute reorder alert moment (from rhythm and stock)
- [ ] Visual low-stock alert

## Weekend 4 — history + polish

- [ ] History screen (taken / skipped)
- [ ] "What was active in a period" view (for the doctor)
- [ ] JSON data export / import
- [ ] UI polish, active/archived statuses

## Version 2 — app growth (deferred)

- [ ] Product image on the card — local variant: `expo-image-picker` (camera/gallery)
      → file in the document directory (`expo-file-system`), store only `imageUri`
      in the DB (not a blob). Needs: `imageUri` field on `Product`, file cleanup
      on product delete, decision on images in JSON export/import.
      Rejected for now: fetching the image from the link (scraping `og:image`) —
      fragile and conflicts with local-first / no-backend.
- [ ] Search / filter / sort for list views — starting with the product list
      (by name, category, status). Extend to other views as they are defined.
- [ ] Home tab — summary dashboard with small widgets: what was taken today,
      next doses due in X time, low-stock / reorder reminders. Exact layout TBD.
      When added, Home becomes the index route (`app/index.tsx`) and the current
      products screen moves to `app/products.tsx` (update tab triggers + route).

## Backlog / later (GitHub Issue candidates)

- [ ] (empty — drop deferred ideas here)
