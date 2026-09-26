---
name: sedmicni-summary
description: Create weekly summaries by aggregating daily summaries for Gastrohem WhatsApp conversations. This skill should be used when the user asks to generate weekly summaries, see what happened during the week, or prepare plans for next week (e.g., "Make weekly summary", "Generiši sedmični summary", "Weekly report for 20.10-27.10"). Aggregates activities per person, detects completed tasks, and generates next week's plan.
---

# Sedmični Summary

## Overview

Kreira sedmične summaries agregacijom svih dnevnih summaries iz sedmice - analizira aktivnosti i generiše strukturirane tematske summaries.

**Workflow u dva koraka:**

### Korak 1: Automatska agregacija (Script)

- Pronalazi sve dnevne `summary.md` fajlove u sedmičnom folderu
- **Podrška za dva tipa summaries:**
  - **Person-based** (po osobama) - Administracija, Svaštara
  - **Topic-based** (po temama) - Finansije, Servis
- Agregira aktivnosti po osobama ili temama kroz cijelu sedmicu
- Detektuje završene taskove (checkboxes, ključne riječi)
- Kreira bazični `sedmicni-summary.md` u root-u sedmičnog foldera

### Korak 2: Tematska analiza (Claude)

Nakon što script generiše bazični summary, Claude može restrukturirati u bogatiji format:

- **Glavni tok razgovora** - grupiranje po temama/projektima
- **Ključne odluke i akcije** - ekstrakcija važnih zaključaka
- **Kontakti** - lista firmi, osoba, brojeva telefona
- **Tabele** - poređenja, opcije, cijene
- **Action items** - konkretni sljedeći koraci sa checkboxima

**Performance:**

- Script: Brza agregacija svih dnevnih podataka
- Claude: Dubinska analiza i tematska restrukturacija

## When to Use This Skill

User says:

- "Make weekly summary"
- "Generiši sedmični summary"
- "Weekly report"
- "What happened this week"
- "Summary for 20.10 - 27.10"

**Default behavior:** Processes all weekly folders, generates summary for each.

## Workflow

### Simple Usage

**Weekly summary for all weeks:**

```bash
python .claude/skills/sedmicni-summary/scripts/generate_weekly_summary.py
```

- Finds all weekly folders across departments
- Generates `sedmicni-summary.md` for each week

**Weekly summary for specific week:**

```bash
python .claude/skills/sedmicni-summary/scripts/generate_weekly_summary.py --week "20.10 - 27.10"
```

**Weekly summary for specific department:**

```bash
python .claude/skills/sedmicni-summary/scripts/generate_weekly_summary.py --dept "svaštara"
```

**Combine filters:**

```bash
python .claude/skills/sedmicni-summary/scripts/generate_weekly_summary.py --week "20.10 - 27.10" --dept "finansije"
```

### What Happens

**Step 1: Find daily summaries**

- Scans weekly folder for all daily folders (DD.MM pattern)
- Finds `summary.md` in each daily folder
- Sorts by date chronologically

**Step 2: Parse daily summaries**

- Automatski detektuje tip summary-ja (person-based ili topic-based)
- **Person-based:** Ekstraktuje aktivnosti iz "**Aktivnosti:**" sekcija po osobama
- **Topic-based:** Ekstraktuje sve bullet points kao aktivnosti pod nazivom teme
- Podržava multiple formata (current, legacy, tematski)
- Uklanja timestamp-ove, čuva čist tekst aktivnosti

**Step 3: Aggregate by person**

- Groups all activities by person across the week
- Detects completed tasks using:
  - Checked checkboxes: `[x]` or `[X]`
  - Keywords: "završeno", "done", "completed", "gotovo", "urađeno"
- Identifies ongoing tasks (not completed)

**Step 4: Generate next week plan**

- Includes incomplete tasks from "u_toku"
- Analyzes activity patterns (sastanak, dokument, nabavka, servis, prodaja)
- Suggests continuations based on common themes

