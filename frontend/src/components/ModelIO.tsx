import { useRef } from 'react';
import * as tf from '@tensorflow/tfjs';

interface Props {
  /** modelo ya entrenado (o null) */
  model: tf.LayersModel | null;
  /** callback para devolver el modelo cargado */
  onLoaded: (m: tf.LayersModel) => void;
}

export default function ModelIO({ model, onLoaded }: Props) {
  const fileInput = useRef<HTMLInputElement>(null);

  /* ---------- GUARDAR ---------- */
  async function save() {
    if (!model) return;
    await model.save('downloads://soundscope-model');
  }

  /* ---------- CARGAR ---------- */
  function triggerOpen() {
    fileInput.current?.click();
  }

  async function load(e: React.ChangeEvent<HTMLInputElement>) {
    const jsonFile = e.target.files?.[0];
    if (!jsonFile) return;

    // buscar el .bin con mismo prefijo
    const base = jsonFile.name.replace('.json', '');
    const binFile = Array.from(e.target.files!).find(f => f.name.startsWith(base) && f.name.endsWith('.bin'));

    if (!binFile) {
      alert('Selecciona también el archivo .bin de pesos');
      return;
    }

    const loaded = await tf.loadLayersModel(tf.io.browserFiles([jsonFile, binFile]));
    onLoaded(loaded);
    e.target.value = ''; // reset
  }

  return (
    <div style={{ marginTop: 8 }}>
      <button onClick={save} disabled={!model}>💾 Guardar modelo</button>{' '}
      <button onClick={triggerOpen}>📂 Cargar modelo</button>
      <input
        type="file"
        accept=".json,.bin"
        multiple
        hidden
        ref={fileInput}
        onChange={load}
      />
    </div>
  );
}
