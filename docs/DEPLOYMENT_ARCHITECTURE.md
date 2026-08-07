# Logicore Velocity AI Essential Deployment Architecture

## Now: easiest deploy

```text
Browser app on static host
        ↓
Encrypted local browser vault
        ↓
CSV/XLS/XLSX import/export
        ↓
Encrypted backup file controlled by user/tenant
```

Commands:

```powershell
npm install
npm run dev
npm run build
npm run preview
```

Static hosting:

```text
Build command: npm run build
Output folder: dist
```

## No heavy backend now

Do not deploy the full Logicore Velocity monorepo just to start. Use this to gain deployment and template experience first.

## Later: proper production path

```text
Web app / mobile app
        ↓
Logicore API
        ↓
PostgreSQL with tenant_id and RBAC/RLS
        ↓
File storage for payslips/evidence
        ↓
Audit log + backup jobs
```

Recommended future split:

```text
Static web: Vercel / Azure Static Web Apps
API: Azure App Service / Render / Cloud Run
DB: Managed PostgreSQL
Files: same cloud object storage
Google Sheets: import/export helper only
```

## Tenant data model

Every real backend table should include:

```text
tenant_id
created_by
created_at
updated_at
source
import_batch_id
external_source_id
```

For people/drivers, do not use phone as identity. Keep:

```text
person_id
driver_profile_id
employee_id
emirates_id/passport reference
current_contact_number
```
