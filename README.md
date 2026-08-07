# Logicore Velocity AI Essential Workspace

Open-source local import/export workspace for small operations teams who need a practical start before a full backend is deployed.

This package includes:

- A simple React/Vite local workspace
- Encrypted browser vault storage
- CSV/XLS/XLSX import for simple records
- CSV export and encrypted backup export
- Logicore Velocity AI logo SVG assets
- Generic tenant templates with future backend ID columns
- Deployment instructions for static hosting

## Important position

This is useful for local import/export and learning deployment. It is not a replacement for the full Logicore Velocity backend when handling official payroll, Emirates ID/passport records, bank data, or multi-user tenant governance.

## Run locally

```powershell
npm install
npm run dev
```

## Build

```powershell
npm run build
npm run preview
```

## Static deploy

Use:

```text
Build command: npm run build
Output folder: dist
```

Works on Vercel, Netlify, Azure Static Web Apps, Cloudflare Pages, or any static host.

## Templates

The tenant template workbook is available in:

```text
public/templates/logicore_velocity_ai_tenant_essential_templates.xlsx
```

The templates are generic. Replace placeholders with the tenant/company trade name. Do not keep CWW or any old company name unless that is the actual tenant using the workbook.

## License

Code is released under MIT. Brand usage is explained in `BRAND_NOTICE.md`.
