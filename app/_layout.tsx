import { useEffect, useState, useMemo, useRef } from 'react';
import { Stack, useRouter, useRootNavigationState, useSegments } from 'expo-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useAuthStore } from '../store/useAuthStore';
import { ActivityIndicator, View, Text } from 'react-native';

const queryClient = new QueryClient();

export default function RootLayout() {
    const router = useRouter();
    const segments = useSegments();
    const navigationState = useRootNavigationState();
    const { isAuthenticated, user, checkSession, isLoading } = useAuthStore();
    const [isReady, setIsReady] = useState(false);
    const [sessionChecked, setSessionChecked] = useState(false);

    // ✅ FIX: Serializar segments para evitar re-renders infinitos
    // useMemo asegura que segmentsKey solo cambia cuando el contenido real cambia
    const segmentsKey = useMemo(() => segments.join('/'), [segments]);

    // Referencia para rastrear la última ruta navegada y evitar redirecciones duplicadas
    const lastNavigatedRoute = useRef<string | null>(null);

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

        // --- LÓGICA DE NAVEGACIÓN SEGURA ---
        // Verificamos si ya estamos dentro de alguna de las carpetas de rol
        const inAuthGroup = segments.includes('(auth)');
        const isAtRector = segments.includes('rector');
        const isAtTeacher = segments.includes('teacher');
        const isAtTutor = segments.includes('tutor');

        // ✅ FIX: Guarda para evitar navegación a rutas donde ya estamos
        const navigateTo = (route: string) => {
            if (lastNavigatedRoute.current === route) return; // Ya navegamos aquí
            lastNavigatedRoute.current = route;
            router.replace(route);
        };

        if (!isAuthenticated) {
            // Si no está autenticado y no está en login, mandarlo a login
            if (!inAuthGroup) {
                navigateTo('/login');
            }
        } else if (user) {
            const role = user.role;

            // --- LÓGICA ANTI-BUCLE MEJORADA ---
            // Solo redirige si el usuario NO está ya en su carpeta correspondiente
            // Y si no acabamos de navegar a esa ruta
            if (role === 'rector' && !isAtRector) {
                console.log("🚀 Redirigiendo a Rector...");
                navigateTo('/rector');
            }
            else if (role === 'docente' && !isAtTeacher) {
                console.log("🚀 Redirigiendo a Docente...");
                navigateTo('/teacher');
            }
            else if (role === 'tutor' && !isAtTutor) {
                console.log("🚀 Redirigiendo a Tutor...");
                navigateTo('/tutor');
            }
            // ✅ Si llegamos aquí, el usuario está en la ruta correcta - limpiar referencia
            else {
                lastNavigatedRoute.current = null;
            }
        }
    }, [isAuthenticated, user, isReady, sessionChecked, isLoading, segmentsKey]);

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