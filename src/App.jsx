import React, { useState } from 'react'
import LoginForm from './components/LoginForm'
import Dashboard from './components/Dashboard'
import ErrorBoundary from './components/ErrorBoundary'
import { createRecord, importRecords } from './services/recordService'
import {
  createAudit,
  createWorkspace,
  openWorkspace,
  saveVault,
  loadWorkspaceMeta,
  clearWorkspaceStorage,
  exportEncryptedBackup,
  hasLegacyPlaintextData,
} from './services/vaultStore'
import './styles/App.css'

export default function App() {
  const [owner, setOwner] = useState(() => loadWorkspaceMeta())
  const [session, setSession] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState([])
  const [legacyWarning] = useState(() => hasLegacyPlaintextData())

  const persistVault = async (nextVault) => {
    if (!session?.key) throw new Error('Workspace is not open')
    await saveVault(session.key, nextVault)
    setSession(prev => ({ ...prev, vault: nextVault }))
  }

  const appendAudit = async (vault, action, details = {}) => {
    const nextLogs = [createAudit(action, session?.owner?.email, details), ...(vault.auditLogs || [])].slice(0, 1000)
    return { ...vault, auditLogs: nextLogs }
  }

  const handleLogin = async ({ companyName, email, passcode }) => {
    setIsLoading(true)
    try {
      const opened = owner
        ? await openWorkspace({ email, passcode })
        : await createWorkspace({ companyName, email, passcode })
      setSession(opened)
      setOwner(loadWorkspaceMeta())
      setErrors([])
    } catch (error) {
      setErrors([error.message || 'Unable to open workspace'])
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = () => {
    setSession(null)
  }

  const handleAddRecord = async (data) => {
    try {
      const record = createRecord(data)
      let nextVault = {
        ...session.vault,
        records: [record, ...(session.vault.records || [])],
      }
      nextVault = await appendAudit(nextVault, 'CREATE_RECORD', { id: record.id, type: record.type })
      await persistVault(nextVault)
      setErrors([])
    } catch (error) {
      setErrors([error.message])
    }
  }

  const handleDeleteRecord = async (id) => {
    try {
      let nextVault = {
        ...session.vault,
        records: (session.vault.records || []).filter(t => t.id !== id),
      }
      nextVault = await appendAudit(nextVault, 'DELETE_RECORD', { id })
      await persistVault(nextVault)
      setErrors([])
    } catch (error) {
      setErrors([error.message])
    }
  }

  const handleImportRecords = async (items) => {
    const result = importRecords(items)
    if (result.created.length > 0) {
      let nextVault = {
        ...session.vault,
        records: [...result.created, ...(session.vault.records || [])],
      }
      nextVault = await appendAudit(nextVault, 'IMPORT_RECORDS', {
        created: result.created.length,
        failed: result.errors.length,
      })
      await persistVault(nextVault)
    }
    setErrors(result.errors.length ? [`Import finished with ${result.errors.length} row errors`] : [])
    return result
  }

  const handleExportEncryptedBackup = () => exportEncryptedBackup()

  const handleClearWorkspace = () => {
    const confirmed = window.confirm('This permanently clears the encrypted local workspace from this browser. Export a backup first. Continue?')
    if (!confirmed) return
    clearWorkspaceStorage()
    setOwner(null)
    setSession(null)
    setErrors([])
  }

  if (!session) {
    return (
      <ErrorBoundary>
        <LoginForm
          onLogin={handleLogin}
          isLoading={isLoading}
          error={errors[0]}
          hasWorkspace={Boolean(owner)}
          legacyWarning={legacyWarning}
        />
      </ErrorBoundary>
    )
  }

  return (
    <ErrorBoundary>
      <Dashboard
        user={session.owner}
        records={session.vault.records || []}
        auditLogs={session.vault.auditLogs || []}
        errors={errors}
        isLoading={isLoading}
        onAddRecord={handleAddRecord}
        onDeleteRecord={handleDeleteRecord}
        onImportRecords={handleImportRecords}
        onExportEncryptedBackup={handleExportEncryptedBackup}
        onClearWorkspace={handleClearWorkspace}
        onLogout={handleLogout}
      />
    </ErrorBoundary>
  )
}