**Step 5: Write sedmicni-summary.md**

- Creates structured markdown in weekly folder root
- Includes: activities, completed tasks, next week plan
- Path: `gastrohem whatsapp/{odjel}/{sedmica}/sedmicni-summary.md`

## Summary Format

```markdown
# Sedmični Summary - {Odjel} ({DD.MM - DD.MM})

**Period:** 20.10 - 27.10
**Broj dana:** 5
**Aktivnih osoba:** 6

---

## **Ime Prezime**

### Aktivnosti u sedmici:

- [24.10] Aktivnost 1
- [25.10] Aktivnost 2
- [26.10] Aktivnost 3

### Završeni taskovi:

- ✅ Task koji je završen
- ✅ Drugi završen task

### Plan za narednu sedmicu:

- Nastaviti sa nedovršenim zadacima:
  - Task 1 koji nije završen
  - Task 2 koji treba nastaviti
- Planirati sljedeće sastanke
- Nastaviti sa dokumentacijom
```

**Primjer stvarnog sedmičnog summary-ja:**

```markdown
# Sedmični Summary - Svaštara (20.10 - 27.10)

**Period:** 20.10 - 27.10
**Broj dana:** 2
**Aktivnih osoba:** 6

---

## **Haris BiH**

### Aktivnosti u sedmici:

- [24.10] Amin
- [24.10] Allejkumu sellam,ima fabrika u Jelahu gdje sam isao po boce za hemiju trebalo.bi da oni to mog...
- [24.10] Lifeplast se zove
- [24.10] Sutra zovem elmu da mi da kontakt broj insallah
- [24.10] Moramo i sa elmom provjeriti da li moze obicne kante ili moraju biti one jace jer ide za izvoz...

### Završeni taskovi:

- _(Nema eksplicitno označenih završenih taskova)_

### Plan za narednu sedmicu:

- Nastaviti sa tekućim aktivnostima

---

## **Seval Grupacija**

### Aktivnosti u sedmici:

- [24.10] Mašala brate ti si mašina😉
- [24.10] VIS d.o.o. (Banja Luka)
- [24.10] kapaciteti do 30 litara liferplast pravi
- [24.10] Idealno ti je 15 litara
- [24.10] Evo broja za firmu Lifeplast d.o.o.: +387 32 663 633.

### Završeni taskovi:

- _(Nema eksplicitno označenih završenih taskova)_

### Plan za narednu sedmicu:

- Nastaviti sa tekućim aktivnostima
```

## Script Reference

### generate_weekly_summary.py

**Purpose:** Aggregate daily summaries into weekly summaries with task detection and next week planning

**Usage:**

```bash
# Process all weekly folders
python scripts/generate_weekly_summary.py

# Specific week
python scripts/generate_weekly_summary.py --week "20.10 - 27.10"

# Specific department
python scripts/generate_weekly_summary.py --dept "svaštara"

# Combine filters
python scripts/generate_weekly_summary.py --week "20.10 - 27.10" --dept "finansije"
```

**Arguments:**

- `--week "DD.MM - DD.MM"` - Specific week to process
- `--dept DEPARTMENT` - Specific department to process

**What it does:**

1. Finds all weekly folders matching criteria
2. Locates daily summary.md files in each week
3. Parses activities from daily summaries (supports multiple formats)
4. Aggregates by person across entire week
5. Detects completed tasks via checkboxes/keywords
6. Generates next week plan based on patterns
7. Writes `sedmicni-summary.md` in weekly folder root

**Completed task detection:**

- Checkboxes: `[x]`, `[X]`
- Keywords: "završeno", "done", "completed", "gotovo", "urađeno"

**Next week plan generation:**

- Includes incomplete tasks
- Pattern analysis: sastanak, dokument, nabavka, servis, prodaja
- Suggests continuations

## Important Notes

