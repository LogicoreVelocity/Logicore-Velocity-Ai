import React, { useRef, useState } from 'react'
import readXlsxFile from 'read-excel-file'
import '../styles/ExcelManager.css'

function downloadText(filename, text, type = 'text/csv;charset=utf-8') {
  const blob = new Blob([text], { type })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

function neutralizeFormula(value) {
  const text = value === null || value === undefined ? '' : String(value)
  return /^[=+\-@]/.test(text.trim()) ? `'${text}` : text
}

function csvEscape(value) {
  const text = neutralizeFormula(value)
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text
}

function toCsv(rows) {
  return rows.map(row => row.map(csvEscape).join(',')).join('\n')
}

function parseCsv(text) {
  const lines = text.split(/\r?\n/).filter(line => line.trim().length > 0)
  return lines.map(line => {
    const out = []
    let current = ''
    let inQuotes = false
    for (let i = 0; i < line.length; i += 1) {
      const ch = line[i]
      const next = line[i + 1]
      if (ch === '"' && inQuotes && next === '"') {
        current += '"'
        i += 1
      } else if (ch === '"') {
        inQuotes = !inQuotes
      } else if (ch === ',' && !inQuotes) {
        out.push(current)
        current = ''
      } else {
        current += ch
      }
    }
    out.push(current)
    return out
  })
}

function rowToRecord(row, rowNumber) {
  return {
    rowNumber,
    type: String(row[0] || '').toLowerCase().trim(),
    amount: Number(row[1]),
    reference: String(row[2] || '').trim(),
    note: String(row[3] || '').trim(),
  }
}

export default function ExcelManager({ records, onImportRecords, onExportEncryptedBackup, isLoading }) {
  const fileInputRef = useRef(null)
  const [importStatus, setImportStatus] = useState(null)
  const [importErrors, setImportErrors] = useState([])

  const downloadTemplate = () => {
    const rows = [
      ['Type', 'Amount', 'Reference', 'Note'],
      ['salary', '2500', 'EMP001', 'May salary example'],
      ['fine', '100', 'EMP001', 'Traffic fine example'],
      ['advance', '500', 'EMP002', 'Cash advance example'],
    ]
    downloadText('logicore-import-template.csv', toCsv(rows))
  }

  const exportRecords = () => {
    if (records.length === 0) {
      alert('No records to export')
      return
    }
    const rows = [
      ['Type', 'Amount', 'Reference', 'Note', 'Created'],
      ...records.map(t => [t.type, t.amount, t.reference ?? t.accountNumber, t.note ?? t.description, t.createdAt]),
    ]
    downloadText(`logicore-records-${new Date().toISOString().slice(0, 10)}.csv`, toCsv(rows))
  }

  const exportBackup = () => {
    try {
      downloadText(
        `logicore-encrypted-backup-${new Date().toISOString().slice(0, 10)}.json`,
        onExportEncryptedBackup(),
        'application/json;charset=utf-8',
      )
    } catch (error) {
      alert(error.message || 'Unable to export backup')
    }
  }

  const handleFileSelect = async (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      const lower = file.name.toLowerCase()
      let rows
      if (lower.endsWith('.csv')) {
        rows = parseCsv(await file.text())
      } else if (lower.endsWith('.xlsx') || lower.endsWith('.xls')) {
        rows = await readXlsxFile(file)
      } else {
        throw new Error('Use CSV, XLS, or XLSX only')
      }

      if (!rows || rows.length < 2) {
        setImportStatus({ success: false, message: 'File is empty' })
        return
      }

      const payload = []
      for (let i = 1; i < rows.length; i += 1) payload.push(rowToRecord(rows[i], i + 1))
      const result = await onImportRecords(payload)
      setImportStatus({ success: result.created.length > 0, message: `Imported ${result.created.length} records${result.errors.length ? ` (${result.errors.length} errors)` : ''}` })
      setImportErrors(result.errors)
    } catch (error) {
      setImportStatus({ success: false, message: error.message || 'Import failed' })
      setImportErrors([])
    }

    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  return (
    <div className="excel-manager">
      <div className="excel-section">
        <h3>Import</h3>
        <p>Import simple CSV/XLSX records. Columns: Type, Amount, Reference, Note. For full tenant data, use the generic tenant template workbook.</p>
        <input ref={fileInputRef} type="file" accept=".xlsx,.xls,.csv" onChange={handleFileSelect} style={{ display: 'none' }} />
        <button onClick={() => fileInputRef.current?.click()} disabled={isLoading} className="action-button">Choose File</button>
        <button onClick={downloadTemplate} className="action-button secondary">Simple CSV Template</button>
        <a className="template-link" href="/templates/logicore_velocity_ai_tenant_essential_templates.xlsx" download>Full Tenant Template XLSX</a>
        {importStatus && <div className={`status ${importStatus.success ? 'success' : 'error'}`}>{importStatus.message}</div>}
        {importErrors.length > 0 && <div className="errors">{importErrors.slice(0, 10).map((err, i) => <p key={i}>Row {err.row}: {err.error}</p>)}</div>}
      </div>

      <div className="excel-section">
        <h3>Export / Backup</h3>
        <p>Total: <strong>{records.length}</strong> records</p>
        <button onClick={exportRecords} disabled={records.length === 0 || isLoading} className="action-button">Export CSV</button>
        <button onClick={exportBackup} disabled={isLoading} className="action-button secondary">Export Encrypted Backup</button>
        <p className="help-text">CSV is readable. Encrypted backup needs your workspace passcode. The full XLSX template keeps tenant/company placeholders and future backend ID columns.</p>
      </div>
    </div>
  )
}
