import { useState } from 'react'
import './App.css'

function App() {
  const [url, setUrl] = useState('')

  return (
    <div className="App">
      <h1>QR Code Generator</h1>
      <div className="card">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center' }}>
          <input 
            type="text" 
            placeholder="Enter URL here..." 
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            style={{
              padding: '0.8rem',
              width: '100%',
              maxWidth: '400px',
              borderRadius: '8px',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              background: 'rgba(0,0,0,0.2)',
              color: 'white',
              fontSize: '1rem'
            }}
          />
          <button>Generate QR Code</button>
        </div>
      </div>
    </div>
  )
}

export default App
