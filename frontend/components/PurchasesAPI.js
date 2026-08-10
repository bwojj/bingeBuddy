import Purchases from 'react-native-purchases';
import { getToken } from './authStorage';

const BASEURL = process.env.EXPO_PUBLIC_API_URL;

// Anonymous ID until identifyPurchasesUser() aliases it to the backend user,
// per RevenueCat's recommended startup sequence (configure before login).
// Cached as a shared promise so identifyPurchasesUser/logOutPurchases (called
// from AuthContext right after auth resolves) can await the same in-flight
// configure() instead of racing ahead of it -- Purchases.logIn() throws if
// called before configure() has actually landed.
let configurePromise = null;
export function configurePurchases() {
    if (!configurePromise) {
        configurePromise = (async () => {
            const alreadyConfigured = await Purchases.isConfigured?.();
            if (!alreadyConfigured) {
                Purchases.configure({ apiKey: process.env.EXPO_PUBLIC_REVENUECAT_IOS_API_KEY });
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
