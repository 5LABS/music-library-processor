// Job-Handler: normalisiert die ID3-Tags einer einzelnen MP3-Datei.
// Gibt einen Status-String zurück (Konvention: "ok" bei Erfolg).
// TODO: ID3-Tags einlesen (node-id3), Deezer-API für Cover/Genre, MusicBrainz-Fallback für Jahr
export async function normalizeJob(_filePath: string): Promise<string> {
    await Bun.sleep(1000); // Stub: simuliert asynchrone Verarbeitung
    return "ok";
}