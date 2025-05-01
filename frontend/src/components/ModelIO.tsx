// frontend/src/components/ModelIO.tsx
import { useRef } from 'react';
import * as tf from '@tensorflow/tfjs';

interface Props {
  model: tf.LayersModel | null;
  onLoaded: (m: tf.LayersModel) => void;
}

export default function ModelIO({ model, onLoaded }: Props) {
  const fileInput = useRef<HTMLInputElement>(null);

  /* ---------- GUARDAR ---------- */
  async function save() {
    if (!model) return;
    await model.save('downloads://soundscope-model');
  }

  /* ---------- ABRIR DIALOGO ---------- */
  function openPicker() {
    fileInput.current?.click();
  }

  /* ---------- CARGAR ---------- */
  async function load(ev: React.ChangeEvent<HTMLInputElement>) {
    const jsonFile = ev.target.files?.[0];
    if (!jsonFile) return;

    const base = jsonFile.name.replace('.json', '');
    const binFile = Array.from(ev.target.files!).find(
      f => f.name.startsWith(base) && f.name.endsWith('.bin')
    );

    if (!binFile) {
      alert('Selecciona también el archivo .bin de pesos');
      return;
    }

    const loaded = await tf.loadLayersModel(tf.io.browserFiles([jsonFile, binFile]));

    // restaurar etiquetas guardadas en metadata
    const meta = (loaded as any).userDefinedMetadata;
    if (meta?.labels) (loaded as any).labels = meta.labels;

    onLoaded(loaded);
    ev.target.value = '';
  }

  return (
    <div style={{ marginTop: 8 }}>
      <button onClick={save} disabled={!model}>💾 Guardar modelo</button>{' '}
      <button onClick={openPicker}>📂 Cargar modelo</button>
      <input hidden multiple ref={fileInput} type="file" accept=".json,.bin" onChange={load} />
    </div>
  );
}
