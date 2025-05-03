import { useRef, useState } from 'react';

interface Props {
  onRecorded: (b: Blob) => void;
}

export default function Recorder({ onRecorded }: Props) {
  const recRef = useRef<MediaRecorder | null>(null);
  const fileIn = useRef<HTMLInputElement>(null);
  const [rec, setRec] = useState(false);

  /* Grabar */
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

  /* Subir */
  const upload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) onRecorded(f);
    e.target.value = '';
  };

  return (
    <div className="flex flex-wrap gap-3">
      <button
        className="px-4 py-2 rounded-md bg-indigo-600 hover:bg-indigo-700 text-white shadow disabled:opacity-50"
        onClick={rec ? stop : start}
      >
        {rec ? 'Detener' : 'Grabar'}
      </button>

      <button
        className="px-4 py-2 rounded-md bg-indigo-600 hover:bg-indigo-700 text-white shadow"
        onClick={() => fileIn.current?.click()}
      >
        Subir
      </button>
      <input hidden ref={fileIn} type="file" accept="audio/*" onChange={upload} />
    </div>
  );
}
