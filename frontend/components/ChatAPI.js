import EventSource from 'react-native-sse';
import { getToken } from "./authStorage";

const BASEURL = process.env.EXPO_PUBLIC_API_URL;

export const streamChatMessage = async (message, sessionId, { onToken, onDone, onError }) => {
    const token = await getToken();
    const es = new EventSource(`${BASEURL}/api/chat`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify({ message, 'session-id': sessionId }),
        withCredentials: true,
        pollingInterval: 0, // one-shot request/response, not a persistent stream to reconnect to
    });

    es.addEventListener('message', (event) => {
        let payload;
        try {
            payload = JSON.parse(event.data);
        } catch {
            return;
        }
        if (payload.token) {
            onToken(payload.token);
        } else if (payload.done) {
            onDone(payload['session-id']);
            es.close();
        } else if (payload.error) {
            onError(payload.error);
            es.close();
        }
    });

    es.addEventListener('error', (event) => {
        onError(event.message || 'Connection error');
        es.close();
    });

    return () => es.close();
};

export const getChatSessions = async () => {
    const token = await getToken();
    const res = await fetch(`${BASEURL}/api/chat/sessions`, {
        headers: { 'Authorization': token ? `Bearer ${token}` : '' },
        credentials: 'include',
    });
    if (!res.ok) {
        throw new Error(`getChatSessions failed: ${res.status}`);
    }
    return res.json();
};

export const getSessionMessages = async (sessionId) => {
    const token = await getToken();
    const res = await fetch(`${BASEURL}/api/chat/sessions/${sessionId}/messages`, {
        headers: { 'Authorization': token ? `Bearer ${token}` : '' },
        credentials: 'include',
    });
    if (!res.ok) {
        throw new Error(`getSessionMessages failed: ${res.status}`);
    }
    return res.json();
};

export const addMemory = async ({ memory, causes, text }) => {
    const token = await getToken();
    const res = await fetch(`${BASEURL}/api/add-memory`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify({ memory, causes, text }),
        credentials: 'include',
    });
    const data = await res.json().catch(() => ({}));
    return { ok: res.ok, ...data };
};
