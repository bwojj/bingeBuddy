import {Stack, Redirect } from 'expo-router'
import { useState, useEffect } from 'react';
import { authenticated } from '../components/AuthApi.js'

const RootLayout = () => {

    // defines state for if user is authenticated
    const [isAuthenticated, setIsAuthenticated] = useState(false); 

    // update state on mount 
    useEffect(() => {
        // get result from authenticated API call, set authenticated based on
        const checkAuth = async () => {
            const auth = await authenticated(); 
            setIsAuthenticated(auth); 
        }

        checkAuth(); 
    }, [])

    return(
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(auth)" redirect={isAuthenticated}/>
            <Stack.Screen name="(main)" redirect={!isAuthenticated}/>
        </Stack>
    );
}

export default RootLayout