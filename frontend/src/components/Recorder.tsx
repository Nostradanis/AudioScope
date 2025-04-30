import { useRef, useState } from 'react';

interface Props {
  onRecorded: (blob: Blob) => void;
}

export default function Recorder({ onRecorded }: Props) {
  const recRef = useRef<MediaRecorder | null>(null);
  const [recording, setRecording] = useState(false);

  /** URL del último audio grabado (para el botón ▶️) */
  const [lastURL, setLastURL] = useState<string | null>(null);

  async function start() {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mr = new MediaRecorder(stream);
    recRef.current = mr;

    const chunks: BlobPart[] = [];
    mr.ondataavailable = e => chunks.push(e.data);

    mr.onstop = () => {
      const blob = new Blob(chunks, { type: 'audio/webm' });
      onRecorded(blob);

      /* crea URL reproducible */
      setLastURL(URL.createObjectURL(blob));
      chunks.length = 0;
    };

    mr.start();
    setRecording(true);
  }

  function stop() {
    recRef.current?.stop();
    setRecording(false);
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <button onClick={recording ? stop : start}>
        {recording ? 'Detener' : 'Grabar'}
      </button>

      {/* Botón ▶️ para oír lo recién grabado */}
      {lastURL && (
        <button onClick={() => new Audio(lastURL).play()}>
          ▶︎ Reproducir última
        </button>
      )}
    </div>
  );
}
