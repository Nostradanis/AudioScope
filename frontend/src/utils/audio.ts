import Meyda from 'meyda';

/**
 * Extrae MFCC promedio de todo el audio.
 * – Divide la señal en ventanas de 1024 (potencia de 2) con salto 1024.
 * – Calcula los MFCC de cada ventana y hace la media.
 * – Devuelve un vector fijo de 13 valores.
 */
export async function extractFeatures(blob: Blob): Promise<number[]> {
  const arrayBuf = await blob.arrayBuffer();

  // ── decodificar a PCM ──
  const ctx = new OfflineAudioContext(1, 16000, 16000);
  const audioBuf = await ctx.decodeAudioData(arrayBuf);
  const data = audioBuf.getChannelData(0);

  const frameSize = 1024;        // potencia de 2  (512/1024/2048…)
  const hop = frameSize;         // sin solapamiento
  const mfccs: number[][] = [];

  for (let i = 0; i + frameSize <= data.length; i += hop) {
    const frame = data.slice(i, i + frameSize) as unknown as Float32Array;

    const mfcc = Meyda.extract('mfcc', frame, {
      bufferSize: frameSize,
      sampleRate: audioBuf.sampleRate,
    }) as number[] | null;

    if (mfcc) mfccs.push(mfcc);
  }

  // si por algún motivo no hay frames válidos
  if (mfccs.length === 0) return Array(13).fill(0);

  // media de cada coeficiente
  const avg = new Array(mfccs[0].length).fill(0);
  mfccs.forEach(v => v.forEach((x, i) => (avg[i] += x)));
  return avg.map(x => x / mfccs.length);
}
