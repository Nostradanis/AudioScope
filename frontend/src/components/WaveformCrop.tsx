
import { useEffect, useRef } from 'react';
import WaveSurfer from 'wavesurfer.js';
import { Sample } from '../App';
interface Props{ samples:Sample[]; onUpdate:(s:Sample[])=>void; }
export default function WaveformCrop({samples}:Props){
  const container=useRef<HTMLDivElement>(null);
  const ws=useRef<WaveSurfer|null>(null);
  useEffect(()=>{
    if(!samples.length)return;
    const last=samples[samples.length-1];
    last.blob.arrayBuffer().then(b=>{
      ws.current?.destroy();
      ws.current=WaveSurfer.create({container:container.current!,height:80,waveColor:'#60a5fa',progressColor:'#1d4ed8'});
      ws.current.loadBlob(new Blob([b]));
    });
  },[samples]);
  return <div ref={container}></div>;
}
