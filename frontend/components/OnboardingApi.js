import { getToken } from "./authStorage";

const BASEURL = 'https://unluxuriating-alysa-vengefully.ngrok-free.dev';

export const mainCause = async (cause) => {
    const token = await getToken(); 
    try {
        const response = await fetch(`${BASEURL}/api/add-data-main-cause`, {
            method: "POST", 
            headers: {
                'Content-Type': 'application/json', 
                'Authorization': token ? `Bearer ${token}` : '',
            }, 
            body: JSON.stringify({ main_cause: cause }),
            credentials: 'include', 
        })
        if(response.ok)
        {
            return true; 
        }
    } catch(_){
        return false; 
    }
}

export const coachingStyle = async (style) => {
    const token = await getToken(); 
    try {
        const response = await fetch(`${BASEURL}/api/add-data-coaching-style`, {
            method: "POST", 
            headers: {
                'Content-Type': 'application/json',
                'Authorization': token ? `Bearer ${token}` : '', 
            }, 
            body: JSON.stringify({ coaching_style: style }),
            credentials: 'include', 
        })
        if(response.ok)
        {
            return true; 
        }
    } catch(_){
        return false; 
    }
}

export const motivation = async (motivation) => {
    const token = await getToken(); 
    try {
        const response = await fetch(`${BASEURL}/api/add-data-motivation`, {
            method: "POST", 
            headers: {
                'Content-Type': 'application/json', 
                'Authorization': token ? `Bearer ${token}` : '',
            }, 
            body: JSON.stringify({ motivation: motivation }),
            credentials: 'include', 
        })
        if(response.ok)
        {
            return true; 
        }
    } catch(_){
        return false; 
    }
}