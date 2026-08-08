import { getToken } from './authStorage';

const BASEURL = process.env.EXPO_PUBLIC_API_URL;

export const logUrge = async (note, time) => {
    const token = await getToken();
    try {
        const response = await fetch(`${BASEURL}/api/log-urge`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': token ? `Bearer ${token}` : '',
            },
            body: JSON.stringify({ note, time }),
        });
        return response.ok;
    } catch (error) {
        console.log('Failed to log urge', error);
        return false;
    }
};

export const getAllUrges = async () => {
    const token = await getToken();
    try {
        const response = await fetch(`${BASEURL}/api/urges/all/`, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': token ? `Bearer ${token}` : '',
            },
        });
        if (response.ok) {
            return await response.json();
        }
    } catch (error) {
        console.log('Failed to get all urges', error);
    }
    return [];
};

export const deleteUrge = async (id) => {
    const token = await getToken();
    try {
        const response = await fetch(`${BASEURL}/api/delete-urge`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': token ? `Bearer ${token}` : '',
            },
            credentials: 'include',
            body: JSON.stringify({ id }),
        });
        return response.ok;
    } catch (error) {
        console.log('Failed to delete urge', error);
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
