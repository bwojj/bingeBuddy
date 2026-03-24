import { Text, View, StyleSheet, ScrollView, TouchableOpacity, Alert, Linking } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

const PROTECTION_ITEMS = [
  {
    icon: 'shield-checkmark-outline',
    lib: 'ion',
    color: '#388E3C',
    bg: '#e8f5e9',
    title: 'Data Encryption',
    description: 'All data transmitted between the app and our servers is encrypted using TLS. Your information is never sent in plain text.',
  },
  {
    icon: 'eye-off-outline',
    lib: 'ion',
    color: '#7e1f8c',
    bg: '#e8e3ea',
    title: 'Private by Default',
    description: 'Your recovery journey, journal entries, and urge history are never sold, shared with advertisers, or disclosed to third parties.',
  },
  {
    icon: 'phone-lock',
    lib: 'mc',
    color: '#1565C0',
    bg: '#e3f2fd',
    title: 'Secure Token Storage',
    description: 'Authentication tokens are stored using device-level secure storage (iOS Keychain / Android Keystore), not plain local storage.',
  },
  {
    icon: 'server-outline',
    lib: 'ion',
    color: '#E65100',
    bg: '#fff3e0',
    title: 'Hosted Infrastructure',
    description: 'Our backend runs on Railway with isolated environments. Media files are stored via Cloudinary with access-controlled URLs.',
  },
];

const COLLECTION_ITEMS = [
  {
    icon: 'person-outline',
    lib: 'ion',
    color: '#7e1f8c',
    bg: '#e8e3ea',
    title: 'Account Information',
    description: 'Your name and email address, used to identify your account and send important notices.',
  },
  {
    icon: 'journal-outline',
    lib: 'ion',
    color: '#0277BD',
    bg: '#e1f5fe',
    title: 'Recovery Data',
    description: 'Journal entries, urge logs, goals, and your motivation content. This data exists solely to power your experience in the app.',
  },
  {
    icon: 'mic-outline',
    lib: 'ion',
    color: '#6A1B9A',
    bg: '#f3e5f5',
    title: 'Audio Messages',
    description: 'Personal audio recordings you create for the SOS screen. Stored securely and only accessible by you.',
  },
  {
    icon: 'analytics-outline',
    lib: 'ion',
    color: '#2E7D32',
    bg: '#e8f5e9',
    title: 'Usage Data',
    description: 'Basic interaction data (such as urge timestamps) used to generate your in-app progress charts. Not shared externally.',
  },
];

const RIGHTS_ITEMS = [
  {
    icon: 'eye-outline',
    lib: 'ion',
    color: '#0277BD',
    bg: '#e1f5fe',
    title: 'Right to Access',
    description: 'You can request a full export of your data at any time from this screen.',
  },
  {
    icon: 'create-outline',
    lib: 'ion',
    color: '#7e1f8c',
    bg: '#e8e3ea',
    title: 'Right to Correction',
    description: 'Update your name, email, and profile information anytime in Profile Settings.',
  },
  {
    icon: 'trash-outline',
    lib: 'ion',
    color: '#C62828',
    bg: '#ffebee',
    title: 'Right to Deletion',
    description: 'Deleting your account permanently removes all data associated with your profile, with no recovery possible.',
  },
];

function openUrl(url, label) {
  Alert.alert(
    label,
    `This will open ${url} in your browser.`,
    [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Open', onPress: () => Linking.openURL(url) },
    ]
  );
}

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
          {PROTECTION_ITEMS.map((item, i) => (
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

        {/* What We Collect */}
        <Text style={styles.sectionLabel}>WHAT WE COLLECT</Text>
        <View style={styles.card}>
          {COLLECTION_ITEMS.map((item, i) => (
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

        {/* Your Rights */}
        <Text style={styles.sectionLabel}>YOUR RIGHTS</Text>
        <View style={styles.card}>
          {RIGHTS_ITEMS.map((item, i) => (
            <View key={i}>
              {i > 0 && <View style={styles.divider} />}
              <View style={styles.infoRow}>
                <View style={[styles.iconWrap, { backgroundColor: item.bg }]}>
                  <Ionicons name={item.icon} size={20} color={item.color} />
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
            onPress={() => openUrl('https://bingebuddy.app/privacy', 'Privacy Policy')}
          >
            <View style={[styles.iconWrap, { backgroundColor: '#e8f5e9' }]}>
              <Ionicons name="shield-outline" size={20} color="#388E3C" />
            </View>
            <Text style={styles.menuLabel}>Privacy Policy</Text>
            <Ionicons name="open-outline" size={18} color="#bbb" />
          </TouchableOpacity>
        </View>

        {/* Manage Data */}
        <Text style={styles.sectionLabel}>MANAGE DATA</Text>
        <View style={styles.menuCard}>
          <TouchableOpacity
            style={styles.menuRow}
            onPress={() =>
              Alert.alert(
                'Delete Account',
                'This will permanently delete your account and all associated data. This action cannot be undone.',
                [
                  { text: 'Cancel', style: 'cancel' },
                  { text: 'Delete', style: 'destructive', onPress: () => {} },
                ]
              )
            }
          >
            <View style={[styles.iconWrap, { backgroundColor: '#ffebee' }]}>
              <Ionicons name="trash-outline" size={20} color="#C62828" />
            </View>
            <Text style={[styles.menuLabel, styles.menuLabelDestructive]}>Delete My Account</Text>
            <Ionicons name="chevron-forward" size={18} color="#bbb" />
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#7e1f8c',
  },
  scrollContent: {
    flexGrow: 1,
    backgroundColor: '#f3edf7',
    paddingBottom: 20,
  },

  /* Header */
  header: {
    backgroundColor: '#7e1f8c',
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
