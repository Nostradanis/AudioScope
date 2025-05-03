import { useState } from 'react';
import * as tf from '@tensorflow/tfjs';

import Recorder     from './components/Recorder';
import WaveformCrop from './components/WaveformCrop';
import LabelManager from './components/LabelManager';
import SampleTable  from './components/SampleTable';
import Trainer      from './components/Trainer';
import Listener     from './components/Listener';
import ModelIO      from './components/ModelIO';

export interface Sample {
  id: string;
  blob: Blob;
  label: string;
}

export default function App() {
  const [samples, setSamples] = useState<Sample[]>([]);
  const [model,   setModel]   = useState<tf.LayersModel | null>(null);

  return (
    <main style={{ fontFamily: 'sans-serif', padding: '1rem', maxWidth: 960, margin: '0 auto' }}>
      <h1>SoundScope PWA</h1>

      {/* 1 · Grabar o subir audio */}
      <section>
        <h2>1 · Grabación / subida</h2>
        <Recorder onRecorded={b => setSamples(s => [...s, { id: crypto.randomUUID(), blob: b, label: '' }])} />
      </section>

      {/* 2 · Visualización y etiquetado */}
      <section style={{ marginTop: '1rem' }}>
        <h2>2 · Forma de onda y etiquetado</h2>
        <WaveformCrop samples={samples} onUpdate={setSamples} />
        <LabelManager samples={samples} onUpdate={setSamples} />
      </section>

      {/* Tabla de muestras */}
      <section style={{ marginTop: '1rem' }}>
        <h2>Muestras</h2>
        <SampleTable samples={samples} onUpdate={setSamples} />
      </section>

      {/* 3 · Entrenamiento y gestión de modelo */}
      <section style={{ marginTop: '1rem' }}>
        <h2>3 · Entrenar modelo</h2>
        <Trainer samples={samples} existingModel={model} onTrained={setModel} />
        <ModelIO model={model} samples={samples} setSamples={setSamples} onLoaded={setModel} />
      </section>

      {/* 4 · Inferencia */}
      <section style={{ marginTop: '1rem' }}>
        <h2>4 · Interpretar en tiempo real</h2>
        <Listener model={model} />
      </section>
    </main>
  );
}
