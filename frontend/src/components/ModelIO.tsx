// frontend/src/components/ModelIO.tsx
import { useRef } from 'react';
import * as tf    from '@tensorflow/tfjs';
import JSZip      from 'jszip';
import { saveAs } from 'file-saver';

import { Sample } from '../App';

interface Props {
  model:   tf.LayersModel | null;
  samples: Sample[];
  setSamples: (s: Sample[]) => void;
  onLoaded: (m: tf.LayersModel) => void;
}

export default function ModelIO({ model, samples, setSamples, onLoaded }: Props) {
  const fileInput = useRef<HTMLInputElement>(null);

  /* ---------- GUARDAR TODO EN ZIP ---------- */
  async function saveAll() {
    if (!model) return;

    const name = prompt('Nombre del fichero:', 'soundscope-project');
    if (!name) return;

    // 1.  exportar modelo a buffers
    const saveRes = await model.save(tf.io.withSaveHandler(async files => files));
    const zip = new JSZip();

    zip.file('model.json', saveRes.modelArtifactsInfo.modelTopology as string);
    zip.file('model.weights.bin', saveRes.weightData as ArrayBuffer);

    // 2.  añadir blobs de muestras
    const meta = samples.map(s => ({ id: s.id, label: s.label, type: s.blob.type }));
    await Promise.all(
      samples.map(async s => {
        const buf = await s.blob.arrayBuffer();
        zip.file(`samples/${s.id}`, buf);
      })
    );
    zip.file('meta.json', JSON.stringify(meta));

    // 3. generar ZIP
    const content = await zip.generateAsync({ type: 'blob' });
    saveAs(content, `${name}.zip`);
  }

  /* ---------- ABRIR SELECCIONADOR ---------- */
  const openPicker = () => fileInput.current?.click();

  /* ---------- CARGAR ZIP ---------- */
  async function loadAll(e: React.ChangeEvent<HTMLInputElement>) {
    const zipFile = e.target.files?.[0];
    if (!zipFile) return;

    const zip = await JSZip.loadAsync(zipFile);

    // 1. modelo
    const modelJson   = await zip.file('model.json')!.async('string');
    const weightArray = await zip.file('model.weights.bin')!.async('arraybuffer');
    const model = await tf.loadLayersModel(
      tf.io.browserFiles([
        new File([modelJson], 'model.json', { type: 'application/json' }),
        new File([weightArray], 'model.weights.bin'),
      ])
    );

    // 2. muestras
    const meta: { id: string; label: string; type: string }[] = JSON.parse(
      await zip.file('meta.json')!.async('string')
    );
    const newSamples: Sample[] = await Promise.all(
      meta.map(async m => {
        const buf  = await zip.file(`samples/${m.id}`)!.async('arraybuffer');
        return { id: m.id, label: m.label, blob: new Blob([buf], { type: m.type }) };
      })
    );

    // 3. actualizar estado global
    setSamples(newSamples);
    onLoaded(model);
    e.target.value = '';
  }

  return (
    <div style={{ marginTop: 8 }}>
      <button onClick={saveAll} disabled={!model}>
        💾 Guardar ZIP
      </button>{' '}
      <button onClick={openPicker}>📂 Cargar ZIP</button>
      <input hidden ref={fileInput} type="file" accept=".zip" onChange={loadAll} />
    </div>
  );
}
