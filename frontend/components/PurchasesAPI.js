import Purchases from 'react-native-purchases';
import { getToken } from './authStorage';

const BASEURL = process.env.EXPO_PUBLIC_API_URL;

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
