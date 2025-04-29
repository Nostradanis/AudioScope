
import { useRef, useState } from 'react';
interface Props{ onRecorded:(b:Blob)=>void; }
export default function Recorder({onRecorded}:Props){
  const ref=useRef<MediaRecorder|null>(null);
  const[rec,setRec]=useState(false);
  async function start(){
    const stream=await navigator.mediaDevices.getUserMedia({audio:true});
    const mr=new MediaRecorder(stream); ref.current=mr;
    const chunks:BlobPart[]=[];
    mr.ondataavailable=e=>chunks.push(e.data);
    mr.onstop=()=>onRecorded(new Blob(chunks,{type:'audio/webm'}));
    mr.start(); setRec(true);
  }
  const stop=()=>{ ref.current?.stop(); setRec(false); };
  return <button onClick={rec?stop:start}>{rec?'Detener':'Grabar'}</button>;
}
