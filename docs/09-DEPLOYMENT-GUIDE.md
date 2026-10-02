# Panduan Deployment

## Pipeline
```
CI
→ Enterprise Foundation
→ QA/Security
→ Build
→ Release Gate
→ Provider Deployment
→ Production Check
→ Promotion State
```

## Gate
Deployment dianggap selesai hanya bila production verification memberikan evidence sukses.

## Rollback
Rollback harus menunjuk release/deployment identifier yang jelas dan mempertahankan audit lineage. Jangan melakukan perubahan manual yang memutus jejak release.