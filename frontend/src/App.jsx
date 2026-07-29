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
  const [mode, setMode] = useState("single")
  const [url, setUrl] = useState('')
  const [color, setColor] = useState("Black on White")
  const [useGradient, setUseGradient] = useState(false)
  
  const [logoBase64, setLogoBase64] = useState('')
  const [qrImage, setQrImage] = useState(null)
  const [loading, setLoading] = useState(false)
  const [qrType, setQrType] = useState("static")
  const [password, setPassword] = useState("")
  const [exportFormat, setExportFormat] = useState("png")
  
  const [csvFile, setCsvFile] = useState(null)
  const [bulkLoading, setBulkLoading] = useState(false)

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoBase64(reader.result);
      };
      reader.readAsDataURL(file);
    }
  }

  const handleGenerate = async () => {
    if (!url) return;
    setLoading(true);
    try {
      const selectedColor = COLOR_PAIRS[color];
      const response = await fetch('http://localhost:8000/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          url,
          fill_color: selectedColor.fill,
          bg_color: selectedColor.bg,
          use_gradient: useGradient,
          logo_base64: logoBase64 || null,
          is_dynamic: qrType === "dynamic",
          password: qrType === "dynamic" && password ? password : null,
          format: exportFormat
        })
      });
      const data = await response.json();
      if (data.image) setQrImage(data.image);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const handleBulkGenerate = async () => {
    if (!csvFile) return;
    setBulkLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', csvFile);
      const res = await fetch('http://localhost:8000/api/bulk-generate', {
        method: 'POST',
        body: formData
      });
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'bulk_qr_codes.zip';
        document.body.appendChild(a);
        a.click();
        a.remove();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setBulkLoading(false);
    }
  }

  return (
    <div className="App">
      <h1>QR Code Generator</h1>
      
      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginBottom: '2rem' }}>
        <button onClick={() => setMode("single")} style={{ background: mode === "single" ? 'var(--primary)' : 'rgba(255,255,255,0.1)', border: 'none', padding: '0.8rem 1.5rem', borderRadius: '8px', cursor: 'pointer', color: 'white' }}>Single QR</button>
        <button onClick={() => setMode("bulk")} style={{ background: mode === "bulk" ? 'var(--primary)' : 'rgba(255,255,255,0.1)', border: 'none', padding: '0.8rem 1.5rem', borderRadius: '8px', cursor: 'pointer', color: 'white' }}>Bulk Generate (CSV)</button>
      </div>

      <div className="card">
        {mode === "single" ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center' }}>
          
          <div style={{ display: 'flex', gap: '1rem', width: '100%', maxWidth: '400px' }}>
            <button 
              onClick={() => setQrType("static")} 
              style={{ flex: 1, backgroundColor: qrType === "static" ? 'var(--primary)' : 'rgba(255,255,255,0.1)' }}
            >Static QR</button>
            <button 
              onClick={() => setQrType("dynamic")}
              style={{ flex: 1, backgroundColor: qrType === "dynamic" ? 'var(--primary)' : 'rgba(255,255,255,0.1)' }}
            >Dynamic QR</button>
          </div>

          <input 
            type="text" 
            placeholder="Enter URL here..." 
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            style={{ padding: '0.8rem', width: '100%', maxWidth: '400px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.2)', color: 'white' }}
          />
          <div style={{ display: 'flex', gap: '1rem', width: '100%', maxWidth: '400px' }}>
            <select 
              value={color} 
              onChange={(e) => setColor(e.target.value)}
              style={{ padding: '0.8rem', flex: 2, borderRadius: '8px', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.2)', color: 'white' }}
            >
              {Object.keys(COLOR_PAIRS).map(name => (
                <option key={name} value={name}>{name}</option>
              ))}
            </select>
            <select 
              value={exportFormat} 
              onChange={(e) => setExportFormat(e.target.value)}
              style={{ padding: '0.8rem', flex: 1, borderRadius: '8px', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.2)', color: 'white' }}
            >
              <option value="png">PNG</option>
              <option value="svg">SVG</option>
            </select>
          </div>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
            <input type="checkbox" checked={useGradient} onChange={(e) => setUseGradient(e.target.checked)} />
            Use Radial Gradient
          </label>
          <div style={{ width: '100%', maxWidth: '400px', textAlign: 'left' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Center Logo (Optional):</label>
            <input type="file" accept="image/*" onChange={handleLogoUpload} style={{ color: 'white' }} />
            {logoBase64 && <div style={{marginTop: '0.5rem'}}><img src={logoBase64} alt="Logo preview" style={{maxHeight: '40px', borderRadius: '4px'}}/></div>}
          </div>

          {qrType === "dynamic" && (
            <div style={{ width: '100%', maxWidth: '400px', textAlign: 'left' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Password Protect Link (Optional):</label>
              <input 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                placeholder="Leave empty for public link"
                style={{ padding: '0.8rem', width: '100%', boxSizing: 'border-box', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.2)', color: 'white' }}
              />
            </div>
          )}

          <button onClick={handleGenerate} disabled={loading} style={{marginTop: '1rem', width: '100%', maxWidth: '400px'}}>
            {loading ? 'Generating...' : 'Generate QR Code'}
          </button>
          
          {qrImage && (
            <div style={{ marginTop: '2rem' }}>
              <img src={qrImage} alt="QR Code" style={{ borderRadius: '8px', boxShadow: '0 4px 15px rgba(0,0,0,0.3)' }} />
            </div>
          )}
        </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center' }}>
            <h3 style={{ color: 'white' }}>Bulk Generate from CSV</h3>
            <p style={{ color: 'var(--text-muted)' }}>Upload a CSV file containing a list of URLs (one URL per row in the first column) to generate hundreds of QR codes at once!</p>
            <input 
              type="file" 
              accept=".csv" 
              onChange={(e) => setCsvFile(e.target.files[0])} 
              style={{ color: 'white', marginTop: '1rem' }} 
            />
            <button onClick={handleBulkGenerate} disabled={bulkLoading || !csvFile} style={{marginTop: '1rem', width: '100%', maxWidth: '400px'}}>
              {bulkLoading ? 'Generating ZIP...' : 'Download ZIP Archive'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default App
