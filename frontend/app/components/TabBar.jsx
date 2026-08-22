import { Text, View, StyleSheet, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/context/AuthContext';
import { Colors, FontFamily } from '@/constants/theme';

const TABS = [
  { key: 'dashboard', label: 'Dashboard', route: '/', icon: 'home', iconOutline: 'home-outline' },
  { key: 'my-plan', label: 'My Recovery', route: '/my-plan', icon: 'flame', iconOutline: 'flame-outline' },
  { key: 'coach', label: 'AI Coach', route: '/coach', icon: 'chatbubble-ellipses', iconOutline: 'chatbubble-ellipses-outline' },
  { key: 'journal', label: 'Journal', route: '/journal', icon: 'document-text', iconOutline: 'document-text-outline' },
  { key: 'me', label: 'Me', route: '/me', icon: 'person-circle', iconOutline: 'person-circle-outline' },
];

export default function TabBar({ activeTab }) {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { userPreferences, userLoading, refreshUserData } = useAuth();

  function handlePress(tab) {
    if (tab.key === 'my-plan' && !userPreferences?.seen_recovery_intro) {
      router.push('/recovery-intro');
      return;
    }
    if (tab.key === 'coach') {
      if (userPreferences == null) {
        if (userLoading) {
          return;
        }
        refreshUserData();
        return;
      }
      if (!userPreferences.is_premium) {
        router.push('/paywall');
        return;
      }
      if (!userPreferences?.seen_ai_coach_intro || !userPreferences?.ai_data_consent) {
        router.push('/ai-coach-intro');
        return;
      }
    }
    router.push(tab.route);
  }

  return (
    <View style={[styles.tabBar, { paddingBottom: insets.bottom || 10 }]}>
      {TABS.map((tab) => {
        const active = tab.key === activeTab;
        const content = (
          <>
            <Ionicons
              name={active ? tab.icon : tab.iconOutline}
              size={23}
              color={active ? Colors.plum : Colors.inkFaint}
            />
            <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>{tab.label}</Text>
          </>
        );
        if (active) {
          return (
            <View key={tab.key} style={styles.tabItem}>
              {content}
            </View>
          );
        }
        return (
          <TouchableOpacity key={tab.key} style={styles.tabItem} onPress={() => handlePress(tab)}>
            {content}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderTopWidth: 1,
    borderTopColor: Colors.line,
    paddingTop: 11,
    justifyContent: 'space-around',
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
  },
  tabLabel: {
    fontFamily: FontFamily.sansSemibold,
    fontSize: 10.5,
    color: Colors.inkFaint,
  },
  tabLabelActive: {
    color: Colors.plum,
  },
});
