import { Sample } from '../App';

interface Props {
  samples: Sample[];
  onUpdate: (s: Sample[]) => void;
}

export default function SampleTable({ samples, onUpdate }: Props) {
  const play = (b: Blob) => new Audio(URL.createObjectURL(b)).play();
  const save = (s: Sample) => {
    const url = URL.createObjectURL(s.blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${s.label || 'muestra'}-${s.id.slice(0, 6)}.wav`;
    a.click();
  };
  const remove = (id: string) => onUpdate(samples.filter((s) => s.id !== id));

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead className="bg-slate-100 dark:bg-slate-700/50">
          <tr>
            <th className="px-3 py-2 text-left font-medium">Etiqueta</th>
            <th className="px-3 py-2 text-left font-medium">KB</th>
            <th className="px-3 py-2"></th>
            <th className="px-3 py-2"></th>
            <th className="px-3 py-2"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
          {samples.map((s) => (
            <tr key={s.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
              <td className="px-3 py-2">{s.label || '—'}</td>
              <td className="px-3 py-2">{(s.blob.size / 1024).toFixed(1)}</td>
              <td className="px-3 py-2">
                <button onClick={() => play(s.blob)}>▶︎</button>
              </td>
              <td className="px-3 py-2">
                <button onClick={() => save(s)}>⬇︎</button>
              </td>
              <td className="px-3 py-2">
                <button onClick={() => remove(s.id)}>🗑️</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
