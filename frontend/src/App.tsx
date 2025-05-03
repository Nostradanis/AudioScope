// frontend/src/App.tsx
import { useState } from 'react';
import * as tf from '@tensorflow/tfjs';

import Recorder from './components/Recorder';
import Waveform from './components/Waveform';          // sin tijeras
import LabelManager from './components/LabelManager';
import SampleTable from './components/SampleTable';
import Trainer from './components/Trainer';
import Listener from './components/Listener';
import ModelIO from './components/ModelIO';

export interface Sample {
  id: string;
  blob: Blob;
  label: string;
}

export default function App() {
  const [samples, setSamples] = useState<Sample[]>([]);
  const [model, setModel] = useState<tf.LayersModel | null>(null);

  return (
    <main className="w-full max-w-3xl mx-auto space-y-10 pb-8">
      <h1 className="text-3xl font-bold text-center mt-6">SoundScope</h1>

      {/* 1 */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">1 · Grabar o subir audio</h2>
        <Recorder
          onRecorded={(b) =>
            setSamples((s) => [...s, { id: crypto.randomUUID(), blob: b, label: '' }])
          }
        />
      </section>

      {/* 2 */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">2 · Etiquetar</h2>
        <Waveform samples={samples} />
        <LabelManager samples={samples} onUpdate={setSamples} />
      </section>

      {/* tabla */}
      <SampleTable samples={samples} onUpdate={setSamples} />

      {/* 3 */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">3 · Entrenar modelo</h2>
        <Trainer samples={samples} existingModel={model} onTrained={setModel} />
        <ModelIO model={model} samples={samples} setSamples={setSamples} onLoaded={setModel} />
      </section>

      {/* 4 */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">4 · Interpretar</h2>
        <Listener model={model} />
      </section>
    </main>
  );
}
