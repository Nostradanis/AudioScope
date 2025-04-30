// frontend/src/components/Recorder.tsx
import { useRef, useState } from 'react';

interface Props {
  onRecorded: (blob: Blob) => void;
}

export default function Recorder({ onRecorded }: Props) {
  const recRef = useRef<MediaRecorder | null>(null);
  const [recording, setRecording] = useState(false);

  async function start() {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mr = new MediaRecorder(stream);
    recRef.current = mr;

    const chunks: BlobPart[] = [];
    mr.ondataavailable = e => chunks.push(e.data);

    mr.onstop = () => {
      onRecorded(new Blob(chunks, { type: 'audio/webm' }));
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
    <button onClick={recording ? stop : start}>
      {recording ? 'Detener' : 'Grabar'}
    </button>
  );
}
