# Multi-Language Support

## Available Languages

Movier now supports 8 languages with automatic fallback to English:

- 🇹🇷 Turkish (Türkçe)
- 🇬🇧 English
- 🇪🇸 Spanish (Español)
- 🇫🇷 French (Français)
- 🇩🇪 German (Deutsch)
- 🇮🇹 Italian (Italiano)
- 🇯🇵 Japanese (日本語)
- 🇰🇷 Korean (한국어)

## How It Works

1. **Language Selection**: Click the language icon in the header to choose your preferred language
2. **Content Fetching**: Movies are fetched from TMDB in your selected language
3. **Automatic Fallback**: If a movie's title or overview isn't available in your language, the app automatically shows the English version
4. **Persistent Preference**: Your language choice is saved in localStorage

## Technical Implementation

### Fallback Mechanism

When fetching movie details:
- First attempts to get content in selected language
- If `overview` is missing, automatically fetches English version
- Ensures users always see complete movie information

### Type Safety

All language-related code uses TypeScript's `Language` type:
```typescript
export type Language = "tr" | "en" | "es" | "fr" | "de" | "it" | "ja" | "ko";
```

### Localized UI

All interface text respects the language setting:
- Watchlist panel labels
- Button text
- Modal headers
- Empty state messages

## Note

The "All Languages" option has been removed to provide a more focused, language-specific experience with reliable fallbacks.
