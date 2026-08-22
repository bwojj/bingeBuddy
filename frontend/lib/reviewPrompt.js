import * as StoreReview from 'expo-store-review';
import * as SecureStore from 'expo-secure-store';
import { Linking, Platform } from 'react-native';



export const REVIEW_PROMPT_STATE_KEY = 'review_prompt_state';
export const REVIEW_PROBABILITY = 0.15;
export const MAX_ASKS = 3;
export const MIN_DAYS_BETWEEN_ASKS = 60;


const IOS_APP_STORE_ID = 'TODO_APP_STORE_ID';
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
