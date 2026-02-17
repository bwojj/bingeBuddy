import {Stack, Redirect } from 'expo-router'
import { useState } from 'react';
import { authenticated } from '../components/AuthApi.js'

const RootLayout = () => {

    const [isAuthenticated, setIsAuthenticated] = useState(false); 

    setIsAuthenticated(authenticated); 

    return(
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(auth)" redirect={isAuthenticated}/>
            <Stack.Screen name="(main)" redirect={!isAuthenticated}/>
        </Stack>
    );
}

export default RootLayout