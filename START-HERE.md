# AK VISIO SOFTWARE FACTORY V2 — START HERE

## Tujuan
Dokumen ini adalah pintu masuk operasional untuk menjalankan, mengelola, mengaudit, dan memulihkan AK VISIO SOFTWARE FACTORY V2.

## Urutan penggunaan
1. Baca [Arsitektur](docs/16-ARCHITECTURE.md).
2. Ikuti [Panduan Instalasi](docs/01-INSTALLATION-GUIDE.md).
3. Konfigurasikan environment melalui [Configuration Guide](docs/02-CONFIGURATION-GUIDE.md).
4. Verifikasi database melalui [Database Deployment](docs/03-DATABASE-DEPLOYMENT-GUIDE.md).
5. Operasikan factory melalui [Factory Operations](docs/06-FACTORY-OPERATIONS-GUIDE.md).
6. Kelola audit dan governance melalui [Audit Governance](docs/07-AUDIT-GOVERNANCE-GUIDE.md).
7. Ikuti [Deployment Guide](docs/09-DEPLOYMENT-GUIDE.md) sebelum Go-Live.
8. Untuk insiden gunakan [Recovery Guide](docs/11-RECOVERY-GUIDE.md).

## Prinsip
- Tidak ada promosi produksi tanpa verifikasi.
- Approval gate mengikuti risk level.
- Audit tidak boleh memuat secret.
- Perubahan database harus melalui migration.
- Production incident harus mempunyai lineage yang dapat ditelusuri.
- Konfigurasi provider dan credential tidak disimpan di source code.

## Status dokumentasi
Dokumentasi ini melengkapi dokumen arsitektur dan execution-plane yang telah ada di direktori `docs/`.