# Security and Privacy

## What this local workspace protects

- Records are stored in an encrypted browser vault using browser Web Crypto.
- Backups are exported as encrypted JSON.
- CSV export neutralizes spreadsheet formula injection by prefixing risky values.
- No hardcoded demo login is included.

## What this local workspace does not protect enough for official production

Do not use this as the final system of record for:

- Emirates ID full numbers
- Passport full numbers
- Bank account details
- Official payroll approval history
- Multi-user tenant access
- Long-term HR/legal records

For those, connect the full backend:

```text
Logicore API + PostgreSQL + tenant isolation + RBAC + audit trail + file storage
```

## Identity rule

Phone number is not permanent identity. Drivers/riders may change numbers. Use:

```text
Tenant ID + Employee ID + Driver Profile ID + Emirates ID/passport reference
```

Phone/WhatsApp number should be treated as a changeable contact field only.
