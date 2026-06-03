# Plan: Flexible Worker mit Job-Typ-Dispatch

## Context

Der Worker-Pool (`src/worker/`) funktioniert technisch (Pull-basiertes Work-Stealing: `READY` → `dispatch()` → `DONE`/`ERROR` → nächster Job), kann aber **nur eine einzige Tätigkeit**: Jeder Worker ruft hart `processFile()` auf (`worker_node.ts:20`). Das Menü (`main_menu.ts`) bietet aber bereits zwei Aktionen an — **„ID3 Tags normalisieren"** und **„Low Quality Dateien finden"** — die unterschiedliche Verarbeitung pro File brauchen.

Ziel: Worker so umbauen, dass derselbe Pool **verschiedene Job-Typen** ausführen kann, gesteuert durch die Menü-Auswahl. Ein neuer Job-Typ soll künftig nur einen Handler + einen Menüpunkt kosten — ohne Änderung an Manager oder Message-Protokoll.

Designentscheidungen (mit User abgestimmt):
- **Job-Granularität: pro Lauf.** Der User wählt im Menü *eine* Aktion; alle Files werden mit diesem Job-Typ verarbeitet (kein Mischbetrieb).
- **Ergebnis-Rückmeldung: Status-String.** `DONE.status` bleibt ein String; job-spezifische Ergebnisse werden darin kodiert (z. B. `"ok"`, `"lowq:128"`).
- **Low-Quality-Output:** Files sammeln, am Ende als Liste ausgeben + Report-Datei, danach den User interaktiv fragen, ob er sie löschen will (nicht-destruktiv by default).
- **Out of scope:** Der `inputWorker`-Bug (Eingabe wird gelesen, aber `workerCount` genutzt) bleibt unverändert. Die echte Bitrate-/ID3-Verarbeitungslogik wird nur als Stub angelegt (eigene Aufgabe).

---

## Architektur: Handler-Registry-Pattern

Kernidee — die Flexibilität liegt in einer Map im Worker:

```
JobType  ──(im JOB-Message)──►  Worker  ──lookup──►  handlers[jobType](filePath) ──► status
```

- `JobType` = die Menü-IDs (`"normalize_id3_tags" | "find_low_quality_files"`).
- Das `JOB`-Message trägt zusätzlich `jobType`.
- `worker_node.ts` hält `Record<JobType, (filePath) => Promise<string>>` und ruft den passenden Handler auf.
- Manager bleibt **job-agnostisch**: er reicht `jobType` nur durch und sammelt `status` ein.

---

## Implementierungs-Schritte (eine Datei pro Schritt, ≤ ~50 Zeilen)

### 1. `src/worker/worker_types.ts` — Protokoll erweitern
- Neuen Typ ergänzen: `export type JobType = "normalize_id3_tags" | "find_low_quality_files";`
- `MainToWorker` JOB um `jobType: JobType` erweitern:
  `{ type: "JOB"; jobId: number; filePath: string; jobType: JobType }`
- `WorkerToMain.DONE` bleibt unverändert (`status: string`).

### 2. `src/id3-normalizar/processor.ts` — Normalize-Handler als Stub
- Vorhandene `processFile` zu einem benannten Job-Handler machen, der einen Status-String zurückgibt: `export async function normalizeJob(filePath: string): Promise<string>` → liefert vorerst `"ok"` (echte node-id3/Deezer-Logik ist separate Aufgabe).

### 3. `src/low-quality/checker.ts` — Low-Quality-Handler als Stub (neue Datei)
- `export async function lowQualityJob(filePath: string): Promise<string>`
- Stub-Verhalten: gibt `"ok"` oder bei Low-Quality `"lowq:<bitrate>"` zurück. Bitrate-Erkennung (mp3-Header/node-id3) als TODO markiert — Konvention für das Status-Encoding hier festlegen.

### 4. `src/worker/worker_node.ts` — Dispatch über Registry
- Statt fixem `import { processFile } from "@/processor"` die beiden Handler importieren.
- Registry anlegen:
  ```ts
  const handlers: Record<JobType, (f: string) => Promise<string>> = {
      normalize_id3_tags: normalizeJob,
      find_low_quality_files: lowQualityJob,
  };
  ```
