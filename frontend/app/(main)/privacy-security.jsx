import { Text, View, StyleSheet, ScrollView, TouchableOpacity, Alert, Linking } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, FontFamily, FontSize, Radii, Shadows, Gradients } from '@/constants/theme';

const PROTECTION_ITEMS = [
  {
    icon: 'shield-checkmark-outline',
    lib: 'ion',
    color: Colors.sage,
    bg: Colors.sageTint,
    title: 'Data Encryption',
    description: 'All data transmitted between the app and our servers is encrypted using TLS. Your information is never sent in plain text.',
  },
  {
    icon: 'eye-off-outline',
    lib: 'ion',
    color: Colors.plum,
    bg: Colors.plumTint,
    title: 'Private by Default',
    description: 'Your recovery journey, journal entries, and urge history are never sold, shared with advertisers, or disclosed to third parties.',
  },
  {
    icon: 'phone-lock',
    lib: 'mc',
    color: Colors.blue,
    bg: Colors.blueTint,
    title: 'Secure Token Storage',
    description: 'Authentication tokens are stored using device-level secure storage (iOS Keychain / Android Keystore), not plain local storage.',
  },
  {
    icon: 'server-outline',
    lib: 'ion',
    color: Colors.amber,
    bg: Colors.amberTint,
    title: 'Hosted Infrastructure',
    description: 'Our backend runs on Railway with isolated environments. Media files are stored via Cloudinary with access-controlled URLs.',
  },
];

const COLLECTION_ITEMS = [
  {
    icon: 'person-outline',
    lib: 'ion',
    color: Colors.plum,
    bg: Colors.plumTint,
    title: 'Account Information',
    description: 'Your name and email address, used to identify your account and send important notices.',
  },
  {
    icon: 'journal-outline',
    lib: 'ion',
    color: Colors.blue,
    bg: Colors.blueTint,
    title: 'Recovery Data',
    description: 'Journal entries, urge logs, goals, and your motivation content. This data exists solely to power your experience in the app.',
  },
  {
    icon: 'mic-outline',
    lib: 'ion',
    color: Colors.plum,
    bg: Colors.plumTint,
    title: 'Audio Messages',
    description: 'Personal audio recordings you create for the SOS screen. Stored securely and only accessible by you.',
  },
  {
    icon: 'analytics-outline',
    lib: 'ion',
    color: Colors.sage,
    bg: Colors.sageTint,
    title: 'Usage Data',
    description: 'Basic interaction data (such as urge timestamps) used to generate your in-app progress charts. Not shared externally.',
  },
];

const RIGHTS_ITEMS = [
  {
    icon: 'eye-outline',
    lib: 'ion',
    color: Colors.blue,
    bg: Colors.blueTint,
    title: 'Right to Access',
    description: 'You can request a full export of your data at any time from this screen.',
  },
  {
    icon: 'create-outline',
    lib: 'ion',
    color: Colors.plum,
    bg: Colors.plumTint,
    title: 'Right to Correction',
    description: 'Update your name, email, and profile information anytime in Profile Settings.',
  },
  {
    icon: 'trash-outline',
    lib: 'ion',
    color: Colors.alert,
    bg: Colors.alertTint,
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
        <LinearGradient
          colors={Gradients.hero.colors}
          start={Gradients.hero.start}
          end={Gradients.hero.end}
          style={[styles.header, { paddingTop: insets.top + 10 }]}
        >
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={26} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Privacy & Security</Text>
          <View style={{ width: 40 }} />
        </LinearGradient>

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
            <View style={[styles.iconWrap, { backgroundColor: Colors.sageTint }]}>
              <Ionicons name="shield-outline" size={20} color={Colors.sage} />
            </View>
            <Text style={styles.menuLabel}>Privacy Policy</Text>
            <Ionicons name="open-outline" size={18} color={Colors.inkFaint} />
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
            <View style={[styles.iconWrap, { backgroundColor: Colors.alertTint }]}>
              <Ionicons name="trash-outline" size={20} color={Colors.alert} />
            </View>
            <Text style={[styles.menuLabel, styles.menuLabelDestructive]}>Delete My Account</Text>
            <Ionicons name="chevron-forward" size={18} color={Colors.inkFaint} />
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
    backgroundColor: Colors.plumDeep,
  },
  scrollContent: {
    flexGrow: 1,
    backgroundColor: Colors.bg,
    paddingBottom: 20,
  },

  /* Header */
  header: {
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
    fontFamily: FontFamily.serifMedium,
    fontSize: FontSize.topbarTitle,
    color: 'white',
  },

  sectionLabel: {
    fontFamily: FontFamily.sansBold,
    fontSize: FontSize.eyebrowSm,
    color: Colors.inkFaint,
    letterSpacing: 1.2,
    marginHorizontal: 20,
    marginBottom: 8,
  },

  /* Info card */
  card: {
    backgroundColor: Colors.surface,
    marginHorizontal: 20,
    borderRadius: Radii.card,
    padding: 16,
    marginBottom: 24,
    ...Shadows.soft,
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
    fontFamily: FontFamily.sansSemibold,
    fontSize: FontSize.bodyMd,
    color: Colors.ink,
    marginBottom: 3,
  },
  infoDesc: {
    fontFamily: FontFamily.sansRegular,
    fontSize: FontSize.secondarySm,
    color: Colors.inkSoft,
    lineHeight: 18,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.bg,
    marginVertical: 10,
    marginLeft: 50,
  },

  /* Menu card */
  menuCard: {
    backgroundColor: Colors.surface,
    marginHorizontal: 20,
    borderRadius: Radii.card,
    marginBottom: 24,
    overflow: 'hidden',
    ...Shadows.soft,
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  menuLabel: {
    flex: 1,
    fontFamily: FontFamily.sansRegular,
    fontSize: FontSize.body,
    color: Colors.ink,
    marginLeft: 14,
  },
  menuLabelDestructive: {
    color: Colors.alert,
  },
});
