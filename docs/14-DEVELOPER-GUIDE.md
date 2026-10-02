# Panduan Developer

## Prinsip
Pertahankan separation antara UI, control plane, execution plane, persistence, provider adapter, dan governance.

## Perubahan
- Gunakan branch.
- Buat perubahan kecil dan dapat direview.
- Tambahkan test untuk behavior baru.
- Jangan mengubah database contract tanpa migration.
- Jangan memasukkan secret.

## Next.js
Ikuti App Router conventions, server/client boundary, async APIs, route-handler contracts, dan runtime constraints repository.

## Release
Developer branch → PR → checks → merge → deployment verification.