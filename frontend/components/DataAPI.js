import { getToken } from './authStorage.js'


const BASEURL = 'https://unluxuriating-alysa-vengefully.ngrok-free.dev';

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

export const addUrgeLevel = async (urgeLevel) => {
    const token = await getToken(); 

    try {
        const response = await fetch(`${BASEURL}/api/add-urge-level`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': token ? `Bearer ${token}` : '', 
            },
            body: JSON.stringify({ 'urge_level': urgeLevel}),
        })
        if(response.ok){
            return true; 
        }
    } catch(error){
        console.log("Failed to add urge", error); 
        return false; 
    }
}

export const getUrgeLevel = async () => {
    const token = await getToken();

    try {
        const response = await fetch(`${BASEURL}/api/urges`, {
            
            headers: {
                'Content-Type': 'application/json', 
                'Authorization': token ? `Bearer ${token}` : '',
            }
        })
        if(response.ok){
            const data = await response.json();
            return data; 
        }
    } catch(error){
        console.log('Failed to get UrgeLevel', error); 
    }
}