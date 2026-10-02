# Panduan Keamanan

## Baseline
- Least privilege.
- RLS untuk data boundary.
- Security response headers.
- Secret isolation.
- Authenticated control APIs.
- Deterministic audit lineage.
- Approval gates untuk high/critical risk.

## Secure development
Jangan memasukkan credential ke source, logs, artifacts, test fixtures, atau error response. Validasi input pada boundary API dan jangan mempercayai client-side authorization.

## Incident
Jika credential bocor: revoke/rotate segera, identifikasi blast radius, preserve audit evidence, dan jalankan recovery procedure.