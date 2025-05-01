// frontend/src/components/Trainer.tsx
import { useState } from 'react';
import * as tf from '@tensorflow/tfjs';
import { extractFeatures } from '../utils/audio';
import { Sample } from '../App';

interface Props {
  samples: Sample[];
  /** Si ya hay un modelo cargado queremos seguir entrenándolo */
  existingModel?: tf.LayersModel | null;
  onTrained: (m: tf.LayersModel) => void;
}

export default function Trainer({ samples, existingModel, onTrained }: Props) {
  const [status, setStatus] = useState('esperando…');

  async function train() {
    const labelled = samples.filter(s => s.label);
    if (labelled.length < 4) {
      setStatus('❗ Se necesitan al menos 4 muestras etiquetadas');
      return;
    }

    const labels = [...new Set(labelled.map(s => s.label))];
    if (labels.length < 2) {
      setStatus('❗ Necesitas al menos 2 etiquetas distintas');
      return;
    }

    const xs: number[][] = [];
    const ys: number[] = [];
    for (const s of labelled) {
      xs.push(await extractFeatures(s.blob));
      ys.push(labels.indexOf(s.label));
    }

    const xT = tf.tensor2d(xs);
    const yT = tf.oneHot(tf.tensor1d(ys, 'int32'), labels.length);

    const model =
      existingModel && (existingModel as any).labels
        ? existingModel
        : (() => {
            const m = tf.sequential();
            m.add(tf.layers.dense({ inputShape: [xs[0].length], units: 64, activation: 'relu' }));
            m.add(tf.layers.dense({ units: labels.length, activation: 'softmax' }));
            m.compile({ optimizer: 'adam', loss: 'categoricalCrossentropy', metrics: ['accuracy'] });
            return m;
          })();

    setStatus('⏳ Entrenando…');
    await model.fit(xT, yT, { epochs: 20 });
    (model as any).labels = labels;
    (model as any).userDefinedMetadata = { labels };   // para guardar
    setStatus('✅ Modelo listo');
    onTrained(model);
  }

  return (
    <div style={{ marginTop: 8 }}>
      <button onClick={train}>Entrenar</button>
      <span style={{ marginLeft: 8 }}>{status}</span>
    </div>
  );
}
