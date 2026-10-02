# Panduan Instalasi

## Prasyarat
- Node.js sesuai versi yang ditetapkan repository.
- npm/pnpm sesuai lockfile.
- Git.
- Akses GitHub repository.
- Project database Supabase yang benar.
- Credential deployment provider.

## Instalasi
```bash
git clone https://github.com/Yudi8377/AK-VISIO-SOFTWARE-FACTORY-V2.git
cd AK-VISIO-SOFTWARE-FACTORY-V2
npm ci
npm run build
```

## Pemeriksaan
Build harus berhasil sebelum aplikasi dianggap siap diuji. Jangan melewati CI hanya karena build lokal berhasil.

## Konfigurasi
Salin variabel yang diwajibkan oleh workflow/application ke environment yang sesuai. Secret hanya boleh berada pada secret store/platform environment.