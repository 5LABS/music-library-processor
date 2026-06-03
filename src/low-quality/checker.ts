// Job-Handler: prüft, ob eine MP3-Datei "low quality" ist.
// Status-Encoding (Konvention): "ok"  -> Qualität in Ordnung
//                               "lowq:<bitrate>" -> unter dem Schwellwert
// Der Manager sammelt alle Treffer mit Präfix "lowq" ein.
// TODO: echte Bitrate-Erkennung (mp3-Header / node-id3) implementieren.
export async function lowQualityJob(_filePath: string): Promise<string> {
    await Bun.sleep(1000); // Stub: simuliert asynchrone Analyse
    return "ok";
}
