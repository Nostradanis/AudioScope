import { useRef, useState } from 'react';

interface Props { onRecorded: (b: Blob) => void; }

export default function Recorder({ onRecorded }: Props) {
  const recRef = useRef<MediaRecorder | null>(null);
  const [rec, setRec] = useState(false);

  async function start() {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mr = new MediaRecorder(stream);
    recRef.current = mr;
    const chunks: BlobPart[] = [];
    mr.ondataavailable = e => chunks.push(e.data);
    mr.onstop = () => onRecorded(new Blob(chunks, { type: 'audio/webm' }));
    mr.start();
    setRec(true);
  }
  const stop = () => { recRef.current?.stop(); setRec(false); };

  /** subir fichero local */
  function upload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) onRecorded(file);
    e.target.value = ''; // permitir subir el mismo archivo otra vez
  }

  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
      <button onClick={rec ? stop : start}>{rec ? 'Detener' : 'Grabar'}</button>
      <label style={{ cursor: 'pointer' }}>
        ⬆︎ Subir
        <input type="file" accept="audio/*" hidden onChange={upload} />
      </label>
    </div>
  );
}
