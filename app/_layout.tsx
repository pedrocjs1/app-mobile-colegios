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
    const segmentsKey = useMemo(() => segments.join('/'), [segments]);

    // Referencia para rastrear la última ruta y evitar redirecciones duplicadas
    const lastNavigatedRoute = useRef<string | null>(null);

    // 1. Inicializar la sesión al cargar la app
    useEffect(() => {
        const initSession = async () => {
            await checkSession();
            setSessionChecked(true);
        };
        initSession();
    }, []);

    // 2. Verificar que el estado de navegación de Expo esté listo
    useEffect(() => {
        if (!navigationState?.key) return;
        setIsReady(true);
    }, [navigationState?.key]);

    // 3. Lógica principal de protección de rutas y redirección por roles
    useEffect(() => {
        if (!isReady || !sessionChecked || isLoading) return;

        // Verificamos en qué carpeta estamos actualmente
        const inAuthGroup = segments.includes('(auth)');
        const isAtRector = segments.includes('rector');
        const isAtTeacher = segments.includes('teacher');
        const isAtTutor = segments.includes('tutor');
        const isAtStudent = segments.includes('student'); // 🚀 Agregado para alumnos

        const navigateTo = (route: string) => {
            if (lastNavigatedRoute.current === route) return;
            lastNavigatedRoute.current = route;
            router.replace(route as any);
        };

        // --- LÓGICA DE REDIRECCIÓN ---
        if (!isAuthenticated) {
            // Si no está logueado, siempre al login
            if (!inAuthGroup) {
                navigateTo('/(auth)/login');
            }
        } else if (user) {
            const role = user.role;

            // Redirigir según el rol solo si NO estamos ya en la carpeta correcta
            if (role === 'rector' && !isAtRector) {
                console.log("🚀 Navegando a zona Rector");
                navigateTo('/rector');
            }
            else if (role === 'docente' && !isAtTeacher) {
                console.log("🚀 Navegando a zona Docente");
                navigateTo('/teacher');
            }
            else if (role === 'tutor' && !isAtTutor) {
                console.log("🚀 Navegando a zona Tutor");
                navigateTo('/tutor');
            }
            else if (role === 'student' && !isAtStudent) {
                console.log("🚀 Navegando a zona Alumno");
                navigateTo('/student'); // 🚀 Redirección para Pedrito Junior
            }
            else {
                // Ya está en su lugar, limpiar referencia para permitir futuros cambios
                lastNavigatedRoute.current = null;
            }
        }
    }, [isAuthenticated, user, isReady, sessionChecked, isLoading, segmentsKey]);

    // Pantalla de carga inicial (Splash Screen personalizado)
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