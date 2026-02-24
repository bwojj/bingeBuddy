import * as SecureStore from 'expo-secure-store'

// defines token to access 
const TOKEN_KEY = 'access_token'; 

// creates function to get token 
export const getToken = async () => {
    try{
        return await SecureStore.getItemAsync(TOKEN_KEY);
    } catch(error) {
        console.log('Failed to get', error);
        return null; 
    }
}

// creates function to set token 
export const setToken = async (token) => {
    try {
        await SecureStore.setItemAsync(TOKEN_KEY, token); 
        return true; 
    } catch (error) {
        console.log("Failed to set", error); 
        return false; 
    }
}

// creates function to delete token 
export const delToken = async () => {
    await SecureStore.deleteItemAsync(TOKEN_KEY); 
}