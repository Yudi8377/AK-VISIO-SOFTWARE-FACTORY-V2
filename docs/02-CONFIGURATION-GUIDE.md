# Panduan Konfigurasi

## Kategori
1. Runtime application.
2. Database/Supabase.
3. Authentication.
4. Deployment provider.
5. Autonomous recovery.
6. Scheduler.
7. Audit/observability.

## Aturan
- Gunakan environment-specific configuration.
- Jangan commit secret, token, private key, service-role key, atau lease credential.
- Gunakan least privilege.
- Production credential tidak boleh dipakai pada development.
- Setiap perubahan konfigurasi produksi harus dapat ditelusuri melalui deployment/audit lineage.

## Verifikasi
Setelah perubahan: CI → security checks → build → deployment → production check.