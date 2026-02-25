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