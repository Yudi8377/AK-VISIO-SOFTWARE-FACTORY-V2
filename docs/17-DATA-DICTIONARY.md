# Data Dictionary

## Aturan naming
Database identifiers tetap stabil untuk compatibility. Label UI dapat dilokalkan tanpa mengubah schema.

## Kelompok data
- Control plane state
- Project/request state
- Factory execution state
- Artifact metadata/hash
- QA/security results
- Release/deployment state
- Recovery/incident state
- Audit ledger

## Data sensitivity
Credential, token, secret, private key, dan authentication material adalah restricted. Audit payload harus menggunakan redaction/filtering.