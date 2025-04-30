// frontend/src/components/WaveformCrop.tsx
import { useEffect, useRef, useState } from 'react';
import WaveSurfer from 'wavesurfer.js';
import RegionsPlugin from 'wavesurfer.js/dist/plugins/regions.esm.js';
import { Sample } from '../App';

interface Props {
  samples: Sample[];
  onUpdate: (s: Sample[]) => void;
}

export default function WaveformCrop({ samples, onUpdate }: Props) {
  const container = useRef<HTMLDivElement>(null);
  const ws = useRef<WaveSurfer | null>(null);
  const [regionId, setRegionId] = useState<string | null>(null);

  useEffect(() => {
    if (!samples.length) return;

    const latest = samples[samples.length - 1];
    latest.blob.arrayBuffer().then(buf => {
      ws.current?.destroy();
      ws.current = WaveSurfer.create({
        container: container.current!,
        waveColor: '#60a5fa',
        progressColor: '#1d4ed8',
        height: 100,
        plugins: [
          RegionsPlugin.create({
            dragSelection: {
              slop: 5,
            },
          }),
        ],
      });

      ws.current.on('region-created', r => {
        // keep one region only
        if (regionId && regionId !== r.id) {
          ws.current?.regions.list[regionId]?.remove();
        }
        setRegionId(r.id);
      });

      ws.current.loadBlob(new Blob([buf]));
    });
  }, [samples]);

  function crop() {
    if (!ws.current || !regionId) return;
    const r = ws.current.regions.list[regionId];
    if (!r) return;

    const buffer = ws.current.backend.buffer;
    const sampleRate = buffer.sampleRate;
    const start = Math.floor(r.start * sampleRate);
    const end = Math.floor(r.end * sampleRate);
    const sliced = buffer.getChannelData(0).slice(start, end);
    const ctx = new OfflineAudioContext(1, sliced.length, sampleRate);
    const newBuffer = ctx.createBuffer(1, sliced.length, sampleRate);
    newBuffer.copyToChannel(sliced, 0);
    ctx.startRendering().then(rendered => {
      ctx.encodeAudioData
        ? ctx.encodeAudioData(rendered).then(arrayBuffer => {
            replaceBlob(arrayBuffer);
          })
        : rendered
            .copyToChannel(sliced, 0) &&
          ctx.startRendering().then(ab => replaceBlob(ab));
    });

    function replaceBlob(arrayBuffer: ArrayBuffer) {
      const newBlob = new Blob([arrayBuffer], { type: 'audio/wav' });
      const lastId = samples[samples.length - 1].id;
      onUpdate(samples.map(s => (s.id === lastId ? { ...s, blob: newBlob } : s)));
    }
  }

  return (
    <div style={{ position: 'relative' }}>
      <div ref={container} />
      <button
        onClick={crop}
        disabled={!regionId}
        style={{ position: 'absolute', top: 8, right: 8 }}
      >
        ✂️
      </button>
    </div>
  );
}
