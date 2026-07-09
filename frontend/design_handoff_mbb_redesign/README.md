# Handoff: My Binge Buddy — Visual Redesign

## Overview
This package documents a full visual redesign of the My Binge Buddy iOS app (14 screens across onboarding, daily use, and safety/account). The redesign moves the product from a bright, playful purple aesthetic to a deeper, more clinical-grade "plum" palette with a serif/sans type pairing, intended to read as a trustworthy recovery companion rather than a casual lifestyle app.

## About the Design Files
The files in this bundle (`index.html`, `01-onboarding.html`, `02-daily.html`, `03-account.html`, `mbb.css`, `mbb.js`) are **design references built as static HTML/CSS prototypes** — not production code to copy verbatim. They render each screen inside a fake iPhone frame for presentation purposes only (status bar, notch, home indicator — `mbb.js` and the `.phone`/`.island`/`.statusbar`/`.home-ind` CSS). None of that device-chrome should be ported.

**Your task is to recreate these designs in the app's real codebase.** The app is an **Expo (React Native) app using expo-router**, not a website — do not port any HTML/CSS/web DOM. Translate every visual spec below into React Native `StyleSheet.create` styles on the equivalent native components (`View`, `Text`, `TouchableOpacity`, `ScrollView`, etc.), following the patterns already used throughout `frontend/app/`.

## Codebase Map
This is the real screen-by-screen mapping in `frontend/`:

| Design screen | Real file |
|---|---|
| Login | `frontend/app/(auth)/login.jsx` |
| Sign Up | `frontend/app/(auth)/signup.jsx` |
| Main Cause / Trigger | `frontend/app/(auth)/(onboarding)/maincause.jsx` |
| Motivation ("Why") | `frontend/app/(auth)/(onboarding)/motivation.jsx` |
| Dashboard | `frontend/app/(main)/index.jsx` (uses `frontend/app/components/HomeQuoteBox.jsx` and `HomeMotivation.jsx`) |
| Progress | `frontend/app/(main)/progress.jsx` |
| Journal | `frontend/app/(main)/journal.jsx` |
| AI Coach | `frontend/app/(main)/coach.jsx` |
| Emergency Support / SOS | `frontend/app/(main)/panic.jsx` |
| Audio Recording | `frontend/app/(main)/audio-recording.jsx` |
| Settings | `frontend/app/(main)/settings.jsx` |
| Profile Settings | `frontend/app/(main)/profile-settings.jsx` |
| Personalization | `frontend/app/(main)/personalization.jsx` |
| Privacy & Security | `frontend/app/(main)/privacy-security.jsx` |
| Tab bar / SOS button (shared) | `frontend/app/(main)/_layout.jsx` and `tracker.jsx` — confirm exactly where the floating SOS control and bottom tab bar are currently rendered and update that shared spot, not each screen individually |

**Current state of the code:** every screen already exists and is functional — this is a **restyle**, not new construction. All logic (data fetching via `AuthApi.js`/`DataAPI.js`/`JournalAPI.js`/`OnboardingApi.js`/`UrgeAPI.js`, `AuthContext`, navigation) must be left intact. Only `StyleSheet.create` values, JSX structure needed to support the new layout, icon names, and copy/labels should change.

**Color today:** the app currently hardcodes the brand purple as the literal string `'#7e1f8c'` (or `"#7e1f8c"`) directly inside dozens of `StyleSheet.create` calls across every screen — there is no central theme/colors file yet. As part of this redesign, **create one** (e.g. `frontend/constants/theme.js` or `frontend/constants/Colors.js`) exporting the palette in Design Tokens below, then replace every hardcoded `#7e1f8c` (and the few incidental grays like `#888`, `#e8e3ea`, `#f2edf3`) with references to it. This is the single highest-leverage change for this redesign, since it's the one color used everywhere today.