- Im `JOB`-Case: `const status = await handlers[msg.jobType](msg.filePath);` und `status` in die `DONE`-Message übernehmen (statt hartem `"ok"`).
- (Der bisher kaputte `@/processor`-Import verschwindet dabei als natürliche Folge des Umbaus.)

### 5. `src/worker/worker_manger_class.ts` — jobType durchreichen + status sammeln
- Konstruktor um Parameter `private jobType: JobType` erweitern.
- In `dispatch()` das Feld mitsenden: `worker.postMessage({ type: "JOB", jobId, filePath, jobType: this.jobType } satisfies MainToWorker)`.
- `onProgress`-Callback-Signatur um `status` erweitern: `(current, total, filePath, status) => void`, damit der Aufrufer Low-Quality-Treffer einsammeln kann. Im `DONE`-Case `msg.status` mitgeben.

### 6. `src/worker/worker_manager.ts` — Orchestrierung + Low-Quality-Nachbearbeitung
- `InitWorkerManger(workerCount, musicPath, jobType: JobType)` um `jobType` erweitern und an `WorkerManager` übergeben.
- Lokales Array `lowQualityFiles: string[]`; im erweiterten `onProgress`-Callback bei `status.startsWith("lowq")` den `filePath` einsammeln.
- Nach `manager.run()`: wenn `jobType === "find_low_quality_files"` → Liste via `ui.print` ausgeben, Report-Datei schreiben (`Bun.write`, z. B. `low-quality-report.txt`), dann mit dem vorhandenen `prompt`/`promtWithPrefill` fragen „Diese N Dateien löschen? (y/n)". Bei `y` löschen (Bun native), sonst nichts tun.

### 7. `src/index.ts` — Menü-Auswahl auf Job-Typ mappen
- Im `switch (result)` die beiden Job-Fälle nicht mehr nur loggen, sondern `InitWorkerManger(workerCount, musicPath, result)` aufrufen (`result` ist bereits exakt der `JobType`-String). `exit` bleibt wie gehabt; `default` als Fallback.
- Auskommentierten `InitWorkerManger`-Aufruf (Zeile 49) entfernen.

---

## Wiederverwendete vorhandene Bausteine
- Worker-Pool/Dispatch-Loop: `src/worker/worker_manger_class.ts` (Struktur bleibt, nur erweitert).
- Worker-Anzahl: `calculateWorkers()` in `src/utilis/functions.ts`.
- File-Indexierung: `searchFiles()` in `src/utilis/functions.ts`.
- UI/Progress/Prompts: `ui.update/print/finish` (`src/utilis/ui.ts`), `promtWithPrefill` (`src/utilis/functions.ts`).
- Logging: `Logger` (`src/utilis/logger.ts`).

## Erweiterbarkeit (das Ziel)
Neuer Job-Typ künftig = 3 kleine Edits: (1) String zu `JobType` hinzufügen, (2) Handler-Funktion schreiben + in die Registry in `worker_node.ts` eintragen, (3) Menüpunkt in `main_menu.ts`. Manager und Protokoll bleiben unangetastet.

---

## Verifikation
1. **Typecheck:** `bun tsc --noEmit` (bzw. `bunx tsc --noEmit`) — keine Typfehler nach den Protokoll-Änderungen.
2. **Normalize-Pfad:** `bun ./src/index.ts` → Pfad/Worker bestätigen → „ID3 Tags normalisieren" wählen → Progress-Bar läuft über alle Files, `ui.finish` zeigt Statistik. (Handler ist Stub → alle Files `ok`.)
3. **Low-Quality-Pfad:** erneut starten → „Low Quality Dateien finden" wählen → nach Lauf erscheint Liste + Report-Datei wird geschrieben → Lösch-Prompt erscheint; bei `n` bleibt alles erhalten.
4. **Test-Library:** kleinen Ordner mit ein paar MP3s anlegen (oder `MUSIC_PATH` setzen), damit der Lauf schnell durchläuft.
5. **Logfile prüfen:** `logging.log` enthält die Menü-Auswahl und ggf. Fehler.

## Bekannte Abhängigkeit (nicht Teil dieses Plans)
Für einen *echten* End-to-End-Durchlauf müssen die Stub-Handler (Schritt 2 & 3) später mit echter node-id3-/Deezer-Logik bzw. Bitrate-Erkennung gefüllt werden. Diese Plan-Iteration liefert nur das flexible Dispatch-Gerüst.
