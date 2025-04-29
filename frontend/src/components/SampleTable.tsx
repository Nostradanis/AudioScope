
import { Sample } from '../App';
interface Props{ samples:Sample[]; onUpdate:(s:Sample[])=>void; }
export default function SampleTable({samples,onUpdate}:Props){
  const remove=id=>onUpdate(samples.filter(s=>s.id!==id));
  return <table><thead><tr><th>Etiqueta</th><th>KB</th><th></th></tr></thead>
  <tbody>{samples.map(s=><tr key={s.id}><td>{s.label||'—'}</td><td>{(s.blob.size/1024).toFixed(1)}</td>
  <td><button onClick={()=>remove(s.id)}>x</button></td></tr>)}</tbody></table>;
}
