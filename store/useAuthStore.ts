import { create } from 'zustand';
// Se agrega getUserProfile a las importaciones de authService
import { signInWithEmail, signOut, getUserProfile } from '../services/authService';
// Se importa el cliente de supabase para manejar el refresco de tokens
import { supabase } from '../services/supabaseClient';

// Tipos de roles que coinciden exactamente con la base de datos
export type UserRole = 'rector' | 'docente' | 'preceptor' | 'tutor' | 'student';

export interface User {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    school_id: string; // Crítico para la arquitectura Multi-tenant
    avatar_url?: string;
}

interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
    setUser: (user: User | null) => void;
    loginWithEmail: (email: string, password: string) => Promise<boolean>;
    logout: () => Promise<void>;
    clearAuth: () => void;
    checkSession: () => Promise<void>;
    clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,

    /**
     * Actualiza el usuario manualmente en el estado
     */
    setUser: (user) => set({ user, isAuthenticated: !!user }),

    /**
     * Iniciar sesión con Supabase
     */
    loginWithEmail: async (email: string, password: string) => {
        set({ isLoading: true, error: null });

        try {
            const { user, error } = await signInWithEmail(email, password);

            if (error) {
                set({
                    isLoading: false,
                    error: error.message,
                    isAuthenticated: false,
                    user: null
                });
                return false;
            }

            if (user) {
                set({
                    user: user as User,
                    isAuthenticated: true,
                    isLoading: false,
                    error: null
                });
                return true;
            }

            set({
                isLoading: false,
                error: 'Error desconocido al iniciar sesión',
                isAuthenticated: false,
                user: null
            });
            return false;
        } catch (error) {
            console.error('Login error:', error);
            set({
                isLoading: false,
                error: 'Error al conectar con el servidor',
                isAuthenticated: false,
                user: null
            });
            return false;
        }
    },

    /**
     * Cerrar sesión (Lógica asíncrona con el servidor)
     */
    logout: async () => {
        set({ isLoading: true });
        try {
            await signOut();
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            // Siempre reseteamos el estado local pase lo que pase con la red
            set({
                user: null,
                isAuthenticated: false,
                isLoading: false,
                error: null
            });
        }
    },

    /**
     * Limpiar estado de autenticación (Lógica síncrona local)
     */
    clearAuth: () => set({
        user: null,
        isAuthenticated: false,
        error: null
    }),

    /**
     * Verificar sesión activa al arrancar la app
     */
    checkSession: async () => {
        set({ isLoading: true });

        try {
            // Usamos getSession directamente para detectar tokens corruptos
            const { data: { session }, error } = await supabase.auth.getSession();

            if (error || !session) {
                // Si el token es inválido (ej. Refresh Token Not Found), cerramos sesión
                if (error?.message.includes("Refresh Token")) {
                    await signOut();
                }
                set({ user: null, isAuthenticated: false, isLoading: false });
                return;
            }

            // Si hay sesión válida, obtenemos el perfil del usuario de la DB
            const profile = await getUserProfile(session.user.id);

            set({
                user: profile as User,
                isAuthenticated: !!profile,
                isLoading: false
            });
        } catch (error) {
            console.error('Session check error:', error);
            set({ isLoading: false, isAuthenticated: false, user: null });
        }
    },

    /**
     * Limpiar mensajes de error de la interfaz
     */
    clearError: () => set({ error: null }),
}));