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

        if (!isAuthenticated) {
            router.replace('/login');
        } else {
            const role = user?.role as any;
            console.log("🚀 Redirigiendo Usuario:", user?.name, "Rol:", role);

            // Usamos rutas absolutas con /(dashboard)/ para forzar la entrada correcta
            if (role === 'rector') {
                router.replace('/(dashboard)/rector');
            } else if (role === 'docente') {
                router.replace('/(dashboard)/teacher');
            } else if (role === 'tutor') {
                router.replace('/(dashboard)/tutor');
            } else {
                router.replace('/login');
            }
        }
    }, [isAuthenticated, user, isReady, sessionChecked, isLoading]);

    if (!sessionChecked || isLoading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFFFFF' }}>
                <ActivityIndicator size="large" color="#6366F1" />
                <Text style={{ marginTop: 15, color: '#6366F1', fontWeight: 'bold' }}>Violet Wave EDU</Text>
                <Text style={{ color: '#94A3B8', fontSize: 12 }}>Sincronizando portal...</Text>
            </View>
        );
    }

    return (
        <QueryClientProvider client={queryClient}>
            <SafeAreaProvider>
                <Stack screenOptions={{ headerShown: false }}>
                    <Stack.Screen name="(auth)/login" />
                    <Stack.Screen name="(dashboard)" />
                </Stack>
            </SafeAreaProvider>
        </QueryClientProvider>
    );
}