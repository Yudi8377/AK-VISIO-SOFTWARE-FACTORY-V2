# Panduan Recovery

## Tahapan
1. Detect.
2. Classify.
3. Correlate.
4. Check recovery policy.
5. Execute approved recovery action.
6. Verify production.
7. Record outcome.
8. Escalate when policy cannot safely recover.

## Safety
Recovery tidak boleh menghapus evidence. Hindari retry tanpa batas. Gunakan idempotency dan trusted scheduler controls.

## Escalation
Jika recovery gagal atau risiko meningkat, tahan promotion/release dan eskalasi kepada operator yang berwenang.