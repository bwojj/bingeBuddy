
const BASEURL = 'http://127.0.0.1:8000/';

export const authenticated = async () => {
    try {
        const response = await fetch(`${BASEURL}/authenticated`, {
            method: "POST", 
            headers: {
                'Content-Type': 'application/json', 
            }, 
            credentials: 'include', 
        })
        if(response.ok){
            return true
        }
    } catch (_) {
        return false 
    }
}


