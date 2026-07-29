import React from 'react'
import { Link } from 'react-router-dom'
import './Dashboard.css'

function Dashboard() {
  return (
    <div className="dashboard-container">
      <h2>Dynamic Links Dashboard</h2>
      <div className="dashboard-card">
        <p>No links created yet. Your dynamic links will appear here.</p>
      </div>
      <Link to="/" style={{ color: 'var(--primary)', marginTop: '2rem', display: 'inline-block' }}>
        &larr; Back to Generator
      </Link>
    </div>
  )
}

export default Dashboard
