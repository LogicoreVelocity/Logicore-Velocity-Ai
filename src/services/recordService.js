const ALLOWED_TYPES = new Set(['income', 'expense', 'salary', 'fine', 'advance', 'adjustment'])

function normalizeText(value, maxLength) {
  return String(value || '').trim().slice(0, maxLength)
}

export function createRecord(data) {
  const amount = Number(data.amount)
  const type = normalizeText(data.type, 30).toLowerCase()
  const reference = normalizeText(data.reference ?? data.accountNumber, 80)
  const note = normalizeText(data.note ?? data.description, 500)

  if (!reference) throw new Error('Reference / employee / account is required')
  if (!ALLOWED_TYPES.has(type)) throw new Error(`Unsupported record type: ${type || '(blank)'}`)
  if (!Number.isFinite(amount) || amount <= 0) throw new Error('Amount must be a positive number')

  return {
    id: `rec-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    reference,
    accountNumber: reference,
    amount: Math.round(amount * 100) / 100,
    type,
    note,
    description: note,
    createdAt: new Date().toISOString(),
  }
}

export function importRecords(rows) {
  const created = []
  const errors = []
  rows.forEach((item, index) => {
    try {
      created.push(createRecord(item))
    } catch (error) {
      errors.push({ row: item.rowNumber ?? index + 1, error: error.message })
    }
  })
  return { created, errors }
}
