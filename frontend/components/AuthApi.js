import { getToken, setToken } from './authStorage.js'


const BASEURL = process.env.EXPO_PUBLIC_API_URL;

export const authenticated = async () => {
    const token = await getToken(); 

    try {
        const response = await fetch(`${BASEURL}/api/authenticated`, {
            method: "POST", 
            headers: {
                'Content-Type': 'application/json', 
                'Authorization': token ? `Bearer ${token}` : '',
            }, 
            credentials: 'include', 
        })
        if(response.ok){
            return true
        }
        return false
    } catch (_) {
        return false
    }
}


//login function 
export const login = async (username, password) => {
    try {
        const response = await fetch(`${BASEURL}/api/token/`, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({ "username": username, "password": password }),
        })
        if(response.ok)
        {
            const data = await response.json(); 
            await setToken(data['access'])
            return true;
        }
    } catch (error){
        console.log("Failed to login", error);
        return false; 
    }
}

// social OAuth login — provider is 'google' or 'apple', token is the access/identity token
export const socialAuth = async (provider, token) => {
    try {
        const response = await fetch(`${BASEURL}/api/social-auth`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ provider, token }),
        });
        if (response.ok) {
            const data = await response.json();
            if (data.access) await setToken(data.access);
            return data; // { success, access, is_new }
        }
    } catch (e) {
        console.log('Social auth error', e);
    }
    return null;
};

// submits the 6-digit code emailed on signup
export const verifyEmailCode = async (code) => {
    const token = await getToken();
    try {
        const response = await fetch(`${BASEURL}/api/verify-email`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': token ? `Bearer ${token}` : '',
            },
            credentials: 'include',
            body: JSON.stringify({ code }),
        });
        return await response.json();
    } catch (_) {
        return { success: false, error: 'Something went wrong. Please try again.' };
    }
};

// requests a fresh verification code (e.g. the first one expired or never arrived)
export const resendVerificationCode = async () => {
    const token = await getToken();
    try {
        const response = await fetch(`${BASEURL}/api/resend-verification`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': token ? `Bearer ${token}` : '',
            },
            credentials: 'include',
        });
        return await response.json();
    } catch (_) {
        return { success: false, error: 'Something went wrong. Please try again.' };
    }
};

// register function
export const register = async (username, first_name, email, password) => {
    try {
        const response = await fetch(`${BASEURL}/api/register`, {
            method: "POST",
            headers: {
                "Content-Type": 'application/json'
            },
            body: JSON.stringify({ username, first_name, email, password }),
        })
        const data = await response.json();
        if (response.ok) {
            return { success: true };
        }
        // register returns DRF field errors (e.g. { username: [...], email: [...] })
        // rather than a single message, so translate the fields we know about into
        // one readable string and fall back to something generic otherwise.
        if (data.username && data.email) {
            return { success: false, error: 'That username and email are already taken.' };
        }
        if (data.username) {
            return { success: false, error: 'That username is already taken.' };
        }
        if (data.email) {
            return { success: false, error: 'That email is already registered.' };
        }
        return { success: false, error: 'Something went wrong. Please try again.' };
    } catch (_) {
        console.log("Fail")
        return { success: false, error: 'Something went wrong. Please try again.' };
    }
}


