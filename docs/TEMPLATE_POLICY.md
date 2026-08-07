# Template Policy

## Keep templates generic

Do not ship templates with CWW, Class Worldwide, client names, TRN, phone numbers, addresses, or old business details unless the tenant using the file is exactly that company.

Use placeholders:

```text
[Tenant Trade Name]
[Tenant TRN]
[Tenant Address]
[Tenant Client Name]
[Project Name]
```

## Useful template modules

The current essential template workbook includes:

- Tenant configuration
- Driver master
- Onboarding gates
- Assignments
- Finance ledger
- Payroll
- Payslip publish log
- Leave requests
- Maintenance register
- Evidence register
- Client policy overrides
- Backup log
- Audit log
- Lookups

## Future implementation ID columns

Keep these columns even if blank in local mode:

```text
lv_record_id
tenant_id
driver_profile_id
payroll_run_id
import_batch_id
source_row_id
external_source_id
```

They make future migration to the real backend much safer.
