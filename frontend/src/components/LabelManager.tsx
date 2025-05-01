import { useState, useMemo } from 'react';
import { Sample } from '../App';

interface Props {
  samples: Sample[];
  onUpdate: (s: Sample[]) => void;
}

export default function LabelManager({ samples, onUpdate }: Props) {
  const [label, setLabel] = useState('');

  /** último sample (el seleccionado implícitamente) */
  const last = samples[samples.length - 1];

  /** etiquetas únicas ya empleadas */
  const known = useMemo(
    () =>
      Array.from(
        new Set(
          samples
            .map(s => s.label.trim())
            .filter(l => l.length > 0)
        )
      ),
    [samples]
  );

  /** asignar etiqueta al último sample */
  function assign(lab: string) {
    if (!last) return;
    onUpdate(samples.map(s => (s.id === last.id ? { ...s, label: lab } : s)));
    setLabel('');
  }

  return (
    <div style={{ marginTop: '.5rem' }}>
      {/* input + botón */}
      <input
        placeholder="Etiqueta"
        value={label}
        onChange={e => setLabel(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && label && assign(label)}
        style={{ marginRight: 8 }}
      />
      <button disabled={!label || !last} onClick={() => assign(label)}>
        Asignar
      </button>

      {/* lista de etiquetas conocidas */}
      {known.length > 0 && (
        <div style={{ marginTop: 8, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {known.map(l => (
            <span
              key={l}
              style={{
                padding: '2px 6px',
                background: '#e2e8f0',
                borderRadius: 4,
                cursor: 'pointer',
              }}
              title="Click para usar esta etiqueta"
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
