/* importaciones React, componentes, etc. */
import { SparklesIcon } from '@heroicons/react/24/outline';

export default function App() {
  /* state … */

  return (
    <div className="flex-1 flex flex-col">

      {/* barra superior minimal */}
      <header className="h-14 flex items-center justify-between px-6 border-b border-slate-200 dark:border-slate-700">
        <h1 className="flex items-center gap-2 font-semibold text-lg">
          <SparklesIcon className="h-5 w-5 text-indigo-600" />
          SoundScope
        </h1>
        {/* modo oscuro toggle opcional */}
      </header>

      {/* contenido desplazable */}
      <main className="flex-1 overflow-y-auto">
        <section className="max-w-4xl mx-auto py-10 space-y-12">

          {/* Hero / onboarding */}
          <div className="text-center space-y-3">
            <h2 className="text-3xl sm:text-4xl font-bold">Entrena tu propio detector de sonidos en 1 minuto</h2>
            <p className="text-slate-600 dark:text-slate-400">
              Graba ejemplos, etiqueta y deja que la IA reconozca ladridos, aplausos o cualquier sonido personalizado.
            </p>
          </div>

          {/* 1 · Grabar / Subir */}
          <div className="glass p-6 space-y-4">
            <h3 className="text-xl font-semibold">1 · Añade audio</h3>
            <Recorder onRecorded={…} />
          </div>

          {/* 2 · Forma de onda + etiqueta */}
          <div className="glass p-6 space-y-6">
            <h3 className="text-xl font-semibold">2 · Etiqueta tus muestras</h3>
            <Waveform samples={samples} />
            <LabelManager samples={samples} onUpdate={setSamples} />
          </div>

          {/* Tabla */}
          <div className="glass p-6">
            <h3 className="text-xl font-semibold mb-4">Muestras</h3>
            <SampleTable samples={samples} onUpdate={setSamples} />
          </div>

          {/* 3 · Entrenar */}
          <div className="glass p-6 space-y-4">
            <h3 className="text-xl font-semibold">3 · Entrena &amp; gestiona modelo</h3>
            <Trainer samples={samples} existingModel={model} onTrained={setModel} />
            <ModelIO model={model} samples={samples} setSamples={setSamples} onLoaded={setModel} />
          </div>

          {/* 4 · Inferir */}
          <div className="glass p-6 space-y-4">
            <h3 className="text-xl font-semibold">4 · Interpretar en tiempo real</h3>
            <Listener model={model} />
          </div>
        </section>
      </main>

      {/* footer fino */}
      <footer className="text-center text-xs py-4 text-slate-500">
        © {new Date().getFullYear()} SoundScope • Made with ❤
      </footer>
    </div>
  );
}
