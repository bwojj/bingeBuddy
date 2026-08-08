import Purchases from 'react-native-purchases';
import { getToken } from './authStorage';

const BASEURL = process.env.EXPO_PUBLIC_API_URL;

// Anonymous ID until identifyPurchasesUser() aliases it to the backend user,
// per RevenueCat's recommended startup sequence (configure before login).
export function configurePurchases() {
    if (Purchases.isConfigured?.()) return;
    Purchases.configure({ apiKey: process.env.EXPO_PUBLIC_REVENUECAT_IOS_API_KEY });
}

// Aliases the RevenueCat customer to the Django user's numeric id, so
// RevenueCat's app_user_id equals request.user.id on the backend.
export function identifyPurchasesUser(userId) {
    return Purchases.logIn(String(userId));
}

export function logOutPurchases() {
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
