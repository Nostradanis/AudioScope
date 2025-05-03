import { useEffect, useRef } from 'react';
import WaveSurfer from 'wavesurfer.js';
import { Sample } from '../App';
\export default function Waveform({ samples }: { samples: Sample[] }) {
  const div = useRef<HTMLDivElement>(null);
  const wsRef = useRef<WaveSurfer | null>(null);

  useEffect(() => {
    if (!samples.length) return;

    const last = samples[samples.length - 1];
    last.blob.arrayBuffer().then((buf) => {
      wsRef.current?.destroy();
      wsRef.current = WaveSurfer.create({
        container: div.current!,
        waveColor: '#60a5fa',
        progressColor: '#1d4ed8',
        height: 90,
      });
      wsRef.current.loadBlob(new Blob([buf]));
    });
  }, [samples]);

  return <div ref={div} className="w-full rounded overflow-hidden shadow" />;
}
