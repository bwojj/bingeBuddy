import Purchases from 'react-native-purchases';
import { getToken } from './authStorage';

const BASEURL = process.env.EXPO_PUBLIC_API_URL;

// Anonymous ID until identifyPurchasesUser() aliases it to the backend user,
// per RevenueCat's recommended startup sequence (configure before login).
// Cached as a shared promise so identifyPurchasesUser/logOutPurchases (called
// from AuthContext right after auth resolves) can await the same in-flight
// configure() instead of racing ahead of it -- Purchases.logIn() throws if
// called before configure() has actually landed.
//
// Purchases.configure() is a void native method -- RN has no promise to
// reject it through, so a native-side throw (e.g. RevenueCat rejecting a
// missing/empty API key) is fatal to the whole app, not just this call.
// EXPO_PUBLIC_* vars are inlined from a gitignored .env at bundle time, so a
// build pipeline that doesn't have that var set (e.g. an EAS Build profile
// without it configured) ships with apiKey undefined. Validate before
// crossing into native so a missing key degrades to "purchases unavailable"
// instead of crashing on every launch.
let configurePromise = null;
export function configurePurchases() {
    if (!configurePromise) {
        configurePromise = (async () => {
            const apiKey = process.env.EXPO_PUBLIC_REVENUECAT_IOS_API_KEY;
            if (!apiKey) {
                console.error('EXPO_PUBLIC_REVENUECAT_IOS_API_KEY is not set -- skipping Purchases.configure()');
                return;
            }
            try {
                const alreadyConfigured = await Purchases.isConfigured?.();
                if (!alreadyConfigured) {
                    Purchases.configure({ apiKey });
                }
            } catch (error) {
                console.error('Purchases.configure() failed', error);
            }
        })();
    }
    return configurePromise;
}

// Aliases the RevenueCat customer to the Django user's numeric id, so
// RevenueCat's app_user_id equals request.user.id on the backend.
export async function identifyPurchasesUser(userId) {
    await configurePurchases();
    return Purchases.logIn(String(userId));
}

export async function logOutPurchases() {
    await configurePurchases();
    return Purchases.logOut().catch(() => {});
}

export const verifySubscription = async () => {
    const token = await getToken();
    try {
        const response = await fetch(`${BASEURL}/api/subscription/verify`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': token ? `Bearer ${token}` : '',
            },
            credentials: 'include',
        });
        if (response.ok) {
            return response.json();
        }
    } catch (error) {
        console.log('Failed to verify subscription', error);
    }
    return null;
};
