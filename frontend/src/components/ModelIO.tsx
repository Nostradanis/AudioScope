import { useRef } from 'react';
import * as tf from '@tensorflow/tfjs';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { Sample } from '../App';

interface Props {
  model: tf.LayersModel | null;
  samples: Sample[];
  setSamples: (s: Sample[]) => void;
  onLoaded: (m: tf.LayersModel) => void;
}

export default function ModelIO({ model, samples, setSamples, onLoaded }: Props) {
  const fileInput = useRef<HTMLInputElement>(null);

  /* ---- Guardar todo ↯ ZIP ---- */
  async function saveAll() {
    if (!model) return;
    const name = prompt('Nombre del fichero:', 'soundscope-project');
    if (!name) return;
    const safe = name.trim().replace(/[^a-z0-9_\-]/gi, '_');

    // exportar modelo
    const files = await model.save(tf.io.withSaveHandler(async (f) => f));
    const zip = new JSZip();
    zip.file('model.json', files.modelArtifactsInfo.modelTopology as string);
    zip.file('model.weights.bin', files.weightData as ArrayBuffer);

    const meta = samples.map((s) => ({ id: s.id, label: s.label, type: s.blob.type }));
    await Promise.all(
      samples.map(async (s) => zip.file(`samples/${s.id}`, await s.blob.arrayBuffer()))
    );
    zip.file('meta.json', JSON.stringify(meta));

    const blob = await zip.generateAsync({ type: 'blob' });
    saveAs(blob, `${safe}.zip`);
  }

  /* ---- Cargar ZIP ---- */
  const openPicker = () => fileInput.current?.click();
  async function loadAll(e: React.ChangeEvent<HTMLInputElement>) {
    const zipFile = e.target.files?.[0];
    if (!zipFile) return;
    const zip = await JSZip.loadAsync(zipFile);

    const modelJson = await zip.file('model.json')!.async('string');
    const weightBin = await zip.file('model.weights.bin')!.async('arraybuffer');
    const loaded = await tf.loadLayersModel(
      tf.io.browserFiles([
        new File([modelJson], 'model.json', { type: 'application/json' }),
        new File([weightBin], 'model.weights.bin'),
      ])
    );
    const meta: { id: string; label: string; type: string }[] = JSON.parse(
      await zip.file('meta.json')!.async('string')
    );
    const newSamples: Sample[] = await Promise.all(
      meta.map(async (m) => {
        const buf = await zip.file(`samples/${m.id}`)!.async('arraybuffer');
        return { id: m.id, label: m.label, blob: new Blob([buf], { type: m.type }) };
      })
    );
    setSamples(newSamples);
    onLoaded(loaded);
    e.target.value = '';
  }

  return (
    <div className="flex gap-3">
      <button
        className="px-4 py-2 rounded-md bg-slate-200 dark:bg-slate-600 hover:bg-slate-300 dark:hover:bg-slate-500"
        onClick={saveAll}
        disabled={!model}
      >
        💾 Guardar ZIP
      </button>
      <button
        className="px-4 py-2 rounded-md bg-slate-200 dark:bg-slate-600 hover:bg-slate-300 dark:hover:bg-slate-500"
        onClick={openPicker}
      >
        📂 Cargar ZIP
      </button>
      <input hidden ref={fileInput} type="file" accept=".zip" onChange={loadAll} />
    </div>
  );
}
