import { useState, useMemo } from 'react';
import { Sample } from '../App';

interface Props {
  samples: Sample[];
  onUpdate: (s: Sample[]) => void;
}

export default function LabelManager({ samples, onUpdate }: Props) {
  const [label, setLabel] = useState('');
  const last = samples[samples.length - 1];
  const known = useMemo(
    () =>
      Array.from(
        new Set(
          samples
            .map((s) => s.label.trim())
            .filter((l) => l.length > 0)
        )
      ),
    [samples]
  );

  const assign = (lab: string) => {
    if (!last) return;
    onUpdate(samples.map((s) => (s.id === last.id ? { ...s, label: lab } : s)));
    setLabel('');
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-3">
        <input
          className="flex-1 px-3 py-2 rounded border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="Etiqueta"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && label && assign(label)}
        />
        <button
          className="px-4 py-2 rounded-md bg-indigo-600 hover:bg-indigo-700 text-white shadow disabled:opacity-50"
          disabled={!label || !last}
          onClick={() => assign(label)}
        >
          Asignar
        </button>
      </div>

      {known.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {known.map((l) => (
            <span
              key={l}
              className="px-3 py-1 rounded-full bg-slate-200 dark:bg-slate-700 cursor-pointer text-xs hover:bg-slate-300 dark:hover:bg-slate-600"
              onClick={() => assign(l)}
            >
              {l}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
