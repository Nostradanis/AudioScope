import { useEffect, useRef, useState } from 'react';
import WaveSurfer from 'wavesurfer.js';
import RegionsPlugin from 'wavesurfer.js/dist/plugins/regions.esm.js'; // ✔️ plugin propio del paquete
import { Sample } from '../App';

interface Props {
  samples: Sample[];
  onUpdate: (s: Sample[]) => void;
}

export default function WaveformCrop({ samples, onUpdate }: Props) {
  const wrap = useRef<HTMLDivElement>(null);
  const ws   = useRef<WaveSurfer | null>(null);
  const [region, setRegion] = useState<{ start: number; end: number } | null>(null);

  /* Cargar la forma de onda del último audio */
  useEffect(() => {
    if (!samples.length) return;

    const last = samples[samples.length - 1];
    last.blob.arrayBuffer().then(buf => {
      ws.current?.destroy();

      ws.current = WaveSurfer.create({
        container: wrap.current!,
        waveColor: '#60a5fa',
        progressColor: '#1d4ed8',
        height: 100,
        plugins: [
          RegionsPlugin.create({
            dragSelection: { slop: 5 },      // ← permite arrastrar para seleccionar
          }),
        ],
      });

      /* Mantener una sola región visible */
      ws.current.on('region-created', r => {
        setRegion({ start: r.start, end: r.end });
        Object.values(ws.current!.regions.list)
          .filter(reg => reg.id !== r.id)
          .forEach(reg => reg.remove());
      });

      ws.current.loadBlob(new Blob([buf]));
    });
  }, [samples]);

  /* Recortar cuando se pulsa ✂️ */
  async function crop() {
    if (!ws.current || !region) return;

    const { start, end } = region;
    const buf        = ws.current.backend.buffer;
    const sr         = buf.sampleRate;
    const first      = Math.floor(start * sr);
    const lastSample = Math.floor(end   * sr);
    const slice      = buf.getChannelData(0).slice(first, lastSample);

    // Crear un nuevo AudioBuffer con el fragmento
    const ctx      = new OfflineAudioContext(1, slice.length, sr);
    const newBuf   = ctx.createBuffer(1, slice.length, sr);
    newBuf.copyToChannel(slice, 0);
    const rendered = await ctx.startRendering();

    // Pasar a WAV (PCM 16-bit)
    const wavArray = encodeWav(rendered);
    const newBlob  = new Blob([wavArray], { type: 'audio/wav' });

    // Reemplazar la muestra en el estado
    const lastId = samples[samples.length - 1].id;
    onUpdate(samples.map(s => (s.id === lastId ? { ...s, blob: newBlob } : s)));

    // Limpiar selección y refrescar onda
    setRegion(null);
    ws.current.regions.clear();
    ws.current.loadBlob(newBlob);
  }

  return (
    <div style={{ position: 'relative' }}>
      <div ref={wrap} />

      {/* botón tijeras */}
      <button
        onClick={crop}
        disabled={!region}
        title="Recortar selección"
        style={{
          position: 'absolute',
          top: 8,
          right: 8,
          zIndex: 10,           // ✔️ siempre por encima de la onda
        }}
      >
        ✂️
      </button>
    </div>
  );
}

/* Utilidad: convertir AudioBuffer → WAV PCM 16-bit LE */
function encodeWav(buffer: AudioBuffer): ArrayBuffer {
  const numCh   = 1;
  const sr      = buffer.sampleRate;
  const samples = buffer.getChannelData(0);
  const out     = new DataView(new ArrayBuffer(44 + samples.length * 2));
  let   o       = 0;
  const w16 = (v: number) => { out.setInt16(o, v, true);  o += 2; };
  const u32 = (v: number) => { out.setUint32(o, v, true); o += 4; };
  const str = (s: string) => { for (let i = 0; i < s.length; i++) out.setUint8(o++, s.charCodeAt(i)); };

  str('RIFF'); u32(36 + samples.length * 2); str('WAVE');
  str('fmt '); u32(16); w16(1); w16(numCh); u32(sr); u32(sr * numCh * 2); w16(numCh * 2); w16(16);
  str('data'); u32(samples.length * 2);
  for (let i = 0; i < samples.length; i++) w16(Math.max(-32768, Math.min(32767, samples[i] * 32768)));
  return out.buffer;
}
