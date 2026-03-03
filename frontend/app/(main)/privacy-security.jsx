import { Text, View, StyleSheet, ScrollView, TouchableOpacity, Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

const PRIVACY_ITEMS = [
  {
    icon: 'shield-checkmark-outline',
    lib: 'ion',
    color: '#388E3C',
    bg: '#e8f5e9',
    title: 'Data Encryption',
    description: 'Your personal data and journal entries are encrypted in transit using TLS.',
  },
  {
    icon: 'eye-off-outline',
    lib: 'ion',
    color: '#502c58',
    bg: '#e8e3ea',
    title: 'Private by Default',
    description: 'Your recovery data is never shared with third parties or advertisers.',
  },
  {
    icon: 'phone-lock',
    lib: 'mc',
    color: '#1565C0',
    bg: '#e3f2fd',
    title: 'On-Device Security',
    description: 'Authentication tokens are stored securely using device-level encryption.',
  },
];

const DATA_ITEMS = [
  {
    icon: 'download-outline',
    lib: 'ion',
    color: '#0277BD',
    bg: '#e1f5fe',
    label: 'Export My Data',
    onPress: () => Alert.alert('Export Data', 'A copy of your data will be sent to your email within 24 hours.'),
  },
  {
    icon: 'trash-outline',
    lib: 'ion',
    color: '#C62828',
    bg: '#ffebee',
    label: 'Delete My Account',
    onPress: () =>
      Alert.alert(
        'Delete Account',
        'This will permanently delete your account and all associated data. This action cannot be undone.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Delete', style: 'destructive', onPress: () => {} },
        ]
      ),
    destructive: true,
  },
];

export default function PrivacySecurity() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  return (
    <View style={styles.container}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={26} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Privacy & Security</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* How We Protect You */}
        <Text style={styles.sectionLabel}>HOW WE PROTECT YOU</Text>
        <View style={styles.card}>
          {PRIVACY_ITEMS.map((item, i) => (
            <View key={i}>
              {i > 0 && <View style={styles.divider} />}
              <View style={styles.infoRow}>
                <View style={[styles.iconWrap, { backgroundColor: item.bg }]}>
                  {item.lib === 'ion'
                    ? <Ionicons name={item.icon} size={20} color={item.color} />
                    : <MaterialCommunityIcons name={item.icon} size={20} color={item.color} />}
                </View>
                <View style={styles.infoText}>
                  <Text style={styles.infoTitle}>{item.title}</Text>
                  <Text style={styles.infoDesc}>{item.description}</Text>
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* Legal */}
        <Text style={styles.sectionLabel}>LEGAL</Text>
        <View style={styles.menuCard}>
          <TouchableOpacity
            style={styles.menuRow}
            onPress={() => Alert.alert('Terms of Service', 'Full terms available at bingebuddy.app/terms')}
          >
            <View style={[styles.iconWrap, { backgroundColor: '#ede9ee' }]}>
              <Ionicons name="document-text-outline" size={20} color="#502c58" />
            </View>
            <Text style={styles.menuLabel}>Terms of Service</Text>
            <Ionicons name="chevron-forward" size={18} color="#bbb" />
          </TouchableOpacity>
          <View style={styles.divider} />
          <TouchableOpacity
            style={styles.menuRow}
            onPress={() => Alert.alert('Privacy Policy', 'Full policy available at bingebuddy.app/privacy')}
          >
            <View style={[styles.iconWrap, { backgroundColor: '#e8f5e9' }]}>
              <Ionicons name="shield-outline" size={20} color="#388E3C" />
            </View>
            <Text style={styles.menuLabel}>Privacy Policy</Text>
            <Ionicons name="chevron-forward" size={18} color="#bbb" />
          </TouchableOpacity>
        </View>

        {/* Manage Data */}
        <Text style={styles.sectionLabel}>MANAGE DATA</Text>
        <View style={styles.menuCard}>
          {DATA_ITEMS.map((item, i) => (
            <View key={i}>
              {i > 0 && <View style={styles.divider} />}
              <TouchableOpacity style={styles.menuRow} onPress={item.onPress}>
                <View style={[styles.iconWrap, { backgroundColor: item.bg }]}>
                  <Ionicons name={item.icon} size={20} color={item.color} />
                </View>
                <Text style={[styles.menuLabel, item.destructive && styles.menuLabelDestructive]}>
                  {item.label}
                </Text>
                <Ionicons name="chevron-forward" size={18} color="#bbb" />
              </TouchableOpacity>
            </View>
          ))}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3edf7',
  },
  scrollContent: {
    paddingBottom: 20,
  },

  /* Header */
  header: {
    backgroundColor: '#502c58',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    marginBottom: 24,
  },
  backBtn: {
    width: 40,
    alignItems: 'flex-start',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: 'white',
  },

  sectionLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#999',
    letterSpacing: 1.2,
    marginHorizontal: 20,
    marginBottom: 8,
  },

  /* Info card */
  card: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 4,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
    flexShrink: 0,
  },
  infoText: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 3,
  },
  infoDesc: {
    fontSize: 13,
    color: '#888',
    lineHeight: 18,
  },
  divider: {
    height: 1,
    backgroundColor: '#f3edf7',
    marginVertical: 10,
    marginLeft: 50,
  },

  /* Menu card */
  menuCard: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    borderRadius: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
    overflow: 'hidden',
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  menuLabel: {
    flex: 1,
    fontSize: 15,
    color: '#1a1a1a',
    marginLeft: 14,
  },
  menuLabelDestructive: {
    color: '#C62828',
  },
});
