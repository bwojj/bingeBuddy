import { getToken } from './authStorage';

const BASEURL = 'https://unluxuriating-alysa-vengefully.ngrok-free.dev';

export const logUrge = async () => {
    const token = await getToken();
    try {
        const response = await fetch(`${BASEURL}/api/log-urge`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': token ? `Bearer ${token}` : '',
            },
        });
        return response.ok;
    } catch (error) {
        console.log('Failed to log urge', error);
        return false;
    }
};

export const getUrgeCount = async () => {
    const token = await getToken();
    try {
        const response = await fetch(`${BASEURL}/api/urges/`, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': token ? `Bearer ${token}` : '',
            },
        });
        if (response.ok) {
            const data = await response.json();
            return data.count ?? 0;
        }
    } catch (error) {
        console.log('Failed to get urge count', error);
    }
    return 0;
};

export const getUrgesByDay = async () => {
    const token = await getToken();
    try {
        const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
        const response = await fetch(`${BASEURL}/api/urges-by-day?tz=${encodeURIComponent(tz)}`, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': token ? `Bearer ${token}` : '',
            },
        });
        if (response.ok) {
            const data = await response.json();
            return data.days ?? null;
        }
    } catch (error) {
        console.log('Failed to get urges by day', error);
    }
    return null;
};
