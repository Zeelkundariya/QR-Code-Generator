import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import './Dashboard.css'

function Dashboard() {
  const [links, setLinks] = useState([])
  const [editingId, setEditingId] = useState(null)
  const [editUrl, setEditUrl] = useState("")
  const [feedback, setFeedback] = useState("")

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
      const res = await fetch(`http://localhost:8000/api/links/${short_id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: editUrl })
      })
      if (!res.ok) {
        const errorData = await res.json()
        showFeedback(`Error: ${errorData.detail || 'Invalid URL'}`)
        return
      }
      setEditingId(null)
      fetchLinks()
      showFeedback("Link updated successfully!")
    } catch (e) {
      console.error(e)
    }
  }

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
    showFeedback("Link copied to clipboard!")
  }

  const showFeedback = (msg) => {
    setFeedback(msg)
    setTimeout(() => setFeedback(""), 3000)
  }

  return (
    <div className="dashboard-container">
      <h1>Dashboard</h1>
      <p className="subtitle">Manage your dynamic links and track performance.</p>

      {feedback && (
        <div style={{ background: 'var(--primary)', color: 'white', padding: '0.8rem', borderRadius: '8px', marginBottom: '1rem', transition: 'all 0.3s' }}>
          {feedback}
        </div>
      )}

      <div className="dashboard-card">
        {links.length === 0 ? (
          <p style={{ color: 'var(--text-muted)' }}>No links created yet. Your dynamic links will appear here.</p>
        ) : (
          <div className="links-list">
            {links.map(link => (
              <div key={link.short_id} className="link-item">
                <div className="link-info">
                  <a href={`http://localhost:8000/r/${link.short_id}`} target="_blank" rel="noreferrer" className="short-url">
                    http://localhost:8000/r/{link.short_id} 
                    <span onClick={(e) => { e.preventDefault(); copyToClipboard(`http://localhost:8000/r/${link.short_id}`); }} style={{ cursor: 'pointer', fontSize: '1rem' }} title="Copy Link">📋</span>
                  </a>
                  
                  {editingId === link.short_id ? (
                    <div className="edit-mode" style={{ marginTop: '1rem' }}>
                      <input 
                        type="text" 
                        value={editUrl} 
                        onChange={(e) => setEditUrl(e.target.value)} 
                        className="edit-input"
                      />
                      <button className="action-btn primary" onClick={() => handleSave(link.short_id)}>Save</button>
                      <button className="action-btn" onClick={() => setEditingId(null)}>Cancel</button>
                    </div>
                  ) : (
                    <div className="dest-url">
                      <strong>Destination:</strong> {link.url}
                      <div style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                        {link.scan_limit && <span style={{ marginRight: '1rem' }}>🔒 Max Scans: {link.scan_limit}</span>}
                        {link.expires_at && <span>⏳ Expires: {new Date(link.expires_at).toLocaleString()}</span>}
                      </div>
                    </div>
                  )}
                </div>
                
                <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
                  <div className="scan-stats">
                    <span className="count">{link.scans || 0}</span>
                    <span className="label">Scans</span>
                  </div>
                  
                  {(link.device_stats || link.country_stats) && (
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '0.3rem', minWidth: '150px' }}>
                      <div>
                        <strong>Devices: </strong>
                        {Object.entries(link.device_stats || {}).map(([dev, count]) => (
                          <span key={dev} style={{ marginRight: '0.5rem' }}>{dev === 'Mobile' ? '📱' : '💻'} {count}</span>
                        ))}
                      </div>
                      <div>
                        <strong>Top Regions: </strong>
                        {Object.entries(link.country_stats || {}).slice(0,2).map(([country, count]) => (
                          <span key={country} style={{ marginRight: '0.5rem' }}>🌍 {country} ({count})</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {editingId !== link.short_id && (
                    <button className="action-btn" onClick={() => handleEdit(link)}>Edit</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <Link to="/" style={{ color: 'var(--text-muted)', marginTop: '2rem', display: 'inline-block', textDecoration: 'none' }}>
        &larr; Back to Generator
      </Link>
    </div>
  )
}

export default Dashboard
