import { Platform } from 'react-native';

// Deep-plum design tokens — see frontend/design_handoff_mbb_redesign/README.md
export const Colors = {
  plum: '#5B2E6B',
  plumDeep: '#3C1C49',
  plum700: '#4A2557',
  plumSoft: '#8A6B93',
  plumTint: '#EFE8F1',
  plumTint2: '#F7F3F8',

  ink: '#251826',
  inkSoft: '#6A5C70',
  inkFaint: '#9C90A1',

  bg: '#F5F1F6',
  surface: '#FFFFFF',
  line: '#ECE5EE',

  sage: '#4E7C5E',
  sageTint: '#E9F0EB',

  alert: '#B23A36',
  alertTint: '#F7E9E8',
  alertDeep: '#7C2723',

  gold: '#B08A53',

  amber: '#B26B2E',
  amberTint: '#F6ECE1',

  blue: '#3A6491',
  blueTint: '#E6EEF6',

  white: '#FFFFFF',
};

// expo-linear-gradient uses start/end {x,y} points rather than a CSS angle.
// Converted from mbb.css's `linear-gradient(<deg>, ...)` via:
//   x2 = 0.5 + 0.5*sin(rad), y2 = 0.5 - 0.5*cos(rad), x1 = 1-x2, y1 = 1-y2
export const Gradients = {
  hero: { colors: [Colors.plum, Colors.plumDeep], start: { x: 0.305, y: 0.04 }, end: { x: 0.695, y: 0.96 } }, // 157deg
  sos: { colors: [Colors.alert, Colors.alertDeep], start: { x: 0.305, y: 0.04 }, end: { x: 0.695, y: 0.96 } }, // 157deg
  logo: { colors: [Colors.plum, Colors.plumDeep], start: { x: 0.25, y: 0.07 }, end: { x: 0.75, y: 0.93 } }, // 150deg
};

export const FontFamily = {
  serifRegular: 'Spectral_400Regular',
  serifMedium: 'Spectral_500Medium',
  serifSemibold: 'Spectral_600SemiBold',
  serifItalic: 'Spectral_400Regular_Italic',
  serifItalicMedium: 'Spectral_500Medium_Italic',

  sansRegular: 'HankenGrotesk_400Regular',
  sansMedium: 'HankenGrotesk_500Medium',
  sansSemibold: 'HankenGrotesk_600SemiBold',
  sansBold: 'HankenGrotesk_700Bold',
  sansExtrabold: 'HankenGrotesk_800ExtraBold',
};

export const FontSize = {
  statHuge: 62,
  dashboardStat: 54,
  heroTitle: 26,
  flowTitle: 34,
  authTitle: 29,
  hTitle: 28,
  topbarTitle: 20,
  jentryTitle: 18,
  cardTitle: 16,
  body: 15.5,
  bodyMd: 14.5,
  secondary: 13.5,
  secondarySm: 13,
  eyebrow: 12.5,
  eyebrowSm: 11,
};

export const Radii = {
  card: 18,
  btn: 14,
  lg: 26,
  pill: 30,
};

export const Spacing = {
  screenH: 22,
  screenTop: 18,
  screenBottomClearance: 120,
  cardPadding: 18,
};

// mbb.css stacks two box-shadow layers; RN only supports one shadow on iOS and
// `elevation` (no offset/blur/color control) on Android, so this approximates
// each token's felt depth rather than reproducing the stack exactly.
export const Shadows = Platform.select({
  ios: {
    card: { shadowColor: Colors.ink, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.05, shadowRadius: 9 },
    soft: { shadowColor: Colors.ink, shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 1.5 },
    pop: { shadowColor: Colors.ink, shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.12, shadowRadius: 15 },
  },
  android: {
    card: { elevation: 3 },
    soft: { elevation: 2 },
    pop: { elevation: 8 },
  },
  default: { card: {}, soft: {}, pop: {} },
});
