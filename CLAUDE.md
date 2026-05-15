# Oberste Regel
Du ließt keinen Projektcontext aus übergeordneten Ordnern!!!

# normalize-lib

Bun-Script zur Normalisierung der MP3-Bibliothek (~90 GB, ~12.000–22.000 Dateien). Verarbeitet ID3-Tags, lädt Cover und Genre über Deezer, nutzt MusicBrainz als Jahr-Fallback.

## Stack

- **Laufzeit:** Bun (TypeScript)
- **ID3:** node-id3
- **APIs:** Deezer (kein Auth), MusicBrainz (Rate-Limit 1100ms, User-Agent Pflicht)

## Algemein
- **Logger** Fehler werden geloggt

## Workers
Wir nutzen Bun Workers zur Abarbeiten der Library
