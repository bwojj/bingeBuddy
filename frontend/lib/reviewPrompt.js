import * as StoreReview from 'expo-store-review';
import * as SecureStore from 'expo-secure-store';
import { Linking, Platform } from 'react-native';

// Trigger logic for the native App Store / Play Store review prompt.
//
// Call `maybeRequestReview()` once, right after an urge is successfully
// logged as defeated. It decides whether to *attempt* a prompt, then only
// actually calls the native `requestReview()` if the platform reports the
// action is available:
//   1. Track { defeatedCount, timesAsked, lastAskedAt } in SecureStore.
//   2. On the first ever defeated urge, always attempt.
//   3. On every later defeated urge, attempt with REVIEW_PROBABILITY odds.
//   4. Never attempt if timesAsked >= MAX_ASKS, or if we last asked less
//      than MIN_DAYS_BETWEEN_ASKS days ago.
//   5. `timesAsked` / `lastAskedAt` are only updated when requestReview()
//      is actually invoked, not on every attempt.
// The native prompt is itself rate-limited by the OS and may silently no-op
// even when we do call it — that's expected and is never retried here.
// Every exported function swallows its own errors so a failure here can
// never break the urge-logging flow that triggers it.

export const REVIEW_PROMPT_STATE_KEY = 'review_prompt_state';
export const REVIEW_PROBABILITY = 0.15;
export const MAX_ASKS = 3;
export const MIN_DAYS_BETWEEN_ASKS = 60;

// TODO: fill in with the numeric Apple App Store ID once the app is listed.
const IOS_APP_STORE_ID = 'TODO_APP_STORE_ID';
// TODO: com.anonymous.frontend looks like a placeholder — confirm this matches
// the real Play Store listing (iOS bundle id is com.pixacor.mybingebuddy).
const ANDROID_PACKAGE_NAME = 'com.anonymous.frontend';

const DEFAULT_STATE = { defeatedCount: 0, timesAsked: 0, lastAskedAt: null };

async function getState() {
  try {
    const raw = await SecureStore.getItemAsync(REVIEW_PROMPT_STATE_KEY);
    if (!raw) return { ...DEFAULT_STATE };
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_STATE, ...parsed };
  } catch (error) {
    console.log('Failed to read review prompt state', error);
    return { ...DEFAULT_STATE };
  }
}

async function saveState(state) {
  try {
    await SecureStore.setItemAsync(REVIEW_PROMPT_STATE_KEY, JSON.stringify(state));
  } catch (error) {
    console.log('Failed to save review prompt state', error);
  }
}

function daysSince(isoString) {
  const then = new Date(isoString).getTime();
  if (Number.isNaN(then)) return Infinity;
  return (Date.now() - then) / (1000 * 60 * 60 * 24);
}

export async function maybeRequestReview() {
  try {
    const state = await getState();
    state.defeatedCount += 1;
    await saveState(state);

    const isFirstDefeat = state.defeatedCount === 1;
    const shouldAttempt = isFirstDefeat || Math.random() < REVIEW_PROBABILITY;
    if (!shouldAttempt) return;

    if (state.timesAsked >= MAX_ASKS) return;
    if (state.lastAskedAt && daysSince(state.lastAskedAt) < MIN_DAYS_BETWEEN_ASKS) return;

    const canAsk = await StoreReview.hasAction();
    if (!canAsk) return;

    await StoreReview.requestReview();

    state.timesAsked += 1;
    state.lastAskedAt = new Date().toISOString();
    await saveState(state);
  } catch (error) {
    console.log('Failed to request store review', error);
  }
}

export async function rateAppManually() {
  try {
    const url =
      Platform.OS === 'ios'
        ? `itms-apps://itunes.apple.com/app/id${IOS_APP_STORE_ID}?action=write-review`
        : `market://details?id=${ANDROID_PACKAGE_NAME}`;
    const fallbackUrl =
      Platform.OS === 'ios'
        ? `https://apps.apple.com/app/id${IOS_APP_STORE_ID}`
        : `https://play.google.com/store/apps/details?id=${ANDROID_PACKAGE_NAME}`;

    const canOpen = await Linking.canOpenURL(url);
    await Linking.openURL(canOpen ? url : fallbackUrl);
  } catch (error) {
    console.log('Failed to open store review page', error);
  }
}
