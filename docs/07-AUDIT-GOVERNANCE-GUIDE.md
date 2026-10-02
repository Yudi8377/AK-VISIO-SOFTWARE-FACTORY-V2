# Panduan Audit & Governance

## Tujuan
Audit menyediakan bukti deterministik atas aktivitas factory.

## Yang dicatat
- event identity
- actor/context
- organization/environment scope
- execution/release/recovery correlation
- outcome
- timestamp
- hash-chain evidence bila berlaku

## Perlindungan
Secret-like values harus difilter. Audit event tidak boleh menjadi tempat penyimpanan credential.

## Review
Audit digunakan untuk incident investigation, release review, compliance evidence, dan operational accountability.