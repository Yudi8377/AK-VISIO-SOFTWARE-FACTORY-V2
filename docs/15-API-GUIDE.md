# Panduan API

## Control boundary
API factory harus memvalidasi authentication, authorization/capability, input, scope, dan risk.

## Response
Gunakan status HTTP yang konsisten dan jangan membocorkan secret atau internal credential.

## Audit
Mutation penting harus menghasilkan audit event yang dapat dikorelasikan dengan request/execution/release/recovery.

## Compatibility
Perubahan contract harus backward-compatible atau mempunyai version/migration strategy.