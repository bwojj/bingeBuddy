# Addendum: My Plan + Meditation

New feature added on top of the base redesign in `README.md`. Read that file first for tokens/fonts/icon-mapping rules — this addendum only covers the two new screens.

## Codebase Map (additions)

| Design screen | Real file (new) |
|---|---|
| My Plan (5th tab) | `frontend/app/(main)/my-plan.jsx` |
| Meditation session | `frontend/app/(main)/meditation.jsx` |
| Tab bar (shared) | update `frontend/app/(main)/_layout.jsx` / wherever the 4-tab bar currently renders — add a 5th tab, do not duplicate it per-screen |

Source reference: `redesign/02-daily.html`, frames labeled "My Plan" and "Meditation" (and `redesign/mbb.css` classes `.habit-card`, `.habit-week`, `.wd`, `.suggest-card`, `.ring-wrap`, `.playbtn`).

## My Plan screen
- Plain plum hero (not the tall variant): serif "My Plan" h1, subtext "X of Y habits done today", flame icon button top-right — same hero pattern as Dashboard, just shorter.
- Below it, a plain (non-overlapping) white card: centered "Consistency" eyebrow, flame icon + large serif streak number (44px, plum), "DAY STREAK" eyebrow, muted "Best streak: N days" line.
- "Today's Habits" section: one card per default habit (Meditation, Exercise, Journaling, Recovery Check-in). Each card: a checkbox (checked/unchecked), a tinted icon chip, habit name, and a per-habit streak line with a small flame icon ("5 day streak" — gold/brass color, or faint ink-soft when not yet done today). Below a hairline divider, a 7-dot week strip (M–S), filled plum dots for completed days, today's dot gets a plum outline ring.
- "Suggested By Your Coach" section: a dashed-border, tinted card — sparkles icon + "Based on your journal" eyebrow, the suggested habit (icon + name + one-line rationale pulled from journal/chat activity), and two actions: primary "Add to Plan" / ghost "Not now". This is the AI-detected-habit surface: suggest first, only added to the tracked list on approval.
- "Meditate" is its own full-width plum-gradient card at the very bottom of the scroll (not a floating button) — icon chip, "Meditate" label, one-line subtext, chevron. Tapping it navigates to the Meditation screen.
- Same tab bar as every main-loop screen, now 5 items: Dashboard / Progress / Journal / **My Plan** / Settings. No SOS button on this screen.

## Meditation screen
- Plain white topbar (not a plum hero): surfaced back button, centered serif "Meditation" title, no trailing action. No tab bar — this is a pushed/focused screen, not a tab destination.
- Duration picker: a centered row of pill chips — 3 / 5 / 10 / 20 min — active chip solid plum, others outlined (reuse `.chip` / `.chip--active`).
- Centered circular progress ring (~216px): plum stroke over a light track, time remaining in large serif digits, "REMAINING" uppercase label beneath. Below the ring, a single circular plum play/pause button, and a one-line breathing cue in muted ink italics-free text.
- A closing card: flame icon + "N day meditation streak" + a soft muted nudge line ("Consistency builds calm — same time tomorrow?").

## Data model (new)
No existing API covers habits. Suggest a `HabitAPI.js` alongside the existing `UrgeAPI.js`/`JournalAPI.js` pattern, backing:
- `habits`: list of `{ id, name, icon, kind: 'default' | 'ai_suggested', streak, weekCompletion: bool[7], doneToday }`
- `suggestions`: AI-proposed habits pending approval (kind stays `ai_suggested` until the user taps "Add to Plan", at which point it's promoted into `habits`)
- `meditationSessions`: `{ durationMinutes, completedAt }` for streak calculation, reusing the same streak logic already used for urge/journal streaks if one exists.

If the backend has no habit endpoints yet, stub `HabitAPI.js` with local mock data behind the same call shape as the other API modules, so the UI is real and swapping in a live endpoint later is a one-file change.

## Interactions
- Checkbox tap on a habit row toggles done-for-today, updates the week strip's today dot, and increments/resets that habit's streak.
- "Add to Plan" moves a suggested habit into the tracked list (persisted); "Not now" dismisses it for the session.
- Meditate card → push to Meditation screen. Duration chip selection resets the ring/timer to that length. Play/pause toggles the timer; on completion, increment the meditation streak and (optionally) mark the "Meditation" habit row done-for-today back on My Plan.
