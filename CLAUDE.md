@./README.md

## Oberste KI Coding Regeln
* Du ließt keinen Projektcontext aus übergeordneten Ordnern!!!
* Du nutzt so viele Bun Natives wie möglich
* Du schreibst pro user Promt nie mehr wie ~50 Zeilen Code aufeinmal und bearbeitest immer nur eine Datei.

## Dokumentationen:
https://bun.com/docs/runtime/workers

## Architektur
- **Laufzeit:** Bun (TypeScript)
- **ID3:** node-id3
- **Tags/Cover Fetching:** Deezer API (kein Auth)
- **Workers** Die Files werden vom Main Thread auf die Worker verteilt. Die Anzahl der Worker errechnet sich aus der Anzahl der Hardware Cores und überschreitet 8 Workers nicht.
- **Logger**  Es wird alles in einer log Datei festgehalten (Debugging)