
import Meyda from 'meyda';
export async function extractFeatures(blob:Blob){
  const buf=await blob.arrayBuffer();
  const ctx=new OfflineAudioContext(1,16000,16000);
  const audio=await ctx.decodeAudioData(buf);
  const data=audio.getChannelData(0);
  const slice=data.length>16000?data.slice(0,16000):data;
  const mfcc=Meyda.extract('mfcc',slice as unknown as Float32Array) as number[];
  return mfcc||Array(13).fill(0);
}
