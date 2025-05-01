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

    /* preguntar al usuario */
    const name = prompt('Nombre para el modelo:', 'soundscope');
    if (!name) return;                         // cancelar → no descarga

    // quitar espacios y caracteres raros
    const safe = name.trim().replace(/[^a-z0-9_\-]/gi, '_');

    await model.save(`downloads://${safe}`);
  }

  /* ---------- CARGAR ---------- */
  function openPicker() {
    fileInput.current?.click();
  }

  async function load(e: React.ChangeEvent<HTMLInputElement>) {
    const json = e.target.files?.[0];
    if (!json) return;

    const base = json.name.replace('.json', '');
    const bin  = Array.from(e.target.files!).find(
      f => f.name.startsWith(base) && f.name.endsWith('.bin')
    );
    if (!bin) { alert('Selecciona también el archivo .bin'); return; }

    const loaded = await tf.loadLayersModel(tf.io.browserFiles([json, bin]));

    // restaurar etiquetas si existen en metadata
    const meta = (loaded as any).userDefinedMetadata;
    if (meta?.labels) (loaded as any).labels = meta.labels;

    onLoaded(loaded);
    e.target.value = '';
  }

  return (
    <div style={{ marginTop: 8 }}>
      <button onClick={save}   disabled={!model}>💾 Guardar modelo</button>{' '}
      <button onClick={openPicker}>📂 Cargar modelo</button>
      <input
        hidden
        multiple
        ref={fileInput}
        type="file"
        accept=".json,.bin"
        onChange={load}
      />
    </div>
  );
}
