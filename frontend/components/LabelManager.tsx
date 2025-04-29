
import { useState } from 'react';
import { Sample } from '../App';
interface Props{ samples:Sample[]; onUpdate:(s:Sample[])=>void; }
export default function LabelManager({samples,onUpdate}:Props){
  const[label,setLabel]=useState('');
  const last=samples[samples.length-1];
  return <div style={{marginTop:4}}>
    <input placeholder='Etiqueta' value={label} onChange={e=>setLabel(e.target.value)}/>
    <button disabled={!label||!last} onClick={()=>{onUpdate(samples.map(s=>s.id===last.id?{...s,label}:s));setLabel('');}}>Asignar</button>
  </div>;
}
