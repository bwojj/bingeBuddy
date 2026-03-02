import { getToken } from "./authStorage";

const BASEURL = 'https://unluxuriating-alysa-vengefully.ngrok-free.dev';

export const addEntry = async (type, title, entry) => {
    const token = await getToken(); 

    try {
        const response = await fetch(`${BASEURL}/api/add-journal-entry`, {
            method: 'POST', 
            headers: {
                'Content-Type': 'application/json', 
                'Authorization': token ? `Bearer ${token}` : '',
            },
            body: JSON.stringify({ entry_type: type, title: title, entry: entry })
        })
        if(response.ok){
            return true; 
        }
    } catch(error) {
        console.log("Failed to add entry", error)
    }
}

export const deleteEntry = async (id) => {
    const token = await getToken();
    try {
        const response = await fetch(`${BASEURL}/api/delete-journal-entry`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': token ? `Bearer ${token}` : '',
            },
            body: JSON.stringify({ id }),
        });
        if (response.ok) return true;
    } catch (error) {
        console.log('Failed to delete entry', error);
    }
}

export const getEntries = async () => {
    const token = await getToken(); 
    try {
        const response = await fetch(`${BASEURL}/api/journal/`, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': token ? `Bearer ${token}` : '',
            },
        })
        if(response.ok){
            const data = await response.json(); 
            return data; 
        }
    } catch(error){
        console.log("Failed to get entries", error); 
    }
}