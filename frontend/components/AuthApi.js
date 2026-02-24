import { getToken, setToken, delToken } from './authStorage.js'


const BASEURL = 'https://unluxuriating-alysa-vengefully.ngrok-free.dev';

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
        if(response.ok) {
            return true; 
        }
    } catch(_){
        console.log("Fail")
        return false; 
    }
}


