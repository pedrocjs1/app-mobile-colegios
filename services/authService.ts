// services/authService.ts - Versión Ultra-Compatible

import { supabase, isSupabaseConfigured } from './supabaseClient';
import { User, UserRole } from '../store/useAuthStore';

export interface AuthError { message: string; code?: string; }
export interface AuthResponse { user: User | null; error: AuthError | null; }

/** INICIAR SESIÓN */
export async function signInWithEmail(email: string, password: string): Promise<AuthResponse> {
    try {
        if (!isSupabaseConfigured()) return { user: null, error: { message: 'Falta configuración de Supabase' } };

        const cleanEmail = email.trim().toLowerCase();
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
            email: cleanEmail,
            password
        });

        if (authError) return { user: null, error: { message: authError.message, code: authError.code } };

        const userProfile = await getUserProfile(authData.user!.id);
        return { user: userProfile, error: userProfile ? null : { message: 'Perfil no encontrado' } };
    } catch (error) {
        return { user: null, error: { message: 'Error de conexión' } };
    }
}

/** OBTENER PERFIL */
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
    } catch (e) { return null; }
}

/** REGISTRAR ACCESO PARA PERSONAL */
export async function registerStaffAuth(email: string, password: string, currentStaffId: string): Promise<{ success: boolean; error: string | null }> {
    try {
        // Limpieza profunda del email (quita espacios al inicio, final y caracteres raros)
        const cleanEmail = email.replace(/\s/g, '').toLowerCase();

        // 1. Crear el usuario en Auth sin perder la sesión del Rector
        const { data, error: signUpError } = await supabase.auth.signUp({
            email: cleanEmail,
            password: password,
            options: {
                // IMPORTANTE: data ayuda a identificar el perfil
                data: { full_name: email.split('@')[0] },
                // Evita que el Rector sea deslogueado al crear al docente
                emailRedirectTo: undefined
            }
        });

        if (signUpError) {
            // Manejo específico para dominios bloqueados
            if (signUpError.message.includes("invalid")) {
                throw new Error("Supabase rechaza este dominio de correo. Intenta con uno común (@gmail, @hotmail) para probar.");
            }
            throw signUpError;
        }

        if (!data.user) throw new Error("No se pudo crear el acceso en el servidor.");

        const newAuthId = data.user.id;

        // 2. Vincular con la tabla users (este paso es vital)
        const { error: updateError } = await supabase
            .from('users')
            .update({ id: newAuthId })
            .eq('id', currentStaffId);

        if (updateError) throw updateError;

        return { success: true, error: null };
    } catch (error: any) {
        console.error('Error al registrar acceso:', error);
        return { success: false, error: error.message };
    }
}

export async function signOut() { return await supabase.auth.signOut(); }

export async function getCurrentSession(): Promise<AuthResponse> {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return { user: null, error: null };
    const profile = await getUserProfile(session.user.id);
    return { user: profile, error: profile ? null : { message: 'Error perfil' } };
}