// …importaciones existentes…
import ModelIO from './components/ModelIO';

export default function App() {
  const [samples, setSamples] = useState<Sample[]>([]);
  const [model,  setModel]    = useState<tf.LayersModel | null>(null);

  return (
    <main /* … */>
      {/* secciones anteriores */}

      {/* 3 · Entrenar modelo */}
      <section style={{ marginTop: '1rem' }}>
        <h2>3 · Entrenar modelo</h2>
        <Trainer samples={samples} onTrained={setModel} />
        <ModelIO model={model} onLoaded={setModel} />   {/* ⬅️ añadido */}
      </section>

      {/* 4 · Interpretar */}
      <section /* … */>
        <Listener model={model} />
      </section>
    </main>
  );
}