**Fonts:** no custom fonts are loaded today (default RN system font throughout). Add `@expo-google-fonts/spectral` and `@expo-google-fonts/hanken-grotesk` (or `@expo-google-fonts/hanken-grotesk-condensed` variants as needed) via `expo install`, load them with `useFonts` in `frontend/app/_layout.jsx` (gate rendering behind `LoadingScreen` the same way `isAuthenticated === null` is handled today), and apply `fontFamily: 'Spectral_500Medium'` / `'Spectral_400Regular_Italic'` / `'HankenGrotesk_700Bold'` etc. to text styles per the type spec below.

**Icons:** the design mock uses the Lucide web icon set for illustration purposes only. The app already uses `@expo/vector-icons` (`Ionicons` and `MaterialCommunityIcons`) everywhere — **keep using those**, do not add Lucide. Map each Lucide name used in the HTML to the closest Ionicons/MaterialCommunityIcons equivalent (e.g. `life-buoy` → `Ionicons "help-buoy"` or `"life-buoy"` if available in the installed version, `trophy` → `MaterialCommunityIcons "trophy"` (already used), `bar-chart-3` → `Ionicons "bar-chart"`, `book-open` → `Ionicons "book-outline"`, `sparkles` → `Ionicons "sparkles"` (already used), `bot` → `Ionicons "chatbubble-ellipses"` (already used in coach.jsx), `mic` → `Ionicons "mic"`/`"mic-outline"` (already used), `shield-check` → `Ionicons "shield-checkmark"`). Verify each against the installed `@expo/vector-icons` version's icon set before committing to a name.

## Fidelity
**High-fidelity.** Colors, type, spacing, radii, and shadows below are final values taken directly from the CSS. Implement pixel-accurately where the target platform allows; adapt only where a platform convention requires it (e.g. native iOS navigation bars vs. the custom `.topbar`/`.hero` header treatment shown here).

## Design Tokens

### Colors
- `--plum`: `#5B2E6B` — primary brand / buttons / active states
- `--plum-deep`: `#3C1C49` — gradient partner for header/logo (used as `linear-gradient(157deg, #5B2E6B 0%, #3C1C49 100%)`)
- `--plum-700`: `#4A2557`
- `--plum-soft`: `#8A6B93` — secondary plum text (eyebrows on white)
- `--plum-tint`: `#EFE8F1` — icon chip fills, selected-option fills
- `--plum-tint-2`: `#F7F3F8` — faint fills, textarea backgrounds
- `--ink`: `#251826` — primary text
- `--ink-soft`: `#6A5C70` — secondary text
- `--ink-faint`: `#9C90A1` — tertiary text / disabled
- `--bg`: `#F5F1F6` — app background
- `--surface`: `#FFFFFF` — card background
- `--line`: `#ECE5EE` — hairline dividers/borders
- `--sage`: `#4E7C5E` / `--sage-tint`: `#E9F0EB` — success / victory
- `--alert`: `#B23A36` / `--alert-tint`: `#F7E9E8` — destructive / SOS
- `--gold`: `#B08A53` — quiet brass, used for milestone/lock icons
- `--amber`: `#B26B2E` / `--amber-tint`: `#F6ECE1` — "struggle" journal tag

### Typography
- Headings/serif: **Spectral** (weights 400/500/600, italic 400/500) — `font-family: 'Spectral', Georgia, serif`
- UI/sans: **Hanken Grotesk** (weights 400/500/600/700/800) — `font-family: 'Hanken Grotesk', system-ui, -apple-system, sans-serif`
- Both loaded via Google Fonts in the prototype; substitute with the native/platform equivalents if these fonts aren't licensed for the app, or bundle the actual font files.
- Scale in use: 62px (big stat number), 52px (hero title), 34px (flow title), 28–29px (auth/section h1), 26px (h-title), 20–21px (topbar h1), 18px (jentry h4), 16px (card-title), 14.5–15.5px (body/buttons), 13–13.5px (secondary text), 11–12.5px (eyebrows/labels/badges, uppercase, letter-spacing .12–.18em).

### Spacing & Shape
- Card radius: 18px (`--r-card`), large panel radius: 26px (`--r-lg`), button radius: 14px (`--r-btn`), pill buttons: 30px.
- Standard card padding: 18px. Screen body padding: 18px 22px 120px (leaves room for tab bar).
- Shadows: `--sh-card: 0 1px 2px rgba(37,24,38,.04), 0 6px 18px rgba(37,24,38,.05)`; `--sh-soft: 0 1px 3px rgba(37,24,38,.05)`; `--sh-pop: 0 10px 30px rgba(37,24,38,.12)`.

