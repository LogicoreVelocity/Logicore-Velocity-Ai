import React, { useMemo, useState } from 'react'
import TransactionForm from './TransactionForm'
import TransactionList from './TransactionList'
import ExcelManager from './ExcelManager'
import '../styles/Dashboard.css'

export default function Dashboard({
  user,
  records,
  auditLogs,
  errors,
  isLoading,
  onAddRecord,
  onDeleteRecord,
  onImportRecords,
  onExportEncryptedBackup,
  onClearWorkspace,
  onLogout,
}) {
  const [activeTab, setActiveTab] = useState('records')
  const [showForm, setShowForm] = useState(false)
  const [filterType, setFilterType] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')

  const stats = useMemo(() => {
    const total = records.length
    const totalAmount = records.reduce((sum, t) => sum + Number(t.amount || 0), 0)
    const byType = {}
    records.forEach(t => {
      byType[t.type] = (byType[t.type] || 0) + 1
    })
    return { total, totalAmount, average: total > 0 ? totalAmount / total : 0, byType }
  }, [records])

  const filteredRecords = useMemo(() => {
    const term = searchTerm.toLowerCase()
    return records.filter(t => {
      const reference = t.reference ?? t.accountNumber ?? ''
      const note = t.note ?? t.description ?? ''
      const matchesType = filterType === 'all' || t.type === filterType
      const matchesSearch = String(reference).toLowerCase().includes(term) || String(note).toLowerCase().includes(term)
      return matchesType && matchesSearch
    })
  }, [records, filterType, searchTerm])

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="brand-title">
          <img src="/assets/logicore-velocity-ai-logo.svg" alt="Logicore Velocity AI" className="dashboard-logo" />
          <div>
            <h1>Essential Workspace</h1>
            <p>{user.companyName} · {user.email}</p>
          </div>
        </div>
        <div className="header-actions">
          <a className="doc-link" href="/templates/logicore_velocity_ai_tenant_essential_templates.xlsx" download>Tenant Template XLSX</a>
          <button onClick={onClearWorkspace} className="danger-outline">Clear Local Workspace</button>
          <button onClick={onLogout} className="logout-button">Lock</button>
        </div>
      </header>

      <div className="safety-banner">
        Local-first: records are encrypted in this browser. Templates use company placeholders, not CWW. Keep phone numbers as changeable contacts; use Employee ID + tenant IDs for future backend migration.
      </div>

      {errors.length > 0 && (
        <div className="error-container">
          {errors.map((err, i) => <div key={i} className="error-alert">{err}</div>)}
        </div>
      )}

      <section className="stats-section">
        <div className="stat-card"><h3>Total Records</h3><p>{stats.total}</p></div>
        <div className="stat-card"><h3>Total Amount</h3><p>AED {stats.totalAmount.toFixed(2)}</p></div>
        <div className="stat-card"><h3>Average</h3><p>AED {stats.average.toFixed(2)}</p></div>
        <div className="stat-card"><h3>Record Types</h3><p>{Object.keys(stats.byType).length}</p></div>
      </section>

      <div className="tabs">
        <button className={`tab-button ${activeTab === 'records' ? 'active' : ''}`} onClick={() => setActiveTab('records')}>Records</button>
        <button className={`tab-button ${activeTab === 'importExport' ? 'active' : ''}`} onClick={() => setActiveTab('importExport')}>Import / Export</button>
        <button className={`tab-button ${activeTab === 'audit' ? 'active' : ''}`} onClick={() => setActiveTab('audit')}>Audit</button>
      </div>

      {activeTab === 'records' && (
        <div className="tab-content">
          <div className="section-header">
            <h2>Workspace Records</h2>
            <button className="add-button" onClick={() => setShowForm(!showForm)}>{showForm ? 'Close' : 'New Record'}</button>
          </div>

          {showForm && <TransactionForm onSubmit={(data) => { onAddRecord(data); setShowForm(false) }} isLoading={isLoading} />}

          <div className="filters">
            <input type="text" placeholder="Search reference or note..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="search-input" />
            <select value={filterType} onChange={e => setFilterType(e.target.value)} className="filter-select">
              <option value="all">All Types</option>
              <option value="income">Income</option>
              <option value="expense">Expense</option>
              <option value="salary">Salary</option>
              <option value="fine">Fine</option>
              <option value="advance">Advance</option>
              <option value="adjustment">Adjustment</option>
            </select>
          </div>

          <TransactionList transactions={filteredRecords} onDelete={onDeleteRecord} isLoading={isLoading} />
        </div>
      )}

      {activeTab === 'importExport' && (
        <ExcelManager
          records={records}
          onImportRecords={onImportRecords}
          onExportEncryptedBackup={onExportEncryptedBackup}
          isLoading={isLoading}
        />
      )}

      {activeTab === 'audit' && (
        <div className="audit-list">
          {auditLogs.length === 0 ? <p>No audit logs yet.</p> : auditLogs.map(log => (
            <div key={log.id} className="audit-card">
              <strong>{log.action}</strong>
              <span>{new Date(log.timestamp).toLocaleString()}</span>
              <small>{log.actor}</small>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
