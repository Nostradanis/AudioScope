
import { useState,useRef,useEffect } from 'react';
import * as tf from '@tensorflow/tfjs';
import { extractFeatures } from '../utils/audio';
interface Props{ model:any; }
export default function Listener({model}:Props){
  const[msg,setMsg]=useState('modelo no cargado');
  const[listen,setListen]=useState(false);
  const ctx=useRef<AudioContext|null>(null);
  const proc=useRef<ScriptProcessorNode|null>(null);
  useEffect(()=>()=>{proc.current?.disconnect();ctx.current?.close();},[]);
  async function start(){
    if(!model)return;
    ctx.current=new AudioContext();
    const stream=await navigator.mediaDevices.getUserMedia({audio:true});
    const src=ctx.current.createMediaStreamSource(stream);
    proc.current=ctx.current.createScriptProcessor(4096,1,1);
    proc.current.onaudioprocess=async e=>{
      const data=e.inputBuffer.getChannelData(0);
      const feats=await extractFeatures(new Blob([data.buffer]));
      const pred=model.predict(tf.tensor2d([feats])) as tf.Tensor;
      const idx=(await pred.argMax(1).data())[0]; const prob=(await pred.max().data())[0];
      setMsg(prob>0.8?model.labels[idx]:'no identificado');
    };
    src.connect(proc.current); proc.current.connect(ctx.current.destination); setListen(true);
  }
  const stop=()=>{proc.current?.disconnect();ctx.current?.close();setListen(false);setMsg('detenido');};
  return <div><button onClick={listen?stop:start} disabled={!model}>{listen?'Detener':'Escuchar'}</button> <span>{msg}</span></div>;
}
