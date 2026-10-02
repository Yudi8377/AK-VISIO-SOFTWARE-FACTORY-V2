# Panduan Backup & Restore

## Backup
Backup harus mencakup database sesuai kemampuan provider, configuration inventory, migration history, dan release evidence.

## Restore
1. Validasi target.
2. Tentukan recovery point.
3. Restore ke controlled environment bila memungkinkan.
4. Verifikasi schema/RLS.
5. Jalankan smoke test.
6. Reconcile audit/release lineage.
7. Promote hanya setelah verification.

## Catatan
Backup credential harus diperlakukan sebagai secret dan tidak dimasukkan ke repository.