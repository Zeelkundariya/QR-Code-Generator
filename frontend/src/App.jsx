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
      <p className="subtitle">The only QR tool you'll ever need. Fast, customizable, and reliable.</p>
      
      <div className="tab-container">
        <button 
          className={`tab-btn ${mode === "single" ? "active" : ""}`} 
          onClick={() => setMode("single")}
        >Single QR</button>
        <button 
          className={`tab-btn ${mode === "bulk" ? "active" : ""}`} 
          onClick={() => setMode("bulk")}
        >Bulk Generate (CSV)</button>
      </div>

      <div className="card">
        {mode === "single" ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          
          <div className="tab-container" style={{ width: '100%', maxWidth: '500px', marginBottom: '1.5rem' }}>
            <button 
              className={`tab-btn ${qrType === "static" ? "active" : ""}`}
              style={{ flex: 1 }}
              onClick={() => setQrType("static")} 
            >Static QR</button>
            <button 
              className={`tab-btn ${qrType === "dynamic" ? "active" : ""}`}
              style={{ flex: 1 }}
              onClick={() => setQrType("dynamic")}
            >Dynamic QR</button>
          </div>

          <div className="input-group">
            <label>Destination URL</label>
            <input 
              type="text" 
              className="input-control"
              placeholder="https://example.com" 
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
          </div>
          
          <div className="input-group" style={{ display: 'flex', gap: '1rem' }}>
            <div style={{ flex: 2 }}>
              <label>Color Theme</label>
              <select 
                value={color} 
                className="input-control"
                onChange={(e) => setColor(e.target.value)}
              >
                {Object.keys(COLOR_PAIRS).map(name => (
                  <option key={name} value={name}>{name}</option>
                ))}
              </select>
            </div>
            <div style={{ flex: 1 }}>
              <label>Export Format</label>
              <select 
                value={exportFormat} 
                className="input-control"
                onChange={(e) => setExportFormat(e.target.value)}
              >
                <option value="png">PNG</option>
                <option value="svg">SVG</option>
              </select>
            </div>
          </div>
          
          <div className="input-group">
            <label className="checkbox-label">
              <input type="checkbox" checked={useGradient} onChange={(e) => setUseGradient(e.target.checked)} />
              Use Radial Gradient for modern look
            </label>
          </div>
          
          <div className="input-group">
            <label>Center Logo (Optional)</label>
            <input type="file" className="input-control" accept="image/*" onChange={handleLogoUpload} style={{ padding: '0.5rem' }} />
            {logoBase64 && <div style={{marginTop: '0.8rem', textAlign: 'center'}}><img src={logoBase64} alt="Logo preview" style={{maxHeight: '40px', borderRadius: '6px', background: 'white', padding: '4px'}}/></div>}
          </div>

          {qrType === "dynamic" && (
            <div className="input-group">
              <label>Password Protect Link (Optional)</label>
              <input 
                type="password" 
                className="input-control"
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                placeholder="Leave empty for public link"
              />
            </div>
          )}

          <button className="btn-primary" onClick={handleGenerate} disabled={loading}>
            {loading ? 'Generating...' : 'Generate QR Code'}
          </button>
          
          {qrImage && (
            <div className="qr-preview-container">
              <img src={qrImage} alt="QR Code" className="qr-image" />
            </div>
          )}
        </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <h3 style={{ color: 'white', fontSize: '1.5rem', marginBottom: '0.5rem' }}>Bulk Generate from CSV</h3>
            <p className="subtitle" style={{ maxWidth: '400px' }}>Upload a CSV file containing a list of URLs (one URL per row in the first column) to generate hundreds of QR codes at once!</p>
            
            <div className="input-group" style={{ textAlign: 'center' }}>
              <input 
                type="file" 
                className="input-control"
                accept=".csv" 
                onChange={(e) => setCsvFile(e.target.files[0])} 
                style={{ padding: '1rem', marginTop: '1rem' }} 
              />
            </div>
            
            <button className="btn-primary" onClick={handleBulkGenerate} disabled={bulkLoading || !csvFile}>
              {bulkLoading ? 'Generating ZIP Archive...' : 'Download ZIP Archive'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default App
