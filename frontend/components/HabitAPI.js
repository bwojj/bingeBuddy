// GET /api/habits/ (backend/bingeBuddyAPI/views.py, UserHabitsView) is the
// single source of truth for which habits a user tracks — defaults included.
// The backend seeds the default habits (Meditation, Exercise, Journaling),
// scheduled every day, into a user's UserHabits row the first time it's ever
// touched; everything after that (defaults + anything added via "Add a
// Habit") lives in that same { "Habit Name": { "Days": [...] } } dict.
// Completion tracking (streak/weekCompletion/doneToday) has no backend
// support yet, so it's layered on in-memory here once a habit is loaded —
// state resets on app reload.
import { getToken } from './authStorage';

const BASEURL = process.env.EXPO_PUBLIC_API_URL;

const DAY_ABBR = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const todayIdx = () => (new Date().getDay() + 6) % 7; // Mon=0 ... Sun=6

const DEFAULT_ICONS = {
  'Meditation': 'meditation',
  'Exercise': 'exercise',
  'Journaling': 'journaling',
  'Recovery Check-in': 'checkin',
};
const slugify = (name) => name.toLowerCase().replace(/\s+/g, '-');

// Starts blank for every user — no fabricated history. Streaks/week dots only
// fill in as the user actually checks habits off.
const BLANK_WEEK = [false, false, false, false, false, false, false];

let habits = [];

// Local-calendar-day helpers (never UTC — a habit "day" is the user's own
// midnight-to-midnight, not the server's or GMT's).
function localDateStr(d = new Date()) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function yesterdayStr(todayStr) {
  const [y, m, d] = todayStr.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  date.setDate(date.getDate() - 1);
  return localDateStr(date);
}

// Un-checks doneToday once local midnight has passed, and breaks the streak
// if a full day (or more) was skipped since the habit was last completed.
function rolloverHabit(habit) {
  const today = localDateStr();
  if (habit.lastCompletedDate && habit.lastCompletedDate !== today && habit.lastCompletedDate !== yesterdayStr(today)) {
    habit.streak = 0;
  }
  if (habit.doneToday && habit.lastCompletedDate !== today) {
    habit.doneToday = false;
  }
}

function rolloverAll() {
  habits.forEach(rolloverHabit);
}

function markHabit(habit, done) {
  if (habit.doneToday === done) return;
  habit.doneToday = done;
  habit.streak = done ? habit.streak + 1 : Math.max(0, habit.streak - 1);
  habit.bestStreak = Math.max(habit.bestStreak, habit.streak);
  habit.weekCompletion = habit.weekCompletion.map((v, i) => (i === todayIdx() ? done : v));
  habit.lastCompletedDate = done ? localDateStr() : null;
}

const clone = (data) => JSON.parse(JSON.stringify(data));

function mergeBackendHabits(backendHabitsDict) {
  Object.entries(backendHabitsDict || {}).forEach(([name, meta]) => {
    const id = slugify(name);
    const days = meta?.Days ?? [];
    // Falls back to the end of the list -- Postgres's jsonb type doesn't
    // preserve object key order, so `order` is the only reliable sequence.
    const order = meta?.order ?? 9999;
    const existing = habits.find((h) => h.id === id);
    if (existing) {
      existing.days = days;
      existing.name = name;
      existing.order = order;
    } else {
      habits.push({
        id,
        name,
        icon: DEFAULT_ICONS[name] || 'custom',
        days,
        order,
        streak: 0,
        bestStreak: 0,
        weekCompletion: [...BLANK_WEEK],
        doneToday: false,
        lastCompletedDate: null,
      });
    }
  });
}

async function fetchBackendHabits() {
  const token = await getToken();
  try {
    const response = await fetch(`${BASEURL}/api/habits/`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : '',
      },
      credentials: 'include',
    });
    if (!response.ok) return {};
    const data = await response.json();
    const row = Array.isArray(data) ? data[0] : data;
    return row?.habits ?? {};
  } catch (error) {
    console.log('Failed to fetch custom habits', error);
    return {};
  }
}

