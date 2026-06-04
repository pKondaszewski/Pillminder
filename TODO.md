# TODO — PillPal

Bieżące zadania. Wysokopoziomowy roadmap jest w `CLAUDE.md`.
Odhaczaj `[x]` przy commitcie, który domyka zadanie.

## ✅ Setup (gotowe)
- [x] Init projektu Expo (SDK 56, TypeScript, Expo Router)
- [x] Instalacja `expo-sqlite`
- [x] `.gitignore` (+ `.idea/`)
- [x] Decyzje projektowe spisane w `CLAUDE.md`

## Weekend 1–2 — karta produktu + branie + przypomnienia
- [ ] Schemat bazy SQLite (tabele: `products`, `intakes` / sloty dawek) + migracje
- [ ] Warstwa dostępu do danych (`src/db/`) — funkcje CRUD na produktach
- [ ] Ekran listy produktów (`src/app/index.tsx`)
- [ ] Ekran dodawania / edycji produktu (nazwa, dawka, kategoria, notatki, cena, link, status)
- [ ] Konfiguracja rytmu brania (codziennie / co X dni / o godzinie; okres od–do lub bezterminowo)
- [ ] Generowanie zaplanowanych dawek (slotów) z rytmu
- [ ] Przycisk „wzięte" → zapis stanu dawki
- [ ] Powiadomienia push (Expo) z akcjami „Wzięte" / „Drzemka"
- [ ] i18n — szkielet tłumaczeń PL + EN

## Weekend 3 — zapasy + alert o zamówieniu
- [ ] Licznik sztuk na produkcie
- [ ] Dekrementacja zapasu przy „wzięte"
- [ ] Wyliczanie momentu alertu o zamówieniu (z rytmu i stanu)
- [ ] Wizualny alert o niskim stanie

## Weekend 4 — historia + dopracowanie
- [ ] Ekran historii (wzięte / pominięte)
- [ ] Widok „co było aktywne w okresie" (pod wizytę u lekarza)
- [ ] Eksport / import danych do JSON
- [ ] Dopracowanie UI, statusy aktywny/zarchiwizowany

## Backlog / później (kandydaci na GitHub Issues)
- [ ] (puste — dorzucaj tu pomysły odłożone na potem)
