import { Redirect } from 'expo-router';
import { useAuthStore } from '../store/useAuthStore';

export default function Index() {
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
    const user = useAuthStore((state) => state.user);

    // Si no está autenticado, va al Login
    if (!isAuthenticated) {
        return <Redirect href="/(auth)/login" />;
    }

    // Role-based routing
    if (user?.role === 'rector') {
        return <Redirect href="/(dashboard)/rector" />;
    }

    // Default to tutor dashboard for tutors and other roles
    return <Redirect href="/(dashboard)/tutor" />;
}