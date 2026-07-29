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
                    </div>
                  )}
                </div>
                
                <div className="scan-stats">
                  <span className="count">{link.scans || 0}</span>
                  <span className="label">Scans</span>
                </div>

                {editingId !== link.short_id && (
                  <button className="action-btn" onClick={() => handleEdit(link)}>Edit</button>
                )}
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
