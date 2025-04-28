import { useState } from 'react';

export default function App() {
  const [msg] = useState('Ready to recognise sounds!');
  return (
    <main style={{fontFamily:'sans-serif',padding:'2rem'}}>
      <h1>SoundScope PWA</h1>
      <p>{msg}</p>
    </main>
  );
}