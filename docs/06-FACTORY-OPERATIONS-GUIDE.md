# Panduan Operasi Factory

## Lifecycle
```
CONTROL PLANE
→ BUSINESS DNA
→ GENERATION PLAN
→ FACTORY EXECUTION
→ ARTIFACT REGISTRY
→ QA/SECURITY
→ BUILD/RELEASE
→ DEPLOYMENT
→ PROMOTION
→ VERIFICATION
→ RECOVERY bila diperlukan
```

## Operator checklist
- Request memiliki scope.
- Risk level teridentifikasi.
- Artifact hash tersedia.
- QA/security lulus.
- Release gate lulus.
- Deployment evidence tersedia.
- Production verification lulus.
- Audit lineage lengkap.

## Kegagalan
Jangan memaksa promotion. Gunakan recovery/escalation path dan pertahankan incident lineage.