import * as Notifications from 'expo-notifications';

// On-device daily habit-reminder notification. Scheduled and fired entirely
// by the OS -- no backend push infrastructure involved. The chosen
// time/enabled flag is separately persisted to UserData (see DataAPI.js)
// purely so it can be restored after reinstall/new-device login.

const HABIT_REMINDER_ID = 'habit-reminder';

// Reusing a fixed identifier means re-scheduling always replaces the
// previous notification instead of stacking duplicates.
export async function scheduleHabitReminder(hour, minute) {
  try {
    await Notifications.scheduleNotificationAsync({
      identifier: HABIT_REMINDER_ID,
      content: {
        title: 'Habit Check-In',
        body: 'Time to check in on your habits and track your progress.',
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour,
        minute,
      },
    });
  } catch (error) {
    console.log('Failed to schedule habit reminder', error);
  }
}

export async function cancelHabitReminder() {
  try {
    await Notifications.cancelScheduledNotificationAsync(HABIT_REMINDER_ID);
  } catch (error) {
    console.log('Failed to cancel habit reminder', error);
  }
}

export async function requestNotificationPermissionsAsync() {
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    if (existingStatus === 'granted') return true;
    const { status } = await Notifications.requestPermissionsAsync();
    return status === 'granted';
  } catch (error) {
    console.log('Failed to request notification permissions', error);
    return false;
  }
}

// Called once at app startup so a reminder that fires while the app is open
// still shows a banner instead of being silently suppressed.
export function configureNotificationHandler() {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
}
