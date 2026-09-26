# AK Repo Studio
Local-first repository import and integration preparation workspace for AK VISIO ENGINEER.

## Windows
1. Install Node.js 24.x.
2. Open this folder.
3. Double-click RUN-AK-REPO-STUDIO.bat.
4. Browser opens http://127.0.0.1:4317.
5. Keep the launcher window open.

## Current capability
- ZIP import into local .ak-repo-studio/imports/
- SHA-256 manifest
- safety defaults
- no production writes
- no destructive operations
- no external network access
- deterministic local HTTP UI

GitHub Actions packages the app as a Windows-friendly ZIP artifact on tag repo-studio-v*.