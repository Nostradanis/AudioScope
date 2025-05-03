import { useState } from 'react';
import * as tf from '@tensorflow/tfjs';

import Recorder from './components/Recorder';
import Waveform from './components/Waveform';
import LabelManager from './components/LabelManager';
import SampleTable from './components/SampleTable';
import Trainer from './components/Trainer';
import Listener from './components/Listener';
import ModelIO from './components/ModelIO';

import { SparklesIcon } from '@heroicons/react/24/outline';

export interface Sample {
  id: string;
  blob: Blob;
  label: string;
}

export default function App() {
  const [samples, setSamples] = useState<Sample[]>([]);
  const [model, setModel] = useState<tf.LayersModel | null>(null);

  return (
    <div className="flex-1 flex flex-col">
      {/* Top bar */}
      <header className="h-14 flex items-center justify-between px-6 border-b border-slate-200 dark:border-slate-700">
        <h1 className="flex items-center gap-2 font-semibold text-lg">
          <SparklesIcon className="h-5 w-5 text-indigo-600" />
          SoundScope
        </h1>
      </header>

      {/* Scrollable content */}
      <main className="flex-1 overflow-y-auto">
        <section className="max-w-4xl mx-auto py-10 space-y-12">
          {/* Hero */}
          <div className="text-center space-y-3">
            <h2 className="text-3xl sm:text-4xl font-bold">Entrena tu propio detector de sonidos en 1 minuto</h2>
            <p className="text-slate-600 dark:text-slate-400">
              Graba ejemplos, etiqueta y deja que la IA reconozca ladridos, aplausos o cualquier sonido personalizado.
            </p>
          </div>

          {/* 1 */}
          <div className="glass p-6 space-y-4">
            <h3 className="text-xl font-semibold">1 · Añade audio</h3>
            <Recorder
              onRecorded={(b) =>
                setSamples((s) => [...s, { id: crypto.randomUUID(), blob: b, label: '' }])
              }
            />
          </div>

          {/* 2 */}
          <div className="glass p-6 space-y-6">
            <h3 className="text-xl font-semibold">2 · Etiqueta tus muestras</h3>
            <Waveform samples={samples} />
            <LabelManager samples={samples} onUpdate={setSamples} />
          </div>

          {/* tabla */}
          <div className="glass p-6">
            <h3 className="text-xl font-semibold mb-4">Muestras</h3>
            <SampleTable samples={samples} onUpdate={setSamples} />
          </div>

          {/* 3 */}
          <div className="glass p-6 space-y-4">
            <h3 className="text-xl font-semibold">3 · Entrena & gestiona modelo</h3>
            <Trainer samples={samples} existingModel={model} onTrained={setModel} />
            <ModelIO
              model={model}
              samples={samples}
              setSamples={setSamples}
              onLoaded={setModel}
            />
          </div>

          {/* 4 */}
          <div className="glass p-6 space-y-4">
            <h3 className="text-xl font-semibold">4 · Interpretar en tiempo real</h3>
            <Listener model={model} />
          </div>
        </section>
      </main>

      <footer className="text-center text-xs py-4 text-slate-500">
        © {new Date().getFullYear()} SoundScope • Made with ❤
      </footer>
    </div>
  );
}
