import { Text, View, StyleSheet, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, FontFamily } from '@/constants/theme';

const TABS = [
  { key: 'dashboard', label: 'Dashboard', route: '/', icon: 'home', iconOutline: 'home-outline' },
  { key: 'progress', label: 'Progress', route: '/progress', icon: 'bar-chart', iconOutline: 'bar-chart-outline' },
  { key: 'coach', label: 'AI Coach', route: '/coach', icon: 'chatbubble-ellipses', iconOutline: 'chatbubble-ellipses-outline' },
  { key: 'journal', label: 'Journal', route: '/journal', icon: 'document-text', iconOutline: 'document-text-outline' },
  { key: 'settings', label: 'Settings', route: '/settings', icon: 'settings', iconOutline: 'settings-outline' },
];

export default function TabBar({ activeTab }) {
  const insets = useSafeAreaInsets();
  const router = useRouter();

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
          <TouchableOpacity key={tab.key} style={styles.tabItem} onPress={() => router.push(tab.route)}>
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
