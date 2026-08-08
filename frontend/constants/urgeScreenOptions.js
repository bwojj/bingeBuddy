// Shared across panic.jsx (browse-all hub) and index.jsx (default-urge-screen
// picker) so the 4 urge-support tools stay in sync in one place.
export const URGE_SCREEN_OPTIONS = [
  { key: 'mental_frameworks', label: 'Mental Frameworks', icon: 'layers-outline', route: '/mental-frameworks' },
  { key: 'actions', label: 'Actions to Take', icon: 'checkmark-done-outline', route: '/actions-to-take' },
  { key: 'coach', label: 'Talk to AI Coach', icon: 'chatbubble-ellipses-outline', route: '/urge-coach' },
  { key: 'audio', label: 'Listen to Audio Recording', icon: 'play-circle-outline', route: '/listen-recording' },
];

// Module-level (not React state) since it just needs to survive router
// navigations within one urge episode, not trigger re-renders on its own —
// each tool screen reads/writes it directly on mount / on "Try another".
let visitedMethods = new Set();

// Called once per urge episode (when the user taps "Feeling an urge?" on the
// home screen) so a new episode isn't influenced by the last one.
export function resetUrgeSession() {
  visitedMethods = new Set();
}

export function markUrgeMethodVisited(key) {
  visitedMethods.add(key);
}

// Used by each tool page's "Try another" link — picks a random tool that
// isn't the one the user is already on AND hasn't been visited yet this
// episode. Returns null once every method has been tried, so the caller can
// route to the "Urge Surfing" fallback screen instead.
export function pickAnotherUrgeScreen(currentKey) {
  const unvisited = URGE_SCREEN_OPTIONS.filter(
    (opt) => opt.key !== currentKey && !visitedMethods.has(opt.key)
  );
  if (unvisited.length === 0) return null;
  return unvisited[Math.floor(Math.random() * unvisited.length)];
}

export function getUrgeScreenRoute(key) {
  return URGE_SCREEN_OPTIONS.find((opt) => opt.key === key)?.route;
}
