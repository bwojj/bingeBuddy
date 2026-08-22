
export const URGE_SCREEN_OPTIONS = [
  { key: 'mental_frameworks', label: 'Mental Frameworks', icon: 'layers-outline', route: '/mental-frameworks' },
  { key: 'actions', label: 'Actions to Take', icon: 'checkmark-done-outline', route: '/actions-to-take' },
  { key: 'coach', label: 'Talk to AI Coach', icon: 'chatbubble-ellipses-outline', route: '/urge-coach' },
  { key: 'audio', label: 'Listen to Audio Recording', icon: 'play-circle-outline', route: '/listen-recording' },
];


let visitedMethods = new Set();


export function resetUrgeSession() {
  visitedMethods = new Set();
}

export function markUrgeMethodVisited(key) {
  visitedMethods.add(key);
}


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
