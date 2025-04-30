// frontend/src/components/WaveformCrop.tsx
import { useEffect, useRef, useState } from 'react';
import WaveSurfer from 'wavesurfer.js';
import RegionsPlugin from '@wavesurfer/regions';          // 👈 nuevo import
import { Sample } from '../App';

interface Props {
  samples: Sample[];
  onUpdate: (s: Sample[]) => void;
}

export default function WaveformCrop({ samples, onUpdate }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const wsRef = useRef<WaveSurfer | null>(null);
  const [region, setRegion] = useState<{ start: number; end: number } | null>(
    null
  );

  /* 1 – Cargar el último audio cada vez que se añade una muestra */
  useEffect(() => {
    if (!samples.length) return;

    const latest = samples[samples.length - 1];
    latest.blob.arrayBuffer().then(buf => {
      wsRef.current?.destroy();

      wsRef.current = WaveSurfer.create({
        container: wrapRef.current!,
        height: 100,
        waveColor: '#60a5fa',
        progressColor: '#1d4ed8',
        plugins: [
          RegionsPlugin.create({
            dragSelection: true,   // permite arrastrar con ratón o dedo
          }),
        ],
      });

      /* Mantener una sola región a la vez */
      wsRef.current.on('region-updated', r =>
        setRegion({ start: r.start, end: r.end })
      );
      wsRef.current.on('region-created', r => {
        setRegion({ start: r.start, end: r.end });
        Object.values(wsRef.current!.regions.list)
          .filter(reg => reg.id !== r.id)
          .forEach(reg => reg.remove());
      });

      wsRef.current.loadBlob(new Blob([buf]));
    });
  }, [samples]);

  /* 2 – Botón tijeras */
  async function crop() {
    if (!region || !wsRef.current) return;

    const { start, end } = region;
    const buffer = wsRef.current.backend.buffer;
    const sampleRate = buffer.sampleRate;

    // Recortar el canal 0 — mono
    const first = Math.floor(start * sampleRate);
    const last = Math.floor(end * sampleRate);
    const slice = buffer.getChannelData(0).slice(first, last);

    // Crear un nuevo AudioBuffer con ese fragmento
    const ctx = new OfflineAudioContext(1, slice.length, sampleRate);
    const newBuf = ctx.createBuffer(1, slice.length, sampleRate);
    newBuf.copyToChannel(slice, 0);
    const rendered = await ctx.startRendering();

    // Codificar a WAV (PCM) — suficiente para la PWA
    const wav = encodeWav(rendered);
    const newBlob = new Blob([wav], { type: 'audio/wav' });

    // Sustituir la muestra en el array
    const lastId = samples[samples.length - 1].id;
    onUpdate(
      samples.map(s => (s.id === lastId ? { ...s, blob: newBlob } : s))
    );

    // Limpiar región y forma de onda
    setRegion(null);
    wsRef.current.regions.clear();
    wsRef.current.loadBlob(newBlob);
  }

  return (
    <div style={{ position: 'relative' }}>
      <div ref={wrapRef} />
      <button
        style={{ position: 'absolute', top: 8, right: 8 }}
        disabled={!region}
        onClick={crop}
        title="Recortar selección"
      >
        ✂️
      </button>
    </div>
  );
}

/* ——— util: codificar AudioBuffer a WAV PCM 16-bit ——— */
function encodeWav(buffer: AudioBuffer): ArrayBuffer {
  const numChannels = 1;
  const sampleRate = buffer.sampleRate;
  const samples = buffer.getChannelData(0);
  const dataview = new DataView(new ArrayBuffer(44 + samples.length * 2));
  let offset = 0;

  function writeString(s: string) {
    for (let i = 0; i < s.length; i++) dataview.setUint8(offset++, s.charCodeAt(i));
  }
  function writeUint32(v: number) {
    dataview.setUint32(offset, v, true);
    offset += 4;
  }
  function writeUint16(v: number) {
    dataview.setUint16(offset, v, true);
    offset += 2;
  }

  // RIFF header
  writeString('RIFF');
  writeUint32(36 + samples.length * 2);
  writeString('WAVE');
  // fmt sub-chunk
  writeString('fmt ');
  writeUint32(16);
  writeUint16(1);                // PCM
  writeUint16(numChannels);
  writeUint32(sampleRate);
  writeUint32(sampleRate * numChannels * 2);
  writeUint16(numChannels * 2);  // block align
  writeUint16(16);               // bits
  // data sub-chunk
  writeString('data');
  writeUint32(samples.length * 2);

  // PCM 16-bit LE
  for (let i = 0; i < samples.length; i++) {
    let s = Math.max(-1, Math.min(1, samples[i]));
    dataview.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
    offset += 2;
  }
  return dataview.buffer;
}
