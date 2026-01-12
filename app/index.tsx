import { Redirect } from 'expo-router';
import { useAuthStore } from '../store/useAuthStore';

export default function Index() {
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
    const user = useAuthStore((state) => state.user);

    if (!isAuthenticated) {
        return <Redirect href="/(auth)/login" />;
    }

    // --- Ruteo por Roles ---
    if (user?.role === 'rector') {
        return <Redirect href="/(dashboard)/rector" />;
    }

    if (user?.role === 'student') {
        return <Redirect href="/(dashboard)/student" />;
    }

    if (user?.role === 'docente') {
        return <Redirect href="/(dashboard)/teacher" />;
    }

    // Por defecto, si no es ninguno de los anteriores, va a tutor
    return <Redirect href="/(dashboard)/tutor" />;
}