- **Per-folder summaries:** Each weekly folder gets its own `sedmicni-summary.md`
- **Automatic aggregation:** Script handles all aggregation logic
- **Format support:** Podržava tri formata:
  - Person-based sa "**Aktivnosti:**" sekcijama
  - Person-based legacy sa "### Što je uradio:" sekcijama
  - Topic-based (Finansije, Servis) - ekstraktuje sve bullet points
- **Auto-detection:** Script automatski detektuje koji format je u pitanju
- **Task detection:** Uses multiple indicators to identify completed work
- **Plan generation:** Analyzes patterns to suggest next steps
- **Date format:** Weekly folders use `DD.MM - DD.MM` format
- **Daily folders:** Daily summaries in `DD.MM/summary.md` format

## Tematska Restrukturacija (Claude Workflow)

Nakon što script generiše bazični sedmični summary, Claude može ga restrukturirati u bogatiji tematski format sličan dnevnim summaries.

### Kada koristiti tematsku restrukturaciju

Koristi kada:

- Sedmica ima kompleksne projekte sa više učesnika
- Potreban je jasniji pregled glavnog toka događaja
- Treba ekstraktovati ključne odluke i kontakte
- Korisnik traži "detaljniji sedmični summary" ili "tematski organizovan summary"

### Proces restrukturacije

**Input:** Bazični sedmični summary (generiše script)

```markdown
## **Osoba X**

### Aktivnosti u sedmici:

- [24.10] Aktivnost 1
- [25.10] Aktivnost 2
  ...
```

**Output:** Kompaktni tematski summary (~180 linija)

```markdown
# Sedmični Summary - {Odjel} ({Sedmica})

**Period:** DD.MM - DD.MM | **Dana:** X | **Teme:** X

## Učesnici

- **Ime Prezime** - Kratki opis glavne aktivnosti u sedmici
- **Drugo Ime** - Fokus na X i Y

## Šta je Urađeno

**Glavne aktivnosti:**

- ✅ Ključna aktivnost 1 (Tema A)
- ✅ Ključna aktivnost 2 (Tema B)
- ✅ Ključna aktivnost 3 (Tema C)

**Ključne Odluke:**

1. **Odluka 1** - Kontekst i ko je donio
2. **Odluka 2** - Kontekst i obrazloženje

## Šta Treba za Narednu Sedmicu

**Prioriteti:**

1. **Prioritet 1** - Kratki opis zašto je prioritet
2. **Prioritet 2** - Kratki opis

**Naredni Koraci po Osobama:**

- **Osoba X:**
  - [ ] Konkretan task 1
  - [ ] Konkretan task 2
- **Osoba Y:**
  - [ ] Task

**Otvorena Pitanja:**

- ❓ Pitanje koje treba riješiti
- ❓ Drugo otvoreno pitanje

---

## Detalji po Temama

## 1. Naziv Teme

**Kontekst:** [1-2 rečenice o čemu se radilo]

**Naredni Koraci:**

- [ ] Konkretan task
- [ ] Drugi task

## 2. Druga Tema

**Kontekst:** [Opis]

**Naredni Koraci:**

- [ ] Task

---

## Kontakti i Partneri

| Kontakt   | Firma/Uloga       | Info              |
| --------- | ----------------- | ----------------- |
| Ime Osobe | Firma XYZ         | +387 XX XXX XXX   |
| Drugo Ime | Partner/Dobavljač | email@example.com |
```

### Kako Claude restrukturira

Claude koristi sljedeće tehnike za kompaktni format:

1. **Executive Summary:**

   - **Učesnici:** Lista svih učesnika sa kratkim opisom (1 linija po osobi)
   - **Šta je Urađeno:** Top 5-7 ključnih aktivnosti (sa temom u zagradi) + Ključne odluke (2-3)
   - **Šta Treba:** Prioriteti (top 2-3), Naredni koraci po osobama (sa checkboxima), Otvorena pitanja

