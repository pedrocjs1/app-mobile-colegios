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

/** REGISTRAR ACCESO PARA CUALQUIER USUARIO (DOCENTE O TUTOR) */
export async function registerStaffAuth(email: string, password: string, currentId: string): Promise<{ success: boolean; error: string | null }> {
    try {
        const cleanEmail = email.trim().toLowerCase();

        // 1. Intentar crear el usuario en Auth
        const { data, error: signUpError } = await supabase.auth.signUp({
            email: cleanEmail,
            password: password,
            options: {
                data: { full_name: cleanEmail.split('@')[0] }
            }
        });

        // Si el error es que ya existe, no importa, necesitamos el ID de todas formas
        if (signUpError && !signUpError.message.includes("already registered")) {
            throw signUpError;
        }

        let authId = data.user?.id;

        // Si signUp no devolvió usuario porque ya existía, lo buscamos o usamos el error para informarlo
        if (!authId) {
            // En un entorno real, aquí llamarías a una Edge Function para obtener el ID por email
            // Por ahora, asumimos que es un registro nuevo o lanzamos error claro.
            throw new Error("Este email ya tiene una cuenta activa en el sistema de autenticación.");
        }

        // 2. Vincular con la tabla 'users'
        const { error: updateError } = await supabase
            .from('users')
            .update({ id: authId })
            .eq('id', currentId);

        if (updateError) {
            console.error("Error vinculando tabla users:", updateError);
            throw updateError;
        }

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