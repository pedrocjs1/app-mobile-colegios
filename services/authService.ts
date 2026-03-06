import { supabase, isSupabaseConfigured } from './supabaseClient';
import { User, UserRole } from '../store/useAuthStore';

export interface AuthError { message: string; code?: string; }
export interface AuthResponse { user: User | null; error: AuthError | null; }

/** * INICIAR SESIÓN
 * Primero intenta Supabase Auth. Si falla, usa login directo contra tabla 'users'.
 * En desarrollo, password "123456" funciona para todos los usuarios de la tabla users.
 */
export async function signInWithEmail(email: string, password: string): Promise<AuthResponse> {
    try {
        if (!isSupabaseConfigured()) return { user: null, error: { message: 'Falta configuración de Supabase' } };

        const cleanEmail = email.trim().toLowerCase();

        // Intentar primero Supabase Auth (para usuarios registrados en Auth)
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
            email: cleanEmail,
            password
        });

        if (!authError && authData.user) {
            // Login exitoso con Supabase Auth
            const userProfile = await getUserProfile(authData.user.id);
            return { user: userProfile, error: userProfile ? null : { message: 'Perfil no encontrado en la base de datos' } };
        }

        // Si Supabase Auth falla, intentar login directo contra tabla 'users'
        // (Modo desarrollo: password 123456 para todos)
        console.log('Supabase Auth failed, trying direct login...');
        const directUser = await signInDirect(cleanEmail, password);
        if (directUser) {
            return { user: directUser, error: null };
        }

        return { user: null, error: { message: 'Email o contraseña incorrectos' } };
    } catch (error) {
        console.error('Error en signInWithEmail:', error);
        return { user: null, error: { message: 'Error de conexión con el servidor' } };
    }
}

/** * LOGIN DIRECTO (Desarrollo)
 * Busca el usuario en la tabla 'users' por email.
 * Acepta password "123456" para desarrollo.
 * En producción, remover este método y usar solo Supabase Auth.
 */
async function signInDirect(email: string, password: string): Promise<User | null> {
    // Solo aceptar password de desarrollo
    if (password !== '123456') return null;

    try {
        const { data, error } = await supabase
            .from('users')
            .select('id, name, email, role:role_id, school_id, avatar_url')
            .eq('email', email)
            .eq('is_active', true)
            .single();

        if (error || !data) return null;

        // Mapear role_id a UserRole
        const roleMap: Record<string, UserRole> = {
            'role-rector': 'rector',
            'role-docente': 'docente',
            'role-preceptor': 'preceptor',
            'role-tutor': 'tutor',
            'role-student': 'student',
        };

        const role = roleMap[data.role as string] || (data.role as UserRole);

        return {
            id: data.id,
            name: data.name,
            email: data.email,
            role: role,
            school_id: data.school_id,
            avatar_url: data.avatar_url || undefined,
        };
    } catch (e) {
        console.error('Error en signInDirect:', e);
        return null;
    }
}

/** * OBTENER PERFIL 
 * Busca los datos extendidos del usuario (rol, escuela, etc.) en la tabla 'users'.
 */
export async function getUserProfile(userId: string): Promise<User | null> {
    try {
        const { data, error } = await supabase
            .from('users')
            .select('id, name, email, role_id, school_id, avatar_url')
            .eq('id', userId)
            .single();

        if (error || !data) return null;

        // Map role_id to UserRole
        const roleMap: Record<string, UserRole> = {
            'role-rector': 'rector',
            'role-docente': 'docente',
            'role-preceptor': 'preceptor',
            'role-tutor': 'tutor',
            'role-student': 'student',
        };

        return {
            id: data.id,
            name: data.name,
            email: data.email,
            role: roleMap[data.role_id] || (data.role_id as UserRole),
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