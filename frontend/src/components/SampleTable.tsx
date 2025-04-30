import { Sample } from '../App';

interface Props { samples: Sample[]; onUpdate: (s: Sample[]) => void; }

export default function SampleTable({ samples, onUpdate }: Props) {
  const remove = (id: string) => onUpdate(samples.filter(s => s.id !== id));
  const play   = (b: Blob)    => new Audio(URL.createObjectURL(b)).play();
  const save   = (s: Sample)  => {
    const url = URL.createObjectURL(s.blob);
    const a   = document.createElement('a');
    a.href = url;
    a.download = `${s.label || 'muestra'}-${s.id.slice(0, 6)}.wav`;
    a.click();
  };

  return (
    <table>
      <thead>
        <tr><th>Etiqueta</th><th>KB</th><th></th><th></th><th></th></tr>
      </thead>
      <tbody>
        {samples.map(s => (
          <tr key={s.id}>
            <td>{s.label || '—'}</td>
            <td>{(s.blob.size / 1024).toFixed(1)}</td>
            <td><button onClick={() => play(s.blob)}>▶︎</button></td>
            <td><button onClick={() => save(s)}>⬇︎</button></td>
            <td><button onClick={() => remove(s.id)}>🗑️</button></td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
