import React, { useState } from 'react'
import '../styles/LoginForm.css'

export default function LoginForm({ onLogin, isLoading, error, hasWorkspace, legacyWarning }) {
  const [companyName, setCompanyName] = useState('')
  const [email, setEmail] = useState('')
  const [passcode, setPasscode] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    onLogin({ companyName, email, passcode })
  }

  return (
    <div className="login-container">
      <div className="login-box">
        <div className="login-header brand-login">
          <img src="/assets/logicore-velocity-ai-logo.svg" alt="Logicore Velocity AI" className="brand-logo" />
          <h1>Essential Workspace</h1>
          <p>Tenant-owned import/export workspace. Data stays in this browser unless you export it.</p>
        </div>

        <div className="privacy-note">
          {hasWorkspace
            ? 'Open the existing encrypted local workspace.'
            : 'First setup: create the workspace owner for this browser and company.'}
        </div>

        {legacyWarning && <div className="error-message">Older plaintext local data was found. It will be ignored after creating/opening the encrypted workspace.</div>}

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="login-form">
          {!hasWorkspace && (
            <div className="form-group">
              <label htmlFor="companyName">Company / tenant trade name</label>
              <input
                id="companyName"
                type="text"
                value={companyName}
                onChange={e => setCompanyName(e.target.value)}
                placeholder="Your company or tenant name"
                disabled={isLoading}
                autoFocus
              />
            </div>
          )}

          <div className="form-group">
            <label htmlFor="email">Workspace owner email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="owner@example.com"
              disabled={isLoading}
              autoFocus={hasWorkspace}
            />
          </div>

          <div className="form-group">
            <label htmlFor="passcode">Workspace passcode</label>
            <input
              id="passcode"
              type="password"
              value={passcode}
              onChange={e => setPasscode(e.target.value)}
              placeholder="Choose or enter passcode"
              disabled={isLoading}
            />
          </div>

          <button type="submit" disabled={isLoading} className="login-button">
            {isLoading ? 'Please wait...' : hasWorkspace ? 'Open Workspace' : 'Create Workspace'}
          </button>
        </form>

        <p className="local-warning">
          This is a local-first base for import/export experience. Use the full backend later for official payroll, identity documents, multi-user access, and final tenant governance.
        </p>
      </div>
    </div>
  )
}
