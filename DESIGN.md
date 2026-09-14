# Product Design Contract

AK VISIO Software Factory V2 is an operational control plane, not a static dashboard.

## Product register

- Primary job: move an authenticated operator from intent to verified release.
- Primary surface: command center with visible authentication, next actions and pipeline state.
- Interaction language: active verbs — Create, Insert, Update, Continue, Run, Repair, Validate, Go-live.
- Every major operation must have an obvious destination and recovery path.

## Visual direction

The interface uses a dark industrial control-room register: restrained navy-black surfaces, cool indigo as the navigation/action accent, and mint only for verified/healthy states. The signature element is the seven-stage factory rail, which makes the pipeline itself the visual identity rather than decorative dashboard chrome.

Palette anchors:
- Void: #060A12
- Surface: #0A101B
- Raised: #0E1626
- Rule: #22304A
- Indigo: #7F8FFF
- Verified: #62E0A8
- Primary text: #EDF2FF
- Secondary text: #8997B0

Typography: system sans for dependable rendering, with tight display tracking for the command headline and compact uppercase utility labels for machine/state information.

## Behavior contract

- Authentication controls remain visible in the global command area.
- Create and Insert are primary actions; Update / Continue and Next are explicit operator actions, not implied by prose.
- Pipeline stages expose current position and destination.
- Clickable elements have visible hover/focus states and remain usable on narrow screens.
- Mobile preserves the command-first hierarchy rather than hiding operational controls behind a decorative landing layout.

Principles: observable workflows, explicit states, accessible interactions, responsive layouts, honest failure handling, and strict isolation from ADTRAN Realindo.
