const META_KEY = 'logicore_workspace_meta_v2'
const VAULT_KEY = 'logicore_workspace_vault_v2'
const LEGACY_KEYS = ['logicore_workspace_owner', 'logicore_workspace_records', 'logicore_workspace_audit_logs']
const KDF_ITERATIONS = 210000

function bytesToBase64(bytes) {
  let binary = ''
  const arr = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes)
  for (const b of arr) binary += String.fromCharCode(b)
  return btoa(binary)
}

function base64ToBytes(value) {
  const binary = atob(value)
  const out = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i += 1) out[i] = binary.charCodeAt(i)
  return out
}

function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase()
}

function assertCryptoAvailable() {
  if (!globalThis.crypto?.subtle || !globalThis.crypto?.getRandomValues) {
    throw new Error('This browser does not support Web Crypto. Use a modern browser over HTTPS or localhost.')
  }
}

export function loadWorkspaceMeta() {
  try {
    const raw = localStorage.getItem(META_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function hasLegacyPlaintextData() {
  return LEGACY_KEYS.some(key => localStorage.getItem(key))
}

export function clearLegacyPlaintextData() {
  for (const key of LEGACY_KEYS) localStorage.removeItem(key)
}

export function clearWorkspaceStorage() {
  localStorage.removeItem(META_KEY)
  localStorage.removeItem(VAULT_KEY)
  clearLegacyPlaintextData()
}

async function deriveVaultKey(passcode, saltBase64) {
  assertCryptoAvailable()
  const passcodeBytes = new TextEncoder().encode(String(passcode || ''))
  const baseKey = await crypto.subtle.importKey('raw', passcodeBytes, 'PBKDF2', false, ['deriveKey'])
  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: base64ToBytes(saltBase64),
      iterations: KDF_ITERATIONS,
      hash: 'SHA-256',
    },
    baseKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt'],
  )
}

async function encryptObject(key, objectValue) {
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const encoded = new TextEncoder().encode(JSON.stringify(objectValue))
  const encrypted = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, encoded)
  return {
    algorithm: 'AES-GCM',
    iv: bytesToBase64(iv),
    data: bytesToBase64(new Uint8Array(encrypted)),
  }
}

async function decryptObject(key, envelope) {
  const decrypted = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: base64ToBytes(envelope.iv) },
    key,
    base64ToBytes(envelope.data),
  )
  return JSON.parse(new TextDecoder().decode(decrypted))
}

function createAuditEntry(action, actor, details = {}) {
  return {
    id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    action,
    actor: actor || 'local-user',
    timestamp: new Date().toISOString(),
    details,
  }
}

export async function createWorkspace({ companyName, email, passcode }) {
  const normalizedCompany = String(companyName || '').trim()
  const normalizedEmail = normalizeEmail(email)
  const normalizedPasscode = String(passcode || '')

  if (!normalizedCompany) throw new Error('Company/workspace name is required')
  if (!normalizedEmail) throw new Error('Workspace email is required')
  if (normalizedPasscode.length < 8) throw new Error('Use at least 8 characters for the workspace passcode')

  const salt = crypto.getRandomValues(new Uint8Array(16))
  const saltBase64 = bytesToBase64(salt)
  const meta = {
    schemaVersion: 2,
    appName: 'Logicore Local Workspace Essential',
    companyName: normalizedCompany,
    email: normalizedEmail,
    kdf: { name: 'PBKDF2', hash: 'SHA-256', iterations: KDF_ITERATIONS, salt: saltBase64 },
    createdAt: new Date().toISOString(),
  }
  const key = await deriveVaultKey(normalizedPasscode, saltBase64)
  const vault = {
    schemaVersion: 2,
    records: [],
    auditLogs: [createAuditEntry('WORKSPACE_CREATED', normalizedEmail, { companyName: normalizedCompany })],
  }

  localStorage.setItem(META_KEY, JSON.stringify(meta))
  localStorage.setItem(VAULT_KEY, JSON.stringify(await encryptObject(key, vault)))
  clearLegacyPlaintextData()

  return { owner: { id: 'local-owner', companyName: normalizedCompany, email: normalizedEmail, role: 'workspace_owner' }, key, vault }
}

export async function openWorkspace({ email, passcode }) {
  const meta = loadWorkspaceMeta()
  if (!meta) throw new Error('No local workspace found in this browser')

  const normalizedEmail = normalizeEmail(email)
  if (normalizedEmail !== meta.email) throw new Error('Invalid workspace email or passcode')

  const rawVault = localStorage.getItem(VAULT_KEY)
  if (!rawVault) throw new Error('Workspace vault is missing')

  try {
    const key = await deriveVaultKey(String(passcode || ''), meta.kdf.salt)
    const vault = await decryptObject(key, JSON.parse(rawVault))
    return { owner: { id: 'local-owner', companyName: meta.companyName, email: meta.email, role: 'workspace_owner' }, key, vault }
  } catch {
    throw new Error('Invalid workspace email or passcode')
  }
}

export async function saveVault(key, vault) {
  localStorage.setItem(VAULT_KEY, JSON.stringify(await encryptObject(key, vault)))
}

export function createAudit(action, actor, details = {}) {
  return createAuditEntry(action, actor, details)
}

export function exportEncryptedBackup() {
  const meta = localStorage.getItem(META_KEY)
  const vault = localStorage.getItem(VAULT_KEY)
  if (!meta || !vault) throw new Error('No encrypted workspace backup is available')
  return JSON.stringify({ exportedAt: new Date().toISOString(), meta: JSON.parse(meta), vault: JSON.parse(vault) }, null, 2)
}
