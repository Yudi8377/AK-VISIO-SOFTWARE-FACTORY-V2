# Release Management

## Release record
Setiap release minimal mempunyai:
- version/release identifier
- source commit
- artifact identity/hash
- CI evidence
- security/QA evidence
- deployment identifier
- production verification
- rollback target
- audit correlation

## Promotion
Promotion hanya boleh terjadi dari release candidate yang telah memenuhi gate.

## Rollback
Rollback adalah release action yang tercatat, bukan perubahan manual tanpa evidence.