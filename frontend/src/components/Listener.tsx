import { useState, useRef, useEffect } from 'react';
import * as tf from '@tensorflow/tfjs';
import { extractFeatures } from '../utils/audio';

/* WAV helper (mismo que en WaveformCrop) */
const encodeWav = (pcm: Float32Array, sr: number) => {
  const dv = new DataView(new ArrayBuffer(44 + pcm.length * 2));
  let o = 0;
  const w16 = (v: number) => (dv.setInt16(o, v, true), (o += 2));
  const u32 = (v: number) => (dv.setUint32(o, v, true), (o += 4));
  const str = (s: string) => [...s].forEach(ch => dv.setUint8(o++, ch.charCodeAt(0)));

  str('RIFF'); u32(36 + pcm.length * 2); str('WAVE');
  str('fmt '); u32(16); w16(1); w16(1); u32(sr); u32(sr * 2); w16(2); w16(16);
  str('data'); u32(pcm.length * 2);
  pcm.forEach(s => w16(Math.max(-32768, Math.min(32767, s * 0x7fff))));
  return dv.buffer;
};

interface Props { model: any; }

export default function Listener({ model }: Props) {
  const [msg, setMsg] = useState('modelo no cargado');
  const [listen, setListen] = useState(false);
  const ctxRef  = useRef<AudioContext | null>(null);
  const procRef = useRef<ScriptProcessorNode | null>(null);

  useEffect(() => () => stop(), []);

  async function start() {
    if (!model) return;
    const ctx = new AudioContext();
    ctxRef.current = ctx;

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const src = ctx.createMediaStreamSource(stream);
    const proc = ctx.createScriptProcessor(4096, 1, 1);
    procRef.current = proc;

    proc.onaudioprocess = async e => {
      const frame = e.inputBuffer.getChannelData(0).slice(); // Float32Array
      const wav   = encodeWav(frame, ctx.sampleRate);
      const blob  = new Blob([wav], { type: 'audio/wav' });

      const feats = await extractFeatures(blob);
      const pred  = model.predict(tf.tensor2d([feats])) as tf.Tensor;
      const idx   = (await pred.argMax(1).data())[0];
      const prob  = (await pred.max().data())[0];
      setMsg(prob > 0.8 ? model.labels[idx] : 'no identificado');
    };

    src.connect(proc);
    proc.connect(ctx.destination);
    setListen(true);
  }

  function stop() {
    procRef.current?.disconnect();
    ctxRef.current?.close();
    setListen(false);
    setMsg('detenido');
  }

  return (
    <div>
      <button onClick={listen ? stop : start} disabled={!model}>
        {listen ? 'Detener' : 'Escuchar'}
      </button>{' '}
      <span>{msg}</span>
    </div>
  );
}
