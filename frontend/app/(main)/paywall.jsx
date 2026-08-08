import { useEffect, useState } from 'react';
import { Text, View, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Purchases from 'react-native-purchases';
import { useAuth } from '@/context/AuthContext';
import { verifySubscription } from '@/components/PurchasesAPI';
import { Colors, FontFamily, FontSize, Radii, Shadows } from '@/constants/theme';

// Shown when TabBar/coach.jsx redirect an unsubscribed user instead of
// letting them into /coach (see TabBar.jsx's handlePress and coach.jsx's
// mount-time guard). Styled to match ai-coach-intro.jsx's single-page
// interstitial layout.
export default function Paywall() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { refreshUserData } = useAuth();

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [packages, setPackages] = useState([]);
  const [purchasingId, setPurchasingId] = useState(null);
  const [restoring, setRestoring] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const offerings = await Purchases.getOfferings();
        const available = offerings.current?.availablePackages ?? [];
        if (!cancelled) setPackages(available);
      } catch (error) {
        console.log('Failed to fetch offerings', error);
        if (!cancelled) setLoadError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  async function handleEntitled() {
    await verifySubscription();
    await refreshUserData();
    router.replace('/coach');
  }

  async function handlePurchase(pkg) {
    setPurchasingId(pkg.identifier);
    try {
      const { customerInfo } = await Purchases.purchasePackage(pkg);
      if (Object.keys(customerInfo.entitlements.active).length > 0) {
        await handleEntitled();
      }
    } catch (error) {
      if (!error.userCancelled) {
        Alert.alert('Purchase failed', error.message || 'Something went wrong. Please try again.');
      }
    } finally {
      setPurchasingId(null);
    }
  }

  async function handleRestore() {
    setRestoring(true);
    try {
      const customerInfo = await Purchases.restorePurchases();
      if (Object.keys(customerInfo.entitlements.active).length > 0) {
        await handleEntitled();
      } else {
        Alert.alert('Nothing to restore', "We couldn't find a previous subscription for this account.");
      }
    } catch (error) {
      Alert.alert('Restore failed', error.message || 'Something went wrong. Please try again.');
    } finally {
      setRestoring(false);
    }
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[
        styles.content,
        { paddingTop: insets.top + 10, paddingBottom: insets.bottom + 30 },
      ]}
      showsVerticalScrollIndicator={false}
    >
      {/* Top row */}
      <View style={styles.topRow}>
        <View style={{ width: 26 }} />
        <Text style={styles.eyebrow}>AI COACH</Text>
        <TouchableOpacity onPress={() => router.replace('/')}>
          <Ionicons name="close" size={26} color={Colors.ink} />
        </TouchableOpacity>
      </View>

      {/* Centered body */}
      <View style={styles.centerBlock}>
        <View style={styles.iconWrapper}>
          <View style={styles.iconCircle}>
            <Ionicons name="chatbubble-ellipses" size={30} color={Colors.plum} />
          </View>
        </View>

        <Text style={styles.title}>Unlock Your Coach</Text>

        <Text style={styles.body}>
          Get unlimited access to your AI Coach, available around the clock to help you work through urges, slips, and hard moments — grounded in real binge eating recovery, not generic wellness tips.
        </Text>

        {loading && (
          <ActivityIndicator color={Colors.plum} style={{ marginTop: 12 }} />
        )}

        {!loading && loadError && (
          <Text style={styles.errorText}>
            We couldn&apos;t load subscription options right now. Please check your connection and try again shortly.
          </Text>
        )}

        {!loading && !loadError && packages.length === 0 && (
          <Text style={styles.errorText}>
            Subscriptions aren&apos;t available right now. Please try again later.
          </Text>
        )}

        {!loading && packages.map((pkg) => {
          const product = pkg.product;
          const isPurchasing = purchasingId === pkg.identifier;
          return (
            <TouchableOpacity
              key={pkg.identifier}
              style={styles.planCard}
              onPress={() => handlePurchase(pkg)}
              disabled={purchasingId !== null || restoring}
            >
              <Text style={styles.planTitle}>{product.title || product.priceString}</Text>
              {product.introPrice && (
                <Text style={styles.planTrial}>
                  {product.introPrice.priceString === '0.00' || product.introPrice.price === 0
                    ? `Free trial, then ${product.priceString}`
                    : `${product.introPrice.priceString} trial, then ${product.priceString}`}
                </Text>
              )}
              {!product.introPrice && (
                <Text style={styles.planTrial}>{product.priceString}</Text>
              )}
              {isPurchasing && <ActivityIndicator color={Colors.plum} style={{ marginTop: 8 }} />}
            </TouchableOpacity>
          );
        })}
      </View>

      <TouchableOpacity onPress={handleRestore} disabled={purchasingId !== null || restoring} style={styles.restoreLink}>
        <Text style={styles.restoreText}>{restoring ? 'Restoring…' : 'Restore Purchases'}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.surface,
  },
  content: {
    paddingHorizontal: 24,
    flexGrow: 1,
  },

  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  eyebrow: {
    fontFamily: FontFamily.sansBold,
    fontSize: FontSize.eyebrowSm,
    color: Colors.plumSoft,
    letterSpacing: 1.5,
  },

  centerBlock: {
    flex: 1,
    justifyContent: 'center',
    paddingVertical: 12,
  },

  iconWrapper: {
    alignItems: 'center',
    marginBottom: 20,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.plumTint,
    alignItems: 'center',
    justifyContent: 'center',
  },

  title: {
    fontFamily: FontFamily.serifMedium,
    fontSize: FontSize.flowTitle,
    color: Colors.ink,
    textAlign: 'center',
    marginBottom: 14,
    lineHeight: 40,
    letterSpacing: -0.4,
  },

  body: {
    fontFamily: FontFamily.sansMedium,
    fontSize: FontSize.body,
    color: Colors.inkSoft,
    lineHeight: 23,
    textAlign: 'center',
    marginBottom: 24,
  },

  errorText: {
    fontFamily: FontFamily.sansMedium,
    fontSize: FontSize.bodyMd,
    color: Colors.inkSoft,
    textAlign: 'center',
    marginTop: 8,
  },

  planCard: {
    width: '100%',
    borderRadius: Radii.card,
    backgroundColor: Colors.plumTint2,
    borderWidth: 1,
    borderColor: Colors.line,
    paddingVertical: 18,
    paddingHorizontal: 20,
    alignItems: 'center',
    marginTop: 14,
    ...Shadows.soft,
  },
  planTitle: {
    fontFamily: FontFamily.sansBold,
    fontSize: FontSize.cardTitle,
    color: Colors.ink,
    marginBottom: 4,
  },
  planTrial: {
    fontFamily: FontFamily.sansMedium,
    fontSize: FontSize.bodyMd,
    color: Colors.plum,
  },

  restoreLink: {
    alignSelf: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  restoreText: {
    fontFamily: FontFamily.sansSemibold,
    fontSize: FontSize.secondary,
    color: Colors.inkFaint,
  },
});
