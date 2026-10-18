# Pillminder design (v1 redesign)

This is the source of truth for the redesign. The mockups live on a Claude Design canvas
(https://claude.ai/artifact/WB4NtDkvGumGVsztNsGTas); sandbox agents cannot open it, so everything
needed to build the screens is written down here. Where this document and the current app
disagree, this document wins.

Style: clean and clinical ("A · Klinika"). White ground, one blue accent, status colors only
where something needs attention, generous spacing, no emoji in UI copy, no em dashes ("—") in
any string: use "-".

## 1. Tokens

### 1.1 Colors

Light and dark are both required (Settings → Motyw: system / jasny / ciemny).

| Token           | Light                 | Dark      | Use                                                                 |
| --------------- | --------------------- | --------- | ------------------------------------------------------------------- |
| `background`    | `#FFFFFF`             | `#0E141B` | screen ground                                                       |
| `surface`       | `#F4F6F8`             | `#18212B` | gray cards, summaries, inputs                                       |
| `border`        | `#E3E8EE`             | `#26303B` | card and button outlines                                            |
| `divider`       | `#EEF2F5`             | `#1E2731` | row separators                                                      |
| `borderStrong`  | `#D5DEE7`             | `#34404C` | inputs, secondary buttons                                           |
| `text`          | `#0F1B2A`             | `#E6EBF0` | primary text                                                        |
| `textSecondary` | `#5B6675`             | `#9AA6B3` | labels, secondary lines                                             |
| `textTertiary`  | `#8A94A1`             | `#7D8894` | hints, captions                                                     |
| `accent`        | `#0B6E99`             | `#3A9AD0` | interactive elements, active tab                                    |
| `onAccent`      | `#FFFFFF`             | `#0E141B` | text on filled accent buttons (dark text in dark mode for contrast) |
| `accentSoft`    | `#E3F1F8`             | `#12293A` | active tab pill, Lek tile                                           |
| `danger`        | `#C2410C`             | `#FF8A5C` | destructive actions, validation errors                              |
| `overlay`       | `rgba(15,27,42,0.42)` | same      | behind bottom sheets and dialogs                                    |

The accent is fixed. The "Kolor akcentu" setting is removed (see §6).

### 1.2 Dose status colors

Status colors are never the accent. They mean the same thing everywhere: timeline dots, calendar
dots, the 14-day strip, row labels.

| Status                                       | Dot / fill            | Text            | Soft background                                | Dark dot / text       |
| -------------------------------------------- | --------------------- | --------------- | ---------------------------------------------- | --------------------- |
| taken (wzięta)                               | `#1F7A4D`             | `#1F7A4D`       | `#E9F4EE`, card `#EEF8F2` border `#CBE7D6`     | `#5FC28E`             |
| overdue / not ticked (zaległa, nieodhaczona) | `#D9822B`             | `#B4540A`       | row `#FFF6EC`, card `#FFFAF4` border `#F1DCC6` | `#E39448` / `#F0A060` |
| skipped (pominięta)                          | `#9AA4AF`             | `#5F6873`       | none                                           | `#6E7A86` / `#A3ADB8` |
| planned (zaplanowana)                        | hollow ring `#B9C2CC` | `textSecondary` | none                                           | `#4A5663`             |

Only overdue rows get a tinted background. Taken and skipped rows recede (strikethrough for
taken, dimmed avatar) instead of getting their own color fills.

### 1.3 Category colors (product avatars without a profile photo)

| Category    | Tile      | Icon      | Glyph  |
| ----------- | --------- | --------- | ------ |
| Lek         | `#E3F1F8` | `#0B6E99` | plus   |
| Suplement   | `#E9F4EE` | `#1F7A4D` | leaf   |
| Pielęgnacja | `#F1EEF8` | `#5B3FC4` | bottle |
| custom      | `#F1F3F5` | `#4A5562` | tag    |

### 1.4 Typography

IBM Plex Sans (400/500/600/700) for everything; IBM Plex Mono 500 for clock times and quantities
in lists (`08:00`, `18 tabl.`). Load with `expo-font` (`@expo-google-fonts/ibm-plex-sans`,
`@expo-google-fonts/ibm-plex-mono`).

| Role                                      | Size / weight                                            |
| ----------------------------------------- | -------------------------------------------------------- |
| screen title (Produkty, Plan, Ustawienia) | 30 / 700, letter-spacing -0.5                            |
| day header date, sheet titles             | 18-20 / 700                                              |
| card headline                             | 16-18 / 600-700                                          |
| body, row title                           | 15 / 500-600                                             |
| secondary line                            | 13 / 400                                                 |
| section label                             | 12 / 600, uppercase, letter-spacing 0.8, `textSecondary` |
| caption, hint                             | 12 / 400, `textTertiary`                                 |
| buttons                                   | 14-16 / 600                                              |

### 1.5 Spacing, radii, sizes

- Spacing scale: 4, 8, 10, 12, 14, 16, 20, 24. Screen side padding 20.
- Radii: buttons 10-14, cards 14-16, bottom sheet 24 (top corners), chips fully rounded,
  avatars 10 (36 px), 12 (40 px), 22 (88 px).
- Touch targets at least 44 × 44. Small corner controls (photo star and minus) keep a 44 px hit
  area around a 24-28 px visual.
- Primary action of a creation form: full-width 52 px button pinned to the bottom.

## 2. Components

Build these once and reuse them; every screen below is made of them.

- **DayPager** - header `‹  <date>  ›`: arrow buttons (44 px, outlined) on the edges, bold date
  in the middle, no "Dziś" title, no chevron, no background. Tapping the date opens the
  calendar sheet. Days change only with the arrows, never with a swipe (horizontal swipe already
  switches tabs, `TabSwipe`). On another day a small "Wróć do dziś" chip shows under the header.
- **TodayCard** - the card at the top of Dziś, three states:
  - calm (white, `border`): "Zgodnie z planem", "Następna za 1 h 50 min", next dose and time,
    no action;
  - overdue (overdue soft background): "Spóźniona 1 h 10 min" + product + "Weź", or with 2+
    overdue (`BULK_TAKE_MIN_OVERDUE`) "N zaległe · najstarsza X", at most 2 names + "i N inne",
    and "Wziąłem zaległe (N)";
  - done (green soft): "Dobra robota!" + "Wszystkie N dawek na dziś wzięte" when everything is
    taken, "Gotowe na dziś" + "4 wzięte · 1 pominięta" when the day is closed with skips. No
    "tomorrow's first dose" line.
  - past day: gray `surface` card "Podsumowanie dnia" + counts, no action.
    The card always contains the DayTimeline and a count line ("1 z 5 wzięta · 1 pominięta ·
    1 zaległa · 2 później"). There is no progress ring and no streak.
- **DayTimeline** - the day as a half circle over a horizon line: arc from 06:00 (left end)
  through 15:00 (top) to 24:00 (right end), ticks 06/12/18/24 in mono. The track is dashed; the
  part already travelled (06 → now) is solid. On today a "now" symbol sits on the arc at the
  current hour, by phase of the day: rising sun (sunrise → noon), sun (noon → sunset), moon
  (sunset → sunrise). The phases come from the saved location when there is one, otherwise
  they are fixed at 06 / 12 / 18 (also on polar day and night). The axis stays 06-24. The sky under the travelled part (down to the horizon) is filled with the
  day state: `accentSoft` calm by day, `nightSoft` calm after sunset, `overdueSoft` when
  something is overdue, `takenSoft` when everything is handled. Past and future days: arc and
  dots only, no symbol and no sky. The card title and the next-dose line sit inside the half
  circle; the counts line stays below. One dot per dose on the arc in its status color; planned
  doses are hollow rings. Doses less than an hour apart merge into one bigger dot split into pie
  slices, one per dose, each in its status color; more than 4 doses in one dot show the count and
  the most urgent color (overdue > skipped > taken). Phases come from `dayPhases(date, coords)`
  (fixed 06/12/18 without a location).
- **DoseRow** - time (mono) · avatar · name + quantity line (+ "· na czczo" when the product has
  it) · trailing part by state:
  - pending: outlined "Weź";
  - overdue: tinted row, "Pomiń" (outlined) + "Weź" (filled), in every overdue row;
  - taken: strikethrough name, dimmed avatar, "✓ 07:58" in green;
  - skipped: no strikethrough, plain text "Pominięto" in skipped gray (no pill background);
  - past day: status text + `›`, no buttons, overdue shown as orange "Nieodhaczona" without row
    tint; tapping opens the correction sheet.
- **TimeSlotSection** - "Rano / Po południu / Wieczorem / W nocy". A section where every dose is
  handled collapses to one row ("Rano · 3 wzięte · 1 pominięta ›"); a section with more than 5
  active doses shows 4 and "Pokaż wszystkie (N)".
- **UndoSnackbar** - dark pill above the tab bar: green check, "Wzięto: <name>" / "Pominięto:
  <name>", "Cofnij" in light blue.
- **ProductAvatar** - profile photo if set, otherwise the category tile (§1.3). Dimmed for taken
  doses.
- **StockBar** - days of supply, not units: full at 30+ days, half at 15, orange under 7 days
  (same threshold as the reorder alert, `reorderAt` = 7 days before running out), from `daysLeft`
  in `reorder.ts`. Label shows both units and days ("18 tabl. · 18 dni"). No schedule or untracked
  stock: no bar, just a caption.
- **SearchField** - one field with a funnel button inside (not the sliders icon, that is the
  Settings tab). Active non-default filters show as removable tokens inside the field
  ("Suplementy ×"); a dot on the funnel when a filter is on.
- **FilterSheet** - bottom sheet with chip groups or a segmented control, "Wyczyść", and a
  primary button with the result count ("Pokaż 4 produkty").
- **BottomSheet** - handle, title, content, Anuluj / Zapisz side by side. Used for every
  single-field edit.
- **FieldRow** - label left, value right, `›`; tapping opens the field's BottomSheet. Section
  header can carry the hint "Dotknij, aby zmienić".
- **StatusCard** - colored dot + title + state line; green when fine, orange with a "Napraw"
  button when not (Settings: notifications, battery).
- **ConfirmDialog** - centered for destructive actions (red primary), bottom sheet for
  non-destructive confirmations with explanation bullets.
- **EmptyState** - centered gray icon tile, title, one line, one primary action.
- **MonthCalendarSheet** - month title with ‹ ›, weekday row, day grid with a status dot per past
  day (taken / skipped / not ticked), today ringed in accent, future days without dots, product
  filter chip ("Wszystkie produkty" / "<product> ×"), month summary card ("Październik: 49 z 52
  dawek wziętych · 2 pominięte · 1 nieodhaczona · do dziś"), "Wróć do dziś" (or "Wróć do produktu"
  when opened from a product).
- **PhotoTile** - photo with a minus (delete) in the top-left and a star (profile) in the
  top-right; tap the photo to open it.
- Basics: PrimaryButton, SecondaryButton (outlined), DestructiveButton (outlined, danger text),
  Chip, SegmentedControl, Stepper (− value +), Switch, TextField.

## 3. Screens

Tabs: **Dziś, Produkty, Plan, Ustawienia**. There is no History tab.

### 3.1 Dziś (day view)

- DayPager + TodayCard (title and next dose inside the DayTimeline half circle) + doses grouped
  by TimeSlotSection.
- Past day: summary card, rows read-only with `›`, tap → correction sheet ("Co się stało z tą
  dawką?" with Wzięta / Pominięta tiles showing the stock effect, Anuluj / Zapisz). The sheet does
  not ask for the time taken.
- Future day: planned doses read-only, up to the 30-day dose horizon.
- Calendar: MonthCalendarSheet from the date.
- Empty: no products → "Zacznij od pierwszego produktu" + "Dodaj produkt" (no import link); a day
  without doses → "Dziś bez dawek · Na ten dzień nic nie zaplanowano" + "Zobacz Plan".

### 3.2 Produkty

- List: title + "Wyjazd" (labeled button with a suitcase icon) + SearchField; low-stock banner
  ("Magnez + B6 skończy się za 4 dni · Zamów"); rows with ProductAvatar, name, category · rhythm,
  StockBar; floating "+" → new product.
- Filters (FilterSheet): Kategoria chips (built-in with icons + custom), Status segment Aktywne /
  Archiwum / Wszystkie. Default "Aktywne" makes no token.
- Product screen (one scrollable view, no "Edytuj" and no "Zapisz"):
  1. header: avatar with a photo-count badge (tap → photos screen), name with strength (tap →
     rename sheet), category and status chips, "Ostatnio: dziś, 07:58";
  2. Zapas card: days big, units, StockBar, "Wystarczy do … · zamów do …", − / + and
     "+ Opakowanie (50 tabl.)" (applied immediately, undo snackbar), store link row;
  3. Harmonogram: schedule card(s) → schedule screen, "+ Dodaj";
  4. "Ostatnie 14 dni": status strip, each day tappable → that day's view, counts,
     "Cała historia w kalendarzu ›" (calendar filtered to this product). No entry list and no
     "Pokaż więcej";
  5. Notatki: notes with date, Edytuj / Usuń, add field;
  6. Szczegóły: FieldRows Kategoria, Moc / dawka, Jednostka, Rozmiar opakowania, Cena, Sklep,
     plus "Na czczo" for Lek; each opens its BottomSheet;
  7. Archiwizuj and Usuń produkt side by side.
- Price sheet: whole złote (price is an integer column), "Puste pole = bez ceny", no delete
  button. Store sheet: link or name, category suggestions (`BUILT_IN_STORE_SUGGESTIONS`).
- Archive (bottom sheet): "Przypomnienia i przyszłe dawki zostaną wyłączone", "Harmonogram,
  historia, zdjęcia i notatki zostają", "Możesz go przywrócić z filtra Archiwum", optional
  "Dlaczego?" note. Matches `archiveProduct` (schedules are kept).
- Delete (centered dialog): "Usunąć X?", schedule, full dose history, photos and notes
  go, "Zarchiwizuj zamiast tego" link, red "Usuń".
- Photos screen: 2-column grid of all photos, exactly one with a filled star (profile), minus on
  each, "Dodaj zdjęcie" tile (camera or gallery). Starring another photo moves the profile. The
  first added photo becomes profile automatically; deleting the profile photo falls back to the
  category icon.
- New product: one form (the only full form for products): optional photo tile, Nazwa, Kategoria,
  Moc / dawka (hidden for care, `supportsStrength`), Jednostka chips (tablet / capsule / drop /
  ml), "Na czczo" switch only for Lek, Zapas (stepper + pack size), Zakupy (price + store with
  suggestions), pinned "Dodaj produkt".
- Empty: "Nie masz jeszcze produktów" + "Dodaj produkt".

### 3.3 Plan

- List: title + "Dodaj" + SearchField; groups **Stałe** (no end date), **Na określony czas** (end
  date set; progress bar, "Dzień 3 z 7", "do 24 października"), **Wstrzymane** (dimmed, "wznowi
  się 1 listopada", "Wznów"). No day timeline here.
- Filters: Rodzaj chips Stałe / Na określony czas / Wstrzymane / Zakończone (default shows the
  first three; ended schedules only when chosen), Kategoria produktu chips.
- Schedule screen (no whole-screen Save): product card (→ product), course progress and stock
  warning, FieldRows Jak często / Godziny / Na dawkę / Okres, each opening a BottomSheet saved at
  once ("Zmiana dotyczy dawek od teraz. Dzisiejsze wzięte i pominięte zostają w historii"),
  next doses preview, Wstrzymaj and Usuń side by side. Times sheet: time chips with ×,
  "+ Dodaj godzinę", quick chips (08:00 / 14:00 / 20:00). Okres sheet validates end ≥ start.
- New schedule: one form, title "Nowy harmonogram", product radio list with search (+ "Nowy
  produkt"), Codziennie / Co kilka dni, time chips + quick times, per-dose stepper, Od (default
  today) / Do (default "Bez końca", presets 5 / 7 / 10 dni), stock line ("Zapas 64 kaps. wystarczy
  do 20 grudnia" or a warning), next doses preview, pinned "Dodaj harmonogram". Opened from a
  product, the product is preselected and the list is hidden.
- Empty: "Brak harmonogramów" + "Dodaj harmonogram" (without products it goes to "Dodaj produkt"
  first).

### 3.4 Ustawienia

Sections: **Przypomnienia** (StatusCards for notification permission and battery optimization,
Czas drzemki row), **Wygląd** (Język, Motyw), **Zakupy** (Waluta, e.g. "zł (PLN)"), **Kopia
zapasowa** (description + Eksportuj / Importuj side by side; import exists only here), about line
(app icon, "Pillminder 1.0.0", author).

### 3.5 First run

Logo lockup and "1 z 2 / 2 z 2" at the top, primary button + text button at the bottom.
Notifications ask (sample reminder card with Wziąłem / Drzemka, two benefits), blocked state
(three steps to enable in system settings, "Kontynuuj bez powiadomień"), battery (mock of the
Android choice with "Bez ograniczeń" highlighted). Copy follows `onboarding.*`.

### 3.6 Notifications

The app controls only the small icon, accent color, title, body and actions.

- Dose: "Przypomnienie o dawce", body "Czas wziąć 1 × Euthyrox 50 µg · na czczo", Wziąłem /
  Drzemka. Retries keep their own title.
- Reorder: "Kończy się zapas", "Magnez + B6 się kończy - czas dokupić (25 zł)", Kup, and Dodaj
  opakowanie when the pack size is known.
- Status-bar icon `ic_notification` (24 dp): monochrome simplified mark, calendar with four dots,
  the last one hollow. Not the full logo.
- Prices everywhere use the currency symbol, not the code: `Intl.NumberFormat` with
  `currencyDisplay: 'symbol'` in the app language ("25 zł", "25 €", "$25").
- Times follow the app language, not the phone clock: Polish is always 24 h ("20:00"), English
  always 12 h ("8:00 PM"), also in the time picker.
- English dates carry ordinal suffixes on the day ("14th October" in en-GB, "October 14th" in
  en-US, ranges "24th-30th October"); the day/month order follows the device region. Polish has
  no suffixes ("14 października").

## 4. Behavior rules

- **Navigation:** back always returns to the screen you came from (arrow, gesture, Android back).
  Product, schedule, photos and the creation forms are stack routes in the current tab
  (e.g. `products/[id]`, `products/new`, `products/[id]/photos`, `schedules/[id]`,
  `schedules/new`), not modals. A product opened from Plan stays in the Plan stack.
- **Nested creation:** "+ Nowy produkt" in the new-schedule form opens product creation; after
  saving it returns with the new product selected and other fields kept. The product is saved
  when created, so leaving the schedule form keeps it and drops only the unsaved schedule.
- **Editing:** existing products and schedules are edited field by field in bottom sheets, saved
  immediately. Full forms only for creating.
- **Validation:** no "required" hints up front. After Dodaj / Zapisz, missing or invalid fields
  get a red border and a short message under them ("Podaj nazwę produktu", "Wybierz kategorię"),
  the screen scrolls to the first one, and the error clears once the field is fixed. Same for
  every form and sheet (product, time, Okres end before start, price, stock, pack size).
- **Many doses:** no limit on medicines; the thresholds in TodayCard, TimeSlotSection and
  DayTimeline above apply.
- **Corrections** happen only in the day view; the calendar only navigates.

## 5. Data changes

- `products.fasting` (boolean, default false), migration e.g. `add_product_fasting`. Shown only for
  Lek; feeds the dose row and the notification body.
- Profile photo: `products.profile_image_id` (nullable, references `product_images.id`,
  on delete set null) or an `is_profile` flag on `product_images`; exactly one per product. The
  first added photo becomes profile. Backups carry no photos, so the reference is cleared on
  import.

## 6. Removed

- History tab (`src/app/history.tsx`): replaced by the day view and the calendar sheet.
- Overview ("Przegląd", `product-overview`) and period report ("Podsumowanie okresu",
  `period-report`), their modals and strings. In `CLAUDE.md` the v1 item "what was active during a
  given period" becomes "month summary in the calendar".
- Accent color setting: `ACCENT_OPTIONS`, `AccentPreference` and the `accent` field with its
  validator in `settings-store.ts`, `ACCENT_COLORS` in `theme.ts`, the override in `use-theme.ts`,
  the section in `settings.tsx`, `settings.accent*` strings. An old stored value is ignored.
- Streak ("N dni z rzędu", `home.statsStreak`) and the progress ring.
- "Nic na dziś, wolne 🎉" (replaced by the empty state above).

## 7. App icon

Rounded square in `#0B6E99`, white calendar, 2×2 pills (circle, tilted capsule, oval, circle),
the last pill in tint `#9CC9DE` ("today to take"). Needs Android adaptive icon layers
(foreground mark, background color) and a monochrome version for themed icons.
