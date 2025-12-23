import { useEffect, useState } from 'react';
import { Stack, useRouter, useRootNavigationState } from 'expo-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useAuthStore } from '../store/useAuthStore';
import { ActivityIndicator, View, Text } from 'react-native';

const queryClient = new QueryClient();

export default function RootLayout() {
    const router = useRouter();
    const navigationState = useRootNavigationState();
    const { isAuthenticated, user, checkSession, isLoading } = useAuthStore();
    const [isReady, setIsReady] = useState(false);
    const [sessionChecked, setSessionChecked] = useState(false);

    useEffect(() => {
        const initSession = async () => {
            await checkSession();
            setSessionChecked(true);
        };
        initSession();
    }, []);

    useEffect(() => {
        if (!navigationState?.key) return;
        setIsReady(true);
    }, [navigationState?.key]);

    useEffect(() => {
        if (!isReady || !sessionChecked || isLoading) return;

        // --- LÓGICA DE PROTECCIÓN DE RUTAS ---
        if (!isAuthenticated) {
            // Si no hay sesión, vamos al login. 
            // Usamos una ruta absoluta simple.
            router.replace('/login');
        } else if (user) {
            const role = user.role;
            console.log("🚀 Redirigiendo por rol:", role);

            if (role === 'rector') {
                router.replace('/rector');
            } else if (role === 'docente') {
                router.replace('/teacher');
            } else if (role === 'tutor') {
                router.replace('/tutor');
            }
        }
    }, [isAuthenticated, isReady, sessionChecked, isLoading]);

    if (!sessionChecked || isLoading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFFFFF' }}>
                <ActivityIndicator size="large" color="#6366F1" />
                <Text style={{ marginTop: 15, color: '#6366F1', fontWeight: 'bold' }}>Violet Wave EDU</Text>
            </View>
        );
    }

    return (
        <QueryClientProvider client={queryClient}>
            <SafeAreaProvider>
                <Stack screenOptions={{ headerShown: false }} />
            </SafeAreaProvider>
        </QueryClientProvider>
    );
}