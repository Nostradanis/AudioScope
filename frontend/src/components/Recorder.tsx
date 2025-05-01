import { useRef, useState } from 'react';

interface Props {
  onRecorded: (b: Blob) => void;
}

export default function Recorder({ onRecorded }: Props) {
  const recRef    = useRef<MediaRecorder | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const [rec, setRec] = useState(false);

  /* --- grabar --- */
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

  /* --- subir --- */
  const openPicker = () => fileInput.current?.click();
  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onRecorded(file);
    e.target.value = '';           // permite elegir el mismo de nuevo
  };

  return (
    <div style={{ display: 'flex', gap: 8 }}>
      <button onClick={rec ? stop : start}>
        {rec ? 'Detener' : 'Grabar'}
      </button>

      {/* botón real, mismo estilo que Grabar */}
      <button onClick={openPicker}>Subir</button>
      <input
        hidden
        ref={fileInput}
        type="file"
        accept="audio/*"
        onChange={handleUpload}
      />
    </div>
  );
}
