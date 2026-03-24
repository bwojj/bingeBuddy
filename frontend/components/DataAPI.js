import { getToken } from './authStorage.js'


const BASEURL = 'https://bingebuddy-production.up.railway.app';

export const getUserCredentials = async () => {
    const token = await getToken();

    try {
        const response = await fetch(`${BASEURL}/api/credentials`, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': token ? `Bearer ${token}` : '', 
            }
        })
        if(response.ok){
            const data = await response.json();
            return data; 
        }
    } catch (error){
        console.log('Failed to fetch cred', error); 
        return false; 
    }
}

export const getUserData = async () => {
    const token = await getToken(); 

    try {
        const response = await fetch(`${BASEURL}/api/data/`, {
            headers: {
                'Content-Type': 'application/json', 
                'Authorization': token ? `Bearer ${token}` : '',
            }
        })
        if(response.ok) {
            const data = await response.json(); 
            return data; 
        }
    } catch(error) {
        console.log('Failed to fetch', error); 
        return false;
    }
}

export const updateProfile = async ({ first_name, email, current_password, new_password }) => {
    const token = await getToken();
    try {
        const body = {};
        if (first_name !== undefined) body.first_name = first_name;
        if (email !== undefined) body.email = email;
        if (new_password) { body.new_password = new_password; body.current_password = current_password; }

        const response = await fetch(`${BASEURL}/api/update-profile`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': token ? `Bearer ${token}` : '',
            },
            body: JSON.stringify(body),
        });
        const data = await response.json();
        return data;
    } catch (error) {
        console.log('Failed to update profile', error);
        return { success: false };
    }
};

export const deleteAccount = async () => {
    const token = await getToken();
    try {
        const response = await fetch(`${BASEURL}/api/delete-account`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': token ? `Bearer ${token}` : '',
            },
        });
        const data = await response.json();
        return data;
    } catch (error) {
        console.log('Failed to delete account', error);
        return { success: false };
    }
};

export const getPanicAudio = async () => {
    const token = await getToken();
    try {
        const response = await fetch(`${BASEURL}/api/get-panic-audio`, {
            headers: { 'Authorization': token ? `Bearer ${token}` : '' },
        });
        if (response.ok) {
            const data = await response.json();
            return data.url ?? null;
        }
    } catch (error) {
        console.log('Failed to fetch panic audio', error);
    }
    return null;
};

export const addPanicAudio = async (uri) => {
    if (!uri) return false;
    const token = await getToken();
    try {
        const form = new FormData();
        form.append('panic_audio', {
            uri,
            type: 'audio/m4a',
            name: 'panic_audio.m4a',
        });
        const response = await fetch(`${BASEURL}/api/set-panic-audio`, {
            method: 'POST',
            headers: { 'Authorization': token ? `Bearer ${token}` : '' },
            body: form,
            credentials: 'include',
        });
        if (!response.ok) {
            const text = await response.text();
            console.log('Panic audio upload failed', response.status, text);
        }
        return response.ok;
    } catch (error) {
        console.log('Failed to upload panic audio', error);
        return false;
    }
};

export const addMotivationImage = async (image) => {
    if (!image) return true;
    const token = await getToken();

    try {
        const form = new FormData();
        form.append('motivation_image', {
            uri: image.uri,
            type: image.mimeType ?? 'image/jpeg',
            name: image.fileName ?? 'motivation.jpg',
        });

        const response = await fetch(`${BASEURL}/api/add-motivation-image`, {
            method: 'POST',
            headers: {
                'Authorization': token ? `Bearer ${token}` : '',
            },
            body: form,
            credentials: 'include',
        })
        if(response.ok){
            return true;
        }
    } catch(error){
        console.log("Failed to add image", error);
        return false;
    }
}

