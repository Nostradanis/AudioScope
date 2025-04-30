import { Sample } from '../App';

interface Props {
  samples: Sample[];
  onUpdate: (s: Sample[]) => void;
}

export default function SampleTable({ samples, onUpdate }: Props) {
  function remove(id: string) {
    onUpdate(samples.filter(s => s.id !== id));
  }

  function play(blob: Blob) {
    const url = URL.createObjectURL(blob);
    new Audio(url).play();
  }

  return (
    <table>
      <thead>
        <tr>
          <th>Etiqueta</th>
          <th>KB</th>
          <th></th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        {samples.map(s => (
          <tr key={s.id}>
            <td>{s.label || '—'}</td>
            <td>{(s.blob.size / 1024).toFixed(1)}</td>

            {/* ▶️ reproducir */}
            <td>
              <button onClick={() => play(s.blob)}>▶︎</button>
            </td>

            {/* 🗑️ eliminar */}
            <td>
              <button onClick={() => remove(s.id)}>🗑️</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
