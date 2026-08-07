import React, { useState } from 'react'
import '../styles/TransactionForm.css'

export default function TransactionForm({ onSubmit, isLoading }) {
  const [formData, setFormData] = useState({ accountNumber: '', amount: '', type: 'income', description: '' })
  const [errors, setErrors] = useState({})

  const validate = () => {
    const nextErrors = {}
    if (!formData.accountNumber.trim()) nextErrors.accountNumber = 'Required'
    if (!formData.amount) nextErrors.amount = 'Required'
    if (Number(formData.amount) <= 0) nextErrors.amount = 'Must be positive'
    return nextErrors
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const nextErrors = validate()
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors)
      return
    }
    onSubmit(formData)
    setFormData({ accountNumber: '', amount: '', type: 'income', description: '' })
    setErrors({})
  }

  return (
    <form onSubmit={handleSubmit} className="transaction-form">
      <div className="form-grid">
        <div className="form-group">
          <label>Reference / Employee / Account *</label>
          <input
            type="text"
            value={formData.accountNumber}
            onChange={e => setFormData({ ...formData, accountNumber: e.target.value })}
            placeholder="EMP001 / ACC001 / Driver ID"
            disabled={isLoading}
            className={errors.accountNumber ? 'error' : ''}
          />
          {errors.accountNumber && <span className="error-text">{errors.accountNumber}</span>}
        </div>

        <div className="form-group">
          <label>Amount *</label>
          <input
            type="number"
            step="0.01"
            value={formData.amount}
            onChange={e => setFormData({ ...formData, amount: e.target.value })}
            placeholder="0.00"
            disabled={isLoading}
            className={errors.amount ? 'error' : ''}
          />
          {errors.amount && <span className="error-text">{errors.amount}</span>}
        </div>

        <div className="form-group">
          <label>Type *</label>
          <select value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value })} disabled={isLoading}>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
            <option value="salary">Salary</option>
            <option value="fine">Fine</option>
            <option value="advance">Advance</option>
            <option value="adjustment">Adjustment</option>
          </select>
        </div>

        <div className="form-group">
          <label>Note</label>
          <textarea
            value={formData.description}
            onChange={e => setFormData({ ...formData, description: e.target.value })}
            placeholder="Optional note"
            rows="2"
            disabled={isLoading}
          />
        </div>
      </div>

      <button type="submit" disabled={isLoading} className="submit-button">
        {isLoading ? 'Saving...' : 'Save Record'}
      </button>
    </form>
  )
}
