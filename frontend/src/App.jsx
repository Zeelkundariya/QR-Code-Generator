import { useState } from 'react'
import './App.css'

const COLOR_PAIRS = {
  "Black on White": { fill: "#000000", bg: "#FFFFFF" },
  "Purple on Gold": { fill: "#800080", bg: "#FFD700" },
  "Teal on Coral": { fill: "#008080", bg: "#FF6B6B" },
  "Orange on Navy": { fill: "#FFA500", bg: "#000080" },
  "Magenta on Lime": { fill: "#FF00FF", bg: "#00FF00" }
}

function App() {
  const [url, setUrl] = useState('')
  const [color, setColor] = useState("Black on White")

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
          <select 
            value={color} 
            onChange={(e) => setColor(e.target.value)}
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
          >
            {Object.keys(COLOR_PAIRS).map(name => (
              <option key={name} value={name}>{name}</option>
            ))}
          </select>
          <button>Generate QR Code</button>
        </div>
      </div>
    </div>
  )
}

export default App