export const getHabits = async () => {
  mergeBackendHabits(await fetchBackendHabits());
  rolloverAll();
  const todayAbbr = DAY_ABBR[todayIdx()];
  return clone(
    habits
      .filter((h) => h.days.includes(todayAbbr))
      .sort((a, b) => a.order - b.order)
  );
};

// `icon` is one of the ICON_CHOICES keys from my-plan.jsx's icon picker — the
// backend habits dict has no concept of icons, so it's attached client-side,
// after the merge, by matching on name. It lives only in this module's
// in-memory `habits` array (see file-top note), so it resets on app reload.
export const addCustomHabit = async (name, days, icon) => {
  const token = await getToken();
  try {
    const response = await fetch(`${BASEURL}/api/add-to-habits`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : '',
      },
      credentials: 'include',
      body: JSON.stringify({ new_habit: name, days }),
    });
    if (!response.ok) return false;
    const data = await response.json();
    mergeBackendHabits(data.habits);
    if (icon) {
      const habit = habits.find((h) => h.name.toLowerCase() === name.trim().toLowerCase());
      if (habit) habit.icon = icon;
    }
    return true;
  } catch (error) {
    console.log('Failed to add habit', error);
    return false;
  }
};

export const deleteHabit = async (name) => {
  const token = await getToken();
  try {
    const response = await fetch(`${BASEURL}/api/delete-habit`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : '',
      },
      credentials: 'include',
      body: JSON.stringify({ habit_to_delete: name }),
    });
    if (!response.ok) return false;
    habits = habits.filter((h) => h.name !== name);
    return true;
  } catch (error) {
    console.log('Failed to delete habit', error);
    return false;
  }
};

// Fire-and-forget sync to the backend history that powers "View All Days" --
// an idempotent "set" of that day's completion state, not a blind toggle, so
// it can't drift from the local optimistic state if a prior call failed.
async function setHabitCompletion(habitName, done) {
  const token = await getToken();
  try {
    await fetch(`${BASEURL}/api/set-habit-completion`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : '',
      },
      credentials: 'include',
      body: JSON.stringify({ habit_name: habitName, date: localDateStr(), done }),
    });
  } catch (error) {
    console.log('Failed to sync habit completion', error);
  }
}

export const toggleHabitDone = async (id) => {
  const habit = habits.find((h) => h.id === id);
  if (!habit) return null;
  rolloverHabit(habit);
  markHabit(habit, !habit.doneToday);
  setHabitCompletion(habit.name, habit.doneToday);
  return clone(habit);
};

export const getHabitDays = async () => {
  const token = await getToken();
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const response = await fetch(`${BASEURL}/api/habit-days?tz=${encodeURIComponent(tz)}`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : '',
      },
      credentials: 'include',
    });
    if (response.ok) {
      const data = await response.json();
      return data.days ?? [];
    }
  } catch (error) {
    console.log('Failed to get habit days', error);
  }
  return [];
};

export const resetHabits = async () => {
  const token = await getToken();
  try {
    const response = await fetch(`${BASEURL}/api/reset-habits`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : '',
      },
      credentials: 'include',
    });
    if (!response.ok) return false;
    // Clear local state entirely -- otherwise any deleted custom habits would
    // linger as stale entries, since mergeBackendHabits only adds/updates.
    habits = [];
    return true;
  } catch (error) {
    console.log('Failed to reset habits', error);
    return false;
  }
};

// `orderedNames` is the full list of currently-visible habits' names, in
// their new display order (drag-and-drop on My Recovery).
export const reorderHabits = async (orderedNames) => {
  const token = await getToken();
  try {
    const response = await fetch(`${BASEURL}/api/reorder-habits`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : '',
      },
      credentials: 'include',
      body: JSON.stringify({ ordered_names: orderedNames }),
    });
    if (!response.ok) return false;
    orderedNames.forEach((name, index) => {
      const habit = habits.find((h) => h.name === name);
      if (habit) habit.order = index;
    });
    return true;
  } catch (error) {
    console.log('Failed to reorder habits', error);
    return false;
  }
};

