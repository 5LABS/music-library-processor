# Oberste Regel
Du ließt keinen Projektcontext aus übergeordneten Ordnern!!!

# normalize-lib

Bun-Script zur Normalisierung der MP3-Bibliothek (~90 GB, ~12.000–22.000 Dateien). Verarbeitet ID3-Tags, lädt Cover und Genre über Deezer, nutzt MusicBrainz als Jahr-Fallback.

## Stack

- **Laufzeit:** Bun (TypeScript)
- **ID3:** node-id3
- **APIs:** Deezer (kein Auth), MusicBrainz (Rate-Limit 1100ms, User-Agent Pflicht)

## Verzeichnisstruktur

```
normalize-lib/
├── index.ts              ← CLI-Einstieg, WorkerPool-Initialisierung
└── src/
    ├── worker.ts         ← Worker-Einstiegspunkt (Bun Worker Thread)
    ├── pool.ts           ← WorkerPool: Queue, MB-Delegation, Callbacks
    ├── processor.ts      ← 6-stufige Verarbeitungs-Pipeline pro Datei
    ├── tags.ts           ← ID3 Read/Write (node-id3 Wrapper, Mojibake-Fix)
    ├── covers.ts         ← Deezer API (Cover, Genre, Jahr)
    ├── genres.ts         ← Genre-Mapping + Normalisierung
    ├── year.ts           ← MusicBrainz API (nur Main Thread)
    ├── logger.ts         ← Fehler-Sammlung + flush nach error.log
    └── ui.ts             ← Terminal-UI (ANSI Progress Bar, nur Main Thread)
```

## Parallelisierung: Bun Worker Threads

### Anzahl Workers

```
WORKERS = Math.min(Math.max(parseInt(process.env.WORKERS ?? "4"), 2), 8)
```

**4 Workers** (Standard). Begründung:
- Bottleneck ist Netzwerklatenz (Deezer 50–500ms), nicht CPU
- node-id3 `read()`/`write()` ist synchron → blockiert JS-Thread des Workers, aber nicht die anderen Workers
- Mehr als 6–8 Workers bringen keinen Durchsatz-Gewinn, erhöhen aber MB-Request-Konkurrenz
- `WORKERS`-Env-Variable: `WORKERS=8 bun run index.ts` für schnellere Hardware

**Nicht** ein Worker pro Unterordner (= Album): Musikbibliotheken haben hunderte Albenordner → hunderte Threads, extreme Ungleichverteilung.

### Dateiverteilung: Work-Stealing-Queue (pull-basiert)

Worker signalisiert `READY` → Main Thread schickt nächsten Job. Kein statisches Round-Robin, weil MusicBrainz-Fallbacks (1100ms Delay) einzelne Workers ausbremsen würden.

### MusicBrainz Rate-Limiting: Delegation an Main Thread

Workers delegieren MB-Anfragen per `MB_REQUEST`-Message an den Main Thread. Der Main Thread ist single-threaded → serialisiert MB-Requests automatisch, kein Mutex/SharedArrayBuffer nötig. `year.ts` wird **nur im Main Thread** importiert.

## Kommunikationsprotokoll Main ↔ Worker

```typescript
// Main → Worker
type MainToWorker =
  | { type: "JOB"; jobId: number; filePath: string; albumOverride?: string }
  | { type: "MB_RESULT"; reqId: number; year: string | null }
  | { type: "SHUTDOWN" }

// Worker → Main
type WorkerToMain =
  | { type: "READY" }
  | { type: "DONE"; jobId: number; filePath: string; status: string; hasCover: boolean }
  | { type: "ERROR"; jobId: number; filePath: string; message: string }
  | { type: "MB_REQUEST"; reqId: number; artist: string; title: string }
```

Cover-Buffer (bis 300 KB) werden **nicht** per postMessage übertragen. Workers schreiben Tags inklusive Cover direkt auf die Datei (`writeTags` im Worker-Thread). Main Thread erhält nur `hasCover: boolean`.

## Verarbeitungs-Pipeline pro Datei (`processor.ts`)

1. ID3-Tags einlesen (`readTags`)
2. `clean()`: Mojibake-Fix + `#`-Split
3. `"Siehe Album"` → Album-Name + `finalizeGenre()`
4. Blacklist-Check (`DELETE_IF_VALUE`: `"unknown"`, `"other"`)
5. Remix-Erkennung + Deezer (Cover, Genre, Jahr)
6. Jahr leer? → MB-Delegation an Main Thread
7. `writeTags()` + finaler Blacklist-Loop

**Unterschied zu process-library:** `processFile()` erhält einen `mbFetcher`-Parameter statt `fetchYear` direkt zu importieren:

```typescript
export async function processFile(
  filePath: string,
  albumOverride: string | undefined,
  mbFetcher: (artist: string, title: string) => Promise<string | null>
): Promise<string>
```

## Genre-Logik

- Nicht-Remix: Genre **immer** von Deezer überschreiben
- Remix + Genre vorhanden: Genre **nicht anfassen**
- Remix + Genre leer: Genre von Deezer holen
- `"Siehe Album"` → direkt nach `clean()` durch Album-Name ersetzen

**GENRE_MAP** (lowercase Schlüssel):
```
hiphop           → Hip Hop
r bass           → RnBass
r&b, r and b     → R&B
rhythm and blues
edm              → EDM
international    → Deutsch Rap
hiphop dirty     → Hip Hop Dirty
```

## APIs

| API | Auth | Rate-Limit | Verwendet für |
|---|---|---|---|
| Deezer `/search` | keine | keine | Track-Suche (4 Fallback-Varianten) |
| Deezer `/album/{id}` | keine | keine | Genre (erstes aus `genres.data`) |
| Deezer `/search/artist` | keine | keine | Cover-Fallback |
| MusicBrainz `/recording/` | User-Agent | 1100ms | Jahr-Fallback |

**MusicBrainz User-Agent:** `library-konverter/1.0.0 (thisisgiuliano@gmail.com)`

## Ausführen

```bash
cd normalize-lib
bun run index.ts
# Pfad zur Musikbibliothek eingeben (Standard: $MUSIC_PATH oder ./music)

WORKERS=8 bun run index.ts   # mehr Workers
WORKERS=2 bun run index.ts   # weniger Workers
```

Fehler werden in `error.log` im Arbeitsverzeichnis geschrieben.