### Brand Mark
A monoline "wink" face (closed winking eyebrow + open eye + smiling mouth) in cream (`#F2E7D5`) on a rounded-square plum gradient tile (`linear-gradient(150deg, #5B2E6B, #3C1C49)`). Standard tile: 44×44px, radius 13px; large: 76×76px, radius 22px. See `assets/logo-icon-transparent.png` (512×512, transparent background) for a raster export, and `Logo.html` for lockups (icon-only, stacked, horizontal, on plum/white, and small sizes).

## Screens / Views

### 1. Login (`01-onboarding.html`)
- White background, large centered logo mark (76px), serif "Welcome back" (29px), muted subhead.
- Two inputs (username, password w/ eye-toggle icon), right-aligned "Forgot password?" in plum.
- Full-width primary button (plum, 14px radius, arrow-right icon), footer link to Sign Up.

### 2. Sign Up — Step 1 of 3
- Back chevron + "STEP 1 OF 3" eyebrow + thin progress track (33% filled, plum fill on `--line` track).
- Serif h1 "Create your account" + supporting copy.
- Italic serif pull-quote in a tinted card (`--plum-tint-2` bg, 1px `--line` border, 15px radius) with an oversized serif quotation mark in `--plum-soft`.
- 3 inputs (name, email, password), a checked checkbox row for terms, full-width primary button "Continue" (no icon).

### 3. Main Cause / Trigger — Step 2 of 3
- Progress track 66%. Serif h1 with the trigger name colored plum inline.
- 4 selectable option cards (`.opt`): icon chip (44px, 13px radius, neutral gray `#F1EFF2`/`--ink-soft` by default), title + description, all in a bordered white card (1.5px `--line`).
- Selected state (`.opt--sel`): border becomes plum, background `--plum-tint-2`, icon chip becomes `--plum-tint`/`--plum`, title turns plum, and a filled check-circle icon appears at the right.
- "Next" primary button; "I'm not sure yet" plum text link below, centered.

### 4. Motivation ("Your Why") — Step 3 of 3, 100%
- Circular plum-tint icon badge (64px) with a heart icon, centered serif h1 "What's your 'why'?" and subhead.
- Labeled textarea (uppercase plum label "MY WHY") with placeholder copy.
- Photo picker placeholder: dashed/striped diagonal pattern background (`repeating-linear-gradient(135deg, #efeaf1 0 11px, #e9e2ec 11px 22px)`), centered white circular camera icon (58px) + "Tap to add a photo" + helper text.
- Pill-shaped primary button "Finish" with check icon; small footnote below.

### 5. Dashboard (`02-daily.html`)
- Deep-plum gradient header (`.hero--tall`, rounded bottom corners 28px) containing serif greeting "Good morning, Alex" (26px), date subtext, and a translucent bell icon button (top right).
- A white card overlaps the header by -30px margin, containing an italicized serif daily-inspiration quote with a sparkle icon + "Daily Inspiration" eyebrow, attribution right-aligned.
- "Motivation" section: photo placeholder (158px tall) with a bottom gradient scrim, "motivation photo" label chip top-left, "Edit" pill top-right, and overlaid serif caption bottom-left ("My Why: Being present for my kids").
- "Progress Snapshot" card: centered trophy icon (34px, **plum** color — not gold) + huge serif number (54px, plum) side by side, uppercase eyebrow "URGES DEFEATED" below, then a muted helper line.
- "Latest Journal Entry" card: title + colored tag badge, 2-line excerpt, plum "View Journal →" link.
- Floating SOS control (bottom-right, above the tab bar): 58×58px **rounded-square** (19px radius — matches card/button radius language, not a circle), gradient fill `linear-gradient(157deg, var(--alert) 0%, #7C2723 100%)`, life-buoy icon + "SOS" label stacked, `--sh-pop` shadow plus a subtle 1px inset white highlight ring. This shape/color was deliberately tuned to still stand out (saturated alert red, elevated shadow, always-visible position) while matching the app's rounded-square/gradient-tile visual language instead of a bright circular FAB.
- Bottom tab bar: 4 items (Dashboard/Progress/Journal/Settings), active tab tinted plum, translucent blurred white background.

