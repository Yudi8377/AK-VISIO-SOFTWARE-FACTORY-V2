# Panduan Deployment Database

## Prinsip
Database schema adalah bagian dari release dan harus versioned melalui `supabase/migrations/`.

## Prosedur
1. Review migration.
2. Pastikan target project benar.
3. Backup/rollback plan tersedia.
4. Apply migration.
5. Jalankan schema/constraint/RLS verification.
6. Jalankan application checks.
7. Catat migration version pada release evidence.

## Peringatan
Jangan menerapkan migration AK VISIO ke project Supabase lain. Target production harus diverifikasi berdasarkan project reference yang benar.

## RLS
Setiap tabel production harus memiliki policy yang sesuai dengan actor, organization, dan environment scope. Jangan menggunakan broad public write policy.