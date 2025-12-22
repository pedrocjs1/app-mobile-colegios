import { useEffect, useState } from 'react';
import { Stack, useRouter, useRootNavigationState } from 'expo-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useAuthStore } from '../store/useAuthStore';

const queryClient = new QueryClient();

export default function RootLayout() {
    const router = useRouter();
    const navigationState = useRootNavigationState();
    const { isAuthenticated, user } = useAuthStore();
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        // 1. Verificamos si el navegador ya existe en memoria
        if (!navigationState?.key) return;

        // 2. Si ya está listo, marcamos que podemos navegar
        setIsReady(true);
    }, [navigationState?.key]);

    useEffect(() => {
        // 3. SOLO navegamos si el navegador está listo (isReady)
        if (!isReady) return;

        if (!isAuthenticated) {
            router.replace('/(auth)/login');
        } else if (user?.role === 'tutor') {
            router.replace('/(dashboard)/tutor');
        }
    }, [isAuthenticated, user, isReady]);

    // IMPORTANTE: Siempre debemos retornar el Stack para que el Root Layout se monte
    return (
        <QueryClientProvider client={queryClient}>
            <SafeAreaProvider>
                <Stack screenOptions={{ headerShown: false }}>
                    {/* Definimos las rutas principales */}
                    <Stack.Screen name="(auth)/login" options={{ headerShown: false }} />
                    <Stack.Screen name="(dashboard)" options={{ headerShown: false }} />
                </Stack>
            </SafeAreaProvider>
        </QueryClientProvider>
    );
}