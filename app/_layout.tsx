// C:\Users\Pedro\.gemini\antigravity\scratch\edu-app\app\_layout.tsx
import { useEffect } from 'react';
import { Stack, useRouter, Slot } from 'expo-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useAuthStore } from '../store/useAuthStore';

// Create a client
const queryClient = new QueryClient();

export default function RootLayout() {
    const router = useRouter();
    const { isAuthenticated, user } = useAuthStore();

    useEffect(() => {
        // Basic Route Protection
        if (!isAuthenticated) {
            router.replace('/(auth)/login');
        } else {
            // Simple role-based redirect for demo purposes
            // In a real app, you might just let them stay on the current path/ go to home
            if (user?.role === 'tutor') {
                router.replace('/(dashboard)/tutor');
            }
            // Add other role redirects here
        }
    }, [isAuthenticated, user]);

    return (
        <QueryClientProvider client={queryClient}>
            <SafeAreaProvider>
                <Stack screenOptions={{ headerShown: false }}>
                    <Stack.Screen name="(auth)/login" options={{ headerShown: false }} />
                    <Stack.Screen name="(dashboard)" options={{ headerShown: false }} />
                </Stack>
            </SafeAreaProvider>
        </QueryClientProvider>
    );
}
