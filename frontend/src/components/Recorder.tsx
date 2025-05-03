// frontend/src/components/Recorder.tsx
import { useRef, useState } from 'react';

interface Props {
  onRecorded: (b: Blob) => void;
}

export default function Recorder({ onRecorded }: Props) {
  const recRef = useRef<MediaRecorder | null>(null);
  const fileIn = useRef<HTMLInputElement>(null);
  const [rec, setRec] = useState(false);

  async function start() {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mr = new MediaRecorder(stream);
    recRef.current = mr;
    const chunks: BlobPart[] = [];
    mr.ondataavailable = (e) => chunks.push(e.data);
    mr.onstop = () => onRecorded(new Blob(chunks, { type: 'audio/webm' }));
    mr.start();
    setRec(true);
  }
  const stop = () => {
    recRef.current?.stop();
    setRec(false);
  };

  const upload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) onRecorded(f);
    e.target.value = '';
  };

  return (
    <div className="flex gap-4">
      <button
        className="px-4 py-2 rounded bg-blue-600 text-white disabled:opacity-50"
        onClick={rec ? stop : start}
      >
        {rec ? 'Detener' : 'Grabar'}
      </button>

      <button
        className="px-4 py-2 rounded bg-blue-600 text-white"
        onClick={() => fileIn.current?.click()}
      >
        Subir
      </button>
      <input type="file" accept="audio/*" hidden ref={fileIn} onChange={upload} />
    </div>
  );
}
