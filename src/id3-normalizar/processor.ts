// Kernverarbeitung einer einzelnen MP3-Datei
// TODO: ID3-Tags einlesen (node-id3), Deezer-API für Cover/Genre, MusicBrainz-Fallback für Jahr
export async function processFile(_filePath: string): Promise<void> {
    // Wird in processor.ts implementiert
    await Bun.sleep(1000); // Simuliere asynchrone Verarbeitung
    return Promise.resolve();
}