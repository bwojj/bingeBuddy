import { getToken } from "./authStorage";

const BASEURL = 'https://bingebuddy-production.up.railway.app';

export const sendChatMessage = async (message, sessionId) => {
    const token = await getToken();
    try {
        const response = await fetch(`${BASEURL}/api/chat`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': token ? `Bearer ${token}` : '',
            },
            credentials: 'include',
            body: JSON.stringify({ message, 'session-id': sessionId }),
        });
        if (response.ok) {
            const data = await response.json();
            return { success: true, reply: data['ai-message'], sessionId: data['session-id'] };
        }
        return { success: false };
    } catch (error) {
        console.log('Failed to send chat message', error);
        return { success: false };
    }
};