### 6. Progress
- Plum header (shorter) with back chevron, centered serif title "Progress History", and a big centered stat block: 62px serif number, uppercase label, italic serif subtext — all in white on plum.
- "Urges Beat" card: 7-column bar chart (day initials M–S), each bar showing a count above it; today's bar highlighted in solid plum, others in a lighter plum-gray (`#D8C7DE`).
- "Recovery Milestones": 3 stacked cards — achieved (sage circular icon + check), in-progress (plum-tint flag icon + inline progress track + "12/25" counter), locked (gray lock icon, muted text, disabled lock icon at right).
- Two side-by-side stat cards (Money Saved $180, Time Gained 24h) with plum icon + serif number + uppercase eyebrow.

### 7. Journal
- Plum header with title + search icon; horizontal scrollable filter chips (ghost style on plum, active chip is solid white/plum text).
- Dark plum "New Reflection" button (not the lighter primary plum) with plus-circle icon.
- Entry cards: date eyebrow + overflow menu, serif h4 title, 2–3 line body copy, and a colored tag badge (plum=Reflection, sage=Victory, amber=Struggle) + timestamp.

### 8. AI Coach
- Standard white topbar (not the plum hero) with back chevron, circular plum-gradient bot avatar, coach name + green "online" dot + uppercase status text, overflow icon.
- Chat log: date divider ("TODAY" between two hairlines), AI messages left-aligned with small avatar + white bubble (rounded 16px, flat bottom-left corner), user messages right-aligned with solid plum bubble (flat bottom-right corner), timestamps below each bubble in faint ink.
- Suggested-reply chips (outline-active style) below the latest AI message.
- Fixed bottom composer: plus button (plum-tint circle), pill-shaped text field placeholder, plum circular send button.

### 9. Emergency Support / SOS (`03-account.html`)
- White topbar with a surfaced (shadowed) close (X) button left, centered "Emergency Support" title, no header color — deliberately the calmest, plainest screen in the app.
- "Play My Audio Message" action tile (headphones icon in plum-tint chip, label below, centered, card styling).
- "5 Steps to Reset" checklist card: check-circle header icon + title, 5 rows with round checkboxes — first two marked done (filled plum, strikethrough-style faint text optional), remaining unchecked.
- "Open Journal" action tile (same style as audio tile).
- Full-width primary button "I Have Beaten the Urge" with trophy icon — the single affirmative call to action.

### 10. Audio Recording
- Plum header, back chevron, centered title.
- "Saved Recording" card: mic icon chip, title/subtitle, plum play button + alert-red delete button (both circular icon buttons).
- "Recording Guidance" card: mic icon + title, paragraph, then 3 plum-dot bullet list items.
- "Recording" card: gray idle dot + large tabular-numeral serif timer ("00:00"), full-width primary button "Start Recording" with mic icon.

### 11. Settings
- Plain white background, serif "Settings" h-title (28px) with no header band.
- Profile summary card: circular plum-tint avatar chip (52px) + name/email.
- "ACCOUNT" list: 4 rows, each with a colored icon chip (plum/sage/plum/alert), label, and chevron.
- "SESSION" list: single "Sign Out" row in alert red.
- Same floating SOS + tab bar as other main-loop screens (Settings tab active).

### 12. Profile Settings
- Plum header, back chevron, centered title "Profile Settings".
- "Personal Info" card: 2 stacked read-only fields (First Name, Email) separated by a 1px hairline divider, each with a small label above the value.
- "Change Password" card: 3 stacked fields (current/new/confirm), same divider pattern, placeholder text in faint ink.
- Full-width primary "Save Changes" button.
- "DANGER ZONE" label + outlined danger-ghost button "Delete Account" (white bg, alert-red border+text).