2. **Ekstrakcija ključnih informacija:**

   - **Odluke:** Rečenice sa "dogovorio", "odlučio", "zaključio", "ide se sa"
   - **Kontakti:** Nazivi firmi, imena osoba, brojevi telefona
   - **Prioriteti:** Riječi "prioritet", "hitno", "važno"
   - **Aktivnosti:** Samo najvažnije akcije, grupisane po temama

3. **Kompaktno strukturiranje:**

   - Izbjegava ponavljanje informacija
   - Fokus na akcije i odluke, ne na svaki razgovor
   - Detaljne teme samo ako ima značajnu aktivnost
   - Tabela kontakata (ne liste)
   - Checkboxovi za sve naredne korake

4. **Generisanje planova:**
   - Top 2-3 prioriteta za narednu sedmicu
   - Konkretni taskovi sa checkboxima po osobama
   - Otvorena pitanja koja blokiraju progres

### Claude prompt za restrukturaciju

Analiziraj bazični sedmični summary i kreiraj kompaktni tematski format:

**Koraci:**

1. Identifikuj SVE učesnike i njihove glavne fokuse
2. Ekstraktuj top 5-7 najvažnijih aktivnosti (koje su dovele do rezultata)
3. Identifikuj 2-3 ključne odluke
4. Grupiši po glavnim temama/projektima (samo ako ima značajan sadržaj)
5. Ekstraktuj sve kontakte za tabelu
6. Generiši top 2-3 prioriteta za narednu sedmicu
7. Kreiraj konkretne taskove sa checkboxima po osobama
8. Identifikuj otvorena pitanja

**Cilj:** Maksimalna informacijska gustina, minimalan broj linija (~180 max)

## Best Practices

1. **Run end-of-week** - Generate weekly summaries at end of work week (Friday/Sunday)
2. **Ensure daily summaries exist** - Weekly summary requires daily summaries to aggregate
3. **Review plans** - Generated plans are suggestions based on patterns, review and adjust
4. **Use for planning** - Weekly summaries help plan next week's activities
5. **Archive regularly** - Keep weekly summaries for historical reference
6. **Check all departments** - Use without filters to process all departments at once

## Example Workflow

**User:** "Generiši sedmični summary za 20.10 - 27.10"

**Claude:**

1. Runs: `python .claude/skills/sedmicni-summary/scripts/generate_weekly_summary.py --week "20.10 - 27.10"`
2. Script output pokazuje:

   ```
   ============================================================
   SEDMIČNI SUMMARY GENERATOR
   ============================================================

   Prona��eno 6 sedmičnih foldera za procesiranje

   📊 Generiše se sedmični summary za administracija/20.10 - 27.10
      Pronađeno 1 dnevnih summary-a
   ✅ Kreiran: gastrohem whatsapp/administracija/20.10 - 27.10/sedmicni-summary.md

   📊 Generiše se sedmični summary za svaštara/20.10 - 27.10
      Pronađeno 2 dnevnih summary-a
   ✅ Kreiran: gastrohem whatsapp/svaštara/20.10 - 27.10/sedmicni-summary.md

   📊 Generiše se sedmični summary za finansije/20.10 - 27.10
      Pronađeno 2 dnevnih summary-a
   ✅ Kreiran: gastrohem whatsapp/finansije/20.10 - 27.10/sedmicni-summary.md

   ============================================================
   ✅ Uspješno generirano: 3/6
   ============================================================
   ```

3. Reports: "✅ Sedmični summaries generirani za 20.10-27.10: 3 odjela (administracija, svaštara, finansije)"

---

**User:** "Make weekly summaries for all weeks"

**Claude:**

1. Runs: `python .claude/skills/sedmicni-summary/scripts/generate_weekly_summary.py`
2. Finds all weekly folders across all departments
3. Generates `sedmicni-summary.md` for each week
4. Reports: "✅ Generirano 12 sedmičnih summaries ukupno"
