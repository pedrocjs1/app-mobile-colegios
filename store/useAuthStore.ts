import { create } from 'zustand';
// Se agrega getUserProfile a las importaciones de authService
import { signInWithEmail, signOut, getUserProfile } from '../services/authService';
// Se importa el cliente de supabase para manejar el refresco de tokens
import { supabase, isSupabaseConfigured } from '../services/supabaseClient';

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

// Usuarios demo para probar sin Supabase
const DEMO_USERS: Record<string, User> = {
    'rector@demo.com': {
        id: 'demo-rector-1',
        name: 'Carlos Director',
        email: 'rector@demo.com',
        role: 'rector',
        school_id: 'demo-school-1',
    },
    'docente@demo.com': {
        id: 'demo-docente-1',
        name: 'María Profesora',
        email: 'docente@demo.com',
        role: 'docente',
        school_id: 'demo-school-1',
    },
    'preceptor@demo.com': {
        id: 'demo-preceptor-1',
        name: 'Juan Preceptor',
        email: 'preceptor@demo.com',
        role: 'preceptor',
        school_id: 'demo-school-1',
    },
    'tutor@demo.com': {
        id: 'demo-tutor-1',
        name: 'Ana Mamá',
        email: 'tutor@demo.com',
        role: 'tutor',
        school_id: 'demo-school-1',
    },
    'alumno@demo.com': {
        id: 'demo-student-1',
        name: 'Lucas Alumno',
        email: 'alumno@demo.com',
        role: 'student',
        school_id: 'demo-school-1',
    },
};

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,

    setUser: (user) => set({ user, isAuthenticated: !!user }),

    loginWithEmail: async (email: string, password: string) => {
        set({ isLoading: true, error: null });

        // Si Supabase no está configurado, usar usuarios demo offline
        if (!isSupabaseConfigured()) {
            const demoUser = DEMO_USERS[email.toLowerCase()];
            if (demoUser && password === '123456') {
                set({ user: demoUser, isAuthenticated: true, isLoading: false, error: null });
                return true;
            }
            set({
                isLoading: false,
                error: demoUser ? 'Contraseña incorrecta (usa: 123456)' : 'Usuario no encontrado. Usá los emails demo: rector@demo.com, docente@demo.com, etc.',
                isAuthenticated: false, user: null,
            });
            return false;
        }

        // Supabase está configurado: login real
        try {
            const { user, error } = await signInWithEmail(email, password);

            if (error) {
                // Si hay error de conexión, intentar con usuarios demo como fallback
                const demoUser = DEMO_USERS[email.toLowerCase()];
                if (demoUser && password === '123456') {
                    console.warn('Using demo fallback due to connection error');
                    set({ user: demoUser, isAuthenticated: true, isLoading: false, error: null });
                    return true;
                }
                set({ isLoading: false, error: error.message, isAuthenticated: false, user: null });
                return false;
            }

            if (user) {
                set({ user: user as User, isAuthenticated: true, isLoading: false, error: null });
                return true;
            }

            set({ isLoading: false, error: 'Email o contraseña incorrectos', isAuthenticated: false, user: null });
            return false;
        } catch (error) {
            console.error('Login error:', error);
            // Fallback a demo si hay error de red
            const demoUser = DEMO_USERS[email.toLowerCase()];
            if (demoUser && password === '123456') {
                set({ user: demoUser, isAuthenticated: true, isLoading: false, error: null });
                return true;
            }
            set({ isLoading: false, error: 'Error al conectar con el servidor', isAuthenticated: false, user: null });
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

        // Si Supabase no está configurado, ir directo al login
        if (!isSupabaseConfigured()) {
            set({ user: null, isAuthenticated: false, isLoading: false });
            return;
        }

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