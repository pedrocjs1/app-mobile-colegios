import { supabase, isSupabaseConfigured } from './supabaseClient';
import { User, UserRole } from '../store/useAuthStore';

export interface AuthError { message: string; code?: string; }
export interface AuthResponse { user: User | null; error: AuthError | null; }

/** * INICIAR SESIÓN 
 * Valida credenciales y recupera el perfil completo del usuario desde la tabla pública.
 */
export async function signInWithEmail(email: string, password: string): Promise<AuthResponse> {
    try {
        if (!isSupabaseConfigured()) return { user: null, error: { message: 'Falta configuración de Supabase' } };

        const cleanEmail = email.trim().toLowerCase();
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
            email: cleanEmail,
            password
        });

        if (authError) return { user: null, error: { message: authError.message, code: authError.code } };
        if (!authData.user) return { user: null, error: { message: 'No se encontró el usuario de autenticación' } };

        const userProfile = await getUserProfile(authData.user.id);
        return { user: userProfile, error: userProfile ? null : { message: 'Perfil no encontrado en la base de datos' } };
    } catch (error) {
        console.error('Error en signInWithEmail:', error);
        return { user: null, error: { message: 'Error de conexión con el servidor' } };
    }
}

/** * OBTENER PERFIL 
 * Busca los datos extendidos del usuario (rol, escuela, etc.) en la tabla 'users'.
 */
export async function getUserProfile(userId: string): Promise<User | null> {
    try {
        const { data, error } = await supabase
            .from('users')
            .select('id, name, email, role:role_id, school_id, avatar_url')
            .eq('id', userId)
            .single();

        if (error || !data) return null;

        return {
            id: data.id,
            name: data.name,
            email: data.email,
            role: data.role as UserRole,
            school_id: data.school_id,
            avatar_url: data.avatar_url || undefined,
        };
    } catch (e) {
        console.error('Error en getUserProfile:', e);
        return null;
    }
}

/** * REGISTRAR ACCESO PARA PERSONAL/TUTORES (Sincronización de IDs)
 * Crea el usuario en Auth y vincula su UUID con el registro temporal de la tabla 'users'.
 */
export async function registerStaffAuth(email: string, password: string, currentId: string): Promise<{ success: boolean; error: string | null }> {
    try {
        const cleanEmail = email.trim().toLowerCase();

        // 1. Crear el usuario en Supabase Auth
        const { data, error: signUpError } = await supabase.auth.signUp({
            email: cleanEmail,
            password: password,
        });

        if (signUpError) {
            if (signUpError.message.includes("already registered")) {
                return { success: false, error: "Este correo ya tiene una cuenta activa." };
            }
            throw signUpError;
        }

        if (!data.user) throw new Error("No se pudo obtener el ID de autenticación.");

        // 2. Vincular con la tabla 'users'
        const { error: updateError } = await supabase
            .from('users')
            .update({ id: data.user.id })
            .eq('id', currentId);

        if (updateError) {
            console.error("Error al vincular ID en tabla users:", updateError);
            throw new Error("Acceso creado, pero falló la vinculación del perfil.");
        }

        return { success: true, error: null };
    } catch (error: any) {
        console.error('Error crítico en registerStaffAuth:', error);
        return { success: false, error: error.message || 'Error desconocido' };
    }
}

/** * ✅ NUEVA FUNCIÓN: REGISTRAR CREDENCIALES DE ALUMNO
 * Registra al alumno en el motor de autenticación para que pueda hacer login.
 */
export async function registerStudentAuth(email: string, password: string) {
    const { data, error } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password: password,
    });
    if (error) throw error;
    return data.user;
}

export async function signOut() {
    return await supabase.auth.signOut();
}

export async function getCurrentSession(): Promise<AuthResponse> {
    try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError || !session?.user) return { user: null, error: null };

        const profile = await getUserProfile(session.user.id);
        return { user: profile, error: profile ? null : { message: 'Sesión activa pero perfil no encontrado' } };
    } catch (e) {
        return { user: null, error: { message: 'Error al recuperar sesión' } };
    }
}