import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import './Dashboard.css'

function Dashboard() {
  const [links, setLinks] = useState([])
  const [editingId, setEditingId] = useState(null)
  const [editUrl, setEditUrl] = useState("")

  const fetchLinks = async () => {
    try {
      const res = await fetch('http://localhost:8000/api/links')
      const data = await res.json()
      setLinks(data.links || [])
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => {
    fetchLinks()
  }, [])

  const handleEdit = (link) => {
    setEditingId(link.short_id)
    setEditUrl(link.url)
  }

  const handleSave = async (short_id) => {
    try {
      await fetch(`http://localhost:8000/api/links/${short_id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: editUrl })
      })
      setEditingId(null)
      fetchLinks()
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <div className="dashboard-container">
      <h2>Dynamic Links Dashboard</h2>
      <div className="dashboard-card">
        {links.length === 0 ? (
          <p>No links created yet. Your dynamic links will appear here.</p>
        ) : (
          <div className="links-list">
            {links.map(link => (
              <div key={link.short_id} className="link-item" style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1rem', padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}>
                <div style={{ flex: 1, textAlign: 'left' }}>
                  <strong>ID:</strong> {link.short_id} <br/>
                  <a href={`http://localhost:8000/r/${link.short_id}`} target="_blank" rel="noreferrer" style={{ color: 'var(--primary)' }}>
                    http://localhost:8000/r/{link.short_id}
                  </a>
                </div>
                
                {editingId === link.short_id ? (
                  <div style={{ flex: 2, display: 'flex', gap: '0.5rem' }}>
                    <input 
                      type="text" 
                      value={editUrl} 
                      onChange={(e) => setEditUrl(e.target.value)} 
                      style={{ flex: 1, padding: '0.5rem', borderRadius: '4px', border: 'none' }}
                    />
                    <button onClick={() => handleSave(link.short_id)} style={{ padding: '0.5rem 1rem' }}>Save</button>
                    <button onClick={() => setEditingId(null)} style={{ padding: '0.5rem 1rem', background: '#555' }}>Cancel</button>
                  </div>
                ) : (
                  <div style={{ flex: 2, textAlign: 'left', wordBreak: 'break-all' }}>
                    <strong>Dest:</strong> {link.url}
                  </div>
                )}
                
                <div style={{ flex: 1, textAlign: 'center', background: 'rgba(255,255,255,0.1)', padding: '0.5rem', borderRadius: '4px' }}>
                  <strong>Scans:</strong><br/>
                  <span style={{ fontSize: '1.2rem', color: 'var(--primary)' }}>{link.scans || 0}</span>
                </div>

                {editingId !== link.short_id && (
                  <button onClick={() => handleEdit(link)} style={{ padding: '0.5rem 1rem' }}>Edit</button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      <Link to="/" style={{ color: 'var(--primary)', marginTop: '2rem', display: 'inline-block' }}>
        &larr; Back to Generator
      </Link>
    </div>
  )
}

export default Dashboard
