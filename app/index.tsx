import { Redirect } from 'expo-router';
import { useAuthStore } from '../store/useAuthStore';

export default function Index() {
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

    // Si no está autenticado, va al Login. Si ya está, va al Dashboard.
    if (!isAuthenticated) {
        return <Redirect href="/(auth)/login" />;
    }

    return <Redirect href="/(dashboard)/tutor" />;
}