### 13. Personalization
- Plum header, back chevron, centered title.
- 4 labeled sections, each with a small plum icon + uppercase section label: Motivation Photo (same striped placeholder + camera picker as onboarding), My Why (card with helper text + textarea), Main Trigger (2 selectable `.opt` cards, first selected), My Motivations (card with helper text + wrapped chip multi-select, one active chip with icon).
- Pill-shaped primary "Save Changes" button with check icon.

### 14. Privacy & Security
- Plum header, back chevron, centered title.
- "How We Protect You" card: 3 rows (Data Encryption/sage icon, Private by Default/plum icon, Secure Token Storage/blue icon), each icon + bold label + description line, separated by dividers indented to align under the text (not full-width).
- "Your Rights" card: same row pattern (Right to Access/blue, Right to Deletion/alert).
- "Manage Data" list: single "Delete My Account" row in alert red with chevron.

## Interactions & Behavior
These are static prototypes — no real interactivity was implemented beyond device-frame chrome. Expected behavior to implement:
- **Navigation**: bottom tab bar (Dashboard/Progress/Journal/Settings) switches between the 4 daily-use screens; SOS button navigates to the Emergency Support screen from anywhere it appears; back chevrons return to the previous screen; the onboarding flow is a linear 3-step wizard (progress track fills 33% → 66% → 100%) with back navigation via the chevron.
- **Selection states**: trigger options (`.opt`), chips (`.chip`), and checkboxes (`.cbox`) all have a clear selected/checked visual state (see Design Tokens/Screens above for exact styling) — implement as controlled selection state, single-select for triggers, multi-select for motivations, radio-like for journal filter chips.
- **5 Steps to Reset checklist**: rows appear tappable to toggle done/not-done (first 2 shown pre-completed in the mock).
- **Audio recording**: "Start Recording" button should trigger a real recording flow with a live timer (mock shows static `00:00`); saved recordings get play/delete actions.
- **AI Coach**: chat input + suggested-reply chips should be wired to real message sending; this mock only shows a static conversation.
- **Forms**: Login, Sign Up, Profile Settings, Personalization inputs need real validation and submission — the mock shows only filled example states, not empty/error states. Ask the design owner for empty-state, error-state, and loading-state treatments if the target framework needs them; none were designed here.
- **Transitions**: none specified/animated in the mock; use whatever transition conventions the existing app already has (e.g. standard push/modal transitions for iOS).

## Assets
- Brand mark: `assets/logo-icon-transparent.png` (512×512 PNG, transparent background) and `assets/logo-icon-transparent-128.png` (128×128). `frontend/assets/images/` already has `icon.png`, `android-icon-*.png`, `splash-icon.png`, etc. — regenerate those app-icon/splash assets from this new mark (same sizes/shapes each currently uses) rather than only dropping the new PNG in unused.
- Icons: see the Ionicons/MaterialCommunityIcons mapping guidance above — do not add the Lucide set to the app.
- Photo/image placeholders (motivation photo, dashboard photo) are diagonal-stripe CSS placeholders in the mock — the real app already has working image-picker flows (`expo-image-picker`, `HomeMotivation.jsx`) for these; just restyle the existing placeholder/empty states to match (striped background, centered camera icon + helper copy), don't rebuild the upload logic.

## Files
- `index.html` — design system overview page (palette, type, principles) + navigation to the 3 flows. Reference only; not a real app screen.
- `01-onboarding.html` — Screens 1–4 (Login, Sign Up, Trigger, Motivation).
- `02-daily.html` — Screens 5–8 (Dashboard, Progress, Journal, AI Coach).
- `03-account.html` — Screens 9–14 (SOS, Audio Recording, Settings, Profile Settings, Personalization, Privacy & Security).
- `mbb.css` — all design tokens (`:root` variables) and component styles referenced above.
- `mbb.js` — device-frame chrome only (status bar icons, notch, home indicator) — **not needed in the real app**, iOS/RN provide this natively.
- `Logo.html` — brand mark lockups (icon, stacked, horizontal, small sizes) for reference.
- `assets/` — transparent-background logo exports.
