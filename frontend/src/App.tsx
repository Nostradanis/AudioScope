import { useState } from 'react';
import Recorder from './components/Recorder';
import WaveformCrop from './components/WaveformCrop';
import LabelManager from './components/LabelManager';
import SampleTable from './components/SampleTable';
import Trainer from './components/Trainer';
import Listener from './components/Listener';

export interface Sample {
  id: string;
  blob: Blob;
  label: string;
}

export default function App() {
  const [samples, setSamples] = useState<Sample[]>([]);
  const [model, setModel] = useState<any>(null);

  return (
    <main style={{ fontFamily: 'sans-serif', padding: '1rem', maxWidth: 960, margin: '0 auto' }}>
      <h1>SoundScope PWA</h1>

      {/* 1 · Grabación */}
      <section>
        <h2>1 · Grabación</h2>
        <Recorder onRecorded={b => setSamples(s => [...s, { id: crypto.randomUUID(), blob: b, label: '' }])} />
      </section>

      {/* 2 · Recorte + Etiqueta */}
      <section style={{ marginTop: '1rem' }}>
        <h2>2 · Recorte y Etiquetado</h2>
        <WaveformCrop samples={samples} onUpdate={setSamples} />
        <LabelManager samples={samples} onUpdate={setSamples} />
      </section>

      {/* Tabla de muestras */}
      <section style={{ marginTop: '1rem' }}>
        <h2>Muestras</h2>
        <SampleTable samples={samples} onUpdate={setSamples} />
      </section>

      {/* 3 · Entrenamiento */}
      <section style={{ marginTop: '1rem' }}>
        <h2>3 · Entrenar modelo</h2>
        <Trainer samples={samples} onTrained={setModel} />
      </section>

      {/* 4 · Inferencia en tiempo real */}
      <section style={{ marginTop: '1rem' }}>
        <h2>4 · Interpretar</h2>
        <Listener model={model} />
      </section>
    </main>
  );
}
