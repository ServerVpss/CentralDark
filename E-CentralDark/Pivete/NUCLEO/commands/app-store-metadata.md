# COMANDO - app-store-metadata.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.codex\.tmp\plugins\plugins\expo\skills\expo-deployment\references\app-store-metadata.md
**SHA:** 47fbf9077985548a
**Timestamp:** 2026-08-26T18:31:13.520300
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- run: eas submit -p ios --latest
- run: eas metadata:push

### Ouro Bruto (primeiros 5000 chars)
```
# App Store Metadata

Manage App Store metadata and optimize for ASO using EAS Metadata.

## What is EAS Metadata?

EAS Metadata automates App Store presence management from the command line using a `store.config.json` file instead of manually filling forms in App Store Connect. It includes built-in validation to catch common rejection pitfalls.

**Current Status:** Preview, Apple App Store only.

## Getting Started

### Pull Existing Metadata

If your app is already published, pull current metadata:

```bash
eas metadata:pull
```

This creates `store.config.json` with your current App Store configuration.

### Push Metadata Updates

After editing your config, push changes:

```bash
eas metadata:push
```

**Important:** You must submit a binary via `eas submit` before pushing metadata for new apps.

## Configuration File

Create `store.config.json` at your project root:

```json
{
  "configVersion": 0,
  "apple": {
    "copyright": "2025 Your Company",
    "categories": ["UTILITIES", "PRODUCTIVITY"],
    "info": {
      "en-US": {
        "title": "App Name",
        "subtitle": "Your compelling tagline",
        "description": "Full app description...",
        "keywords": ["keyword1", "keyword2", "keyword3"],
        "releaseNotes": "What's new in this version...",
        "promoText": "Limited time offer!",
        "privacyPolicyUrl": "https://example.com/privacy",
        "supportUrl": "https://example.com/support",
        "marketingUrl": "https://example.com"
      }
    },
    "advisory": {
      "alcoholTobaccoOrDrugUseOrReferences": "NONE",
      "gamblingSimulated": "NONE",
      "medicalOrTreatmentInformation": "NONE",
      "profanityOrCrudeHumor": "NONE",
      "sexualContentGraphicAndNudity": "NONE",
      "sexualContentOrNudity": "NONE",
      "horrorOrFearThemes": "NONE",
      "matureOrSuggestiveThemes": "NONE",
      "violenceCartoonOrFantasy": "NONE",
      "violenceRealistic": "NONE",
      "violenceRealisticProlongedGraphicOrSadistic": "NONE",
      "contests": "NONE",
      "gambling": false,
      "unrestrictedWebAccess": false,
      "seventeenPlus": false
    },
    "release": {
      "automaticRelease": true,
      "phasedRelease": true
    },
    "review": {
      "firstName": "John",
      "lastName": "Doe",
      "email": "review@example.com",
      "phone": "+1 555-123-4567",
      "notes": "Demo account: test@example.com / password123"
    }
  }
}
```

## App Store Optimization (ASO)

### Title Optimization (30 characters max)

The title is the most important ranking factor. Include your brand name and 1-2 strongest keywords.

```json
{
  "title": "Budgetly - Money Tracker"
}
```

**Best Practices:**

- Brand name first for recognition
- Include highest-volume keyword
- Avoid generic words like "app" or "the"
- Title keywords boost rankings by ~10%

### Subtitle Optimization (30 characters max)

The subtitle appears below your title in search results. Use it for your unique value proposition.

```json
{
  "subtitle": "Smart Expense & Budget Planner"
}
```

**Best Practices:**

- Don't duplicate keywords from title (Apple counts each word once)
- Highlight your main differentiator
- Include secondary high-value keywords
- Focus on benefits, not features

### Keywords Field (100 characters max)

Hidden from users but crucial for discoverability. Use comma-separated keywords without spaces after commas.

```json
{
  "keywords": [
    "finance,budget,expense,money,tracker,savings,bills,income,spending,wallet,personal,weekly,monthly"
  ]
}
```

**Best Practices:**

- Use all 100 characters
- Separate with commas only (no spaces)
- No duplicates from title/subtitle
- Include singular forms (Apple handles plurals)
- Add synonyms and alternate spellings
- Include competitor brand names (carefully)
- Use digits instead of spelled numbers ("5" not "five")
- Skip articles and prepositions

### Description Optimization

The iOS description is NOT indexed for search but critical for conversion. Focus on convincing users to download.

```json
{
  "description": "Take control of your finances with Budgetly, the intuitive money management app trusted by over 1 million users.\n\nKEY FEATURES:\n• Smart budget tracking - Set limits and watch your progress\n• Expense categorization - Know exactly where your money goes\n• Bill reminders - Never miss a payment\n• Beautiful charts - Visualize your financial health\n• Bank sync - Connect 10,000+ institutions\n• Cloud backup - Your data, always safe\n\nWHY BUDGETLY?\nUnlike complex spreadsheets or basic calculators, Budgetly learns your spending habits and provides personalized insights. Our users save an average of $300/month within 3 months.\n\nPRIVACY FIRST\nYour financial data is encrypted end-to-end. We never sell your information.\n\nDownload Budgetly today and start your journey to financial freedom!"
}
```

**Best Practices:**

- Front-load the first 3 lines (visible before "more")
- Use bullet points for features
- Include social proof (user 
```