# Hyperframes Composition Brief: CitizenPulse BRICS

## Objective
Create a short launch-style brag video for CitizenPulse BRICS.

## Output
- Composition directory: `brag-output/composition/`
- Rendered video: `brag-output/brag.mp4`
- Format: landscape — 1920x1080
- Duration: 20 seconds

## Source Material
- Project root: `c:\Users\srihith reddy\.gemini\antigravity\scratch\skillsphere`
- Primary files read: `README.md`, `frontend/src/index.css`, `frontend/src/pages/CitizenRequestPage.jsx`, `frontend/src/pages/Dashboard_Premium.jsx`, `frontend/src/components/demo/JudgeDemoModal.jsx`
- Product name: CitizenPulse BRICS
- Tagline / strongest claim: "From Citizen Voice to Infrastructure Intelligence"
- Key UI or visual moments to recreate:
  - Cybernetic Dark Command Center (`#07111F`) with glassmorphism glow panels.
  - Multilingual voice signal ingestion card (Telugu voice memo → 99.2% AI neural translation confidence).
  - Explainable 5-Factor Priority Engine Score circular gauge (91/100).
  - Executive Cabinet Policy Brief generator & counterfactual impact simulator (-34% complaints).
- Copy that must appear verbatim:
  - "CitizenPulse BRICS"
  - "From Citizen Voice to Infrastructure Intelligence"
  - "Multilingual AI Signal Ingestion: Telugu (99.2% Conf.)"
  - "Explainable Priority Score: 91 / 100"
  - "Predicted Complaint Reduction: -34%"

## Creative Direction
- Tone preset: `yc-parody`
- Creative direction: "Silicon Valley launch film for a BRICS national infrastructure command center"
- Interpretation: Fast-paced, hyper-confident presentation of public infrastructure AI. Uses dark mode cybernetic glass cards, cyan neon glows, and deadpan startup launch energy.
- Angle: Pitching a national infrastructure AI command center for BRICS governments with the polish and swagger of a Silicon Valley unicorn launch.
- Hook: "14 LANGUAGES. 500k VOICE SIGNALS. ONE AI COMMAND CENTER."
- Outro / punchline: "CitizenPulse BRICS — From Citizen Voice to Infrastructure Intelligence."
- Avoid:
  - Generic SaaS language ("streamline your workflow")
  - Abstract filler graphics
  - Changing the project's signature `#07111F` cyan/purple glass design system

## Visual Identity
- Background: `#07111F`
- Text: `#F8FAFC`
- Accent: `#22D3EE` (Cyan)
- Secondary Accent: `#8B5CF6` (Purple)
- Border Glass: `rgba(34, 211, 238, 0.2)`
- Panel Glass: `rgba(11, 22, 40, 0.85)` with backdrop blur
- Display font: Inter, system-ui, sans-serif
- Body font: Inter, system-ui, sans-serif

## Storyboard
Use the storyboard in `brag-output/brag-plan.md` as the creative contract.

Scene summary:
1. Scene 1 — The Hook (0.0s - 3.5s) — "14 LANGUAGES. 500k VOICE SIGNALS. ONE AI COMMAND CENTER."
2. Scene 2 — Multilingual Ingestion (3.5s - 7.5s) — Voice signal waveform → Telugu AI translation (99.2% Conf.).
3. Scene 3 — AI Priority Engine Score (7.5s - 12.0s) — Score gauge counts 0 → 91/100; 4 weighting bars extend.
4. Scene 4 — Executive Cabinet Policy Brief (12.0s - 16.0s) — Cabinet brief card drops in; impact simulator shows -34%.
5. Scene 5 — Outro Slam (16.0s - 20.0s) — CitizenPulse BRICS logo, tagline, and BRICS hackathon submission badge.

## Audio
- Audio role: Upbeat, steady business-tech bed with clean UI clicks, card entrance thuds, counter ticks, and a resonant logo hit.
- Audio arc: Fast energetic entry → steady rhythmic UI interactions → climax score hit at 12.0s → resonant logo landing at 16.0s.
- Music: `assets/music/happy-beats-business-moves-vol-9-by-ende-dot-app.mp3`
- Music treatment: Starts at 0.0s at volume 0.28, dips slightly during score reveal, fades under final logo.
- Music cue guidance: Preset cue file at `.agents/skills/brag/assets/music/cues/happy-beats-business-moves-vol-9-by-ende-dot-app.music-cues.json`. Lock Scene 2 reveal near 3.70s cue, Scene 3 score count-up lock near 7.92s cue, Scene 4 policy brief drop near 12.65s cue, and final logo slam near 16.34s cue.
- Audio-reactive treatment: Cyan glowing borders and panel background glow breathe subtly with music RMS/bass.
- Audio-coupled moments:
  - Neural text translation typing sounds (keyboard ticks).
  - Score count-up ticker sounds (0 → 91).
  - Resonant bell sound (`impactBell_heavy_000.ogg`) when score 91 lands and logo slams.
- SFX selection:
  - `assets/sfx/impact/impactSoft_medium_001.ogg` for scene transitions.
  - `assets/sfx/interface/drop_001.ogg` for data badge drops.
  - `assets/sfx/impact/impactBell_heavy_000.ogg` for final 91/100 score and logo hit.

## Hyperframes Instructions
Build a standalone single-file Hyperframes HTML composition in `brag-output/composition/index.html`.
Ensure all assets (music, SFX) are copied to `brag-output/composition/assets/`.
Follow seek-safe keyframe animation practices, WCAG contrast standards, and exact timings (20.0s duration total).
Run `npx hyperframes check` in `brag-output/composition/` to validate before rendering.
