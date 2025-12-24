// services/databaseService.ts
// Handles all database queries with Supabase

import { supabase } from './supabaseClient';
import {
    Institution,
    Student,
    StaffMember,
    Family
} from './mockDatabase';

// ============================================
// INSTITUTION & METRICS QUERIES
// ============================================

/** Obtener detalles de la institución */
export async function getInstitution(schoolId: string): Promise<Institution | null> {
    try {
        const { data, error } = await supabase
            .from('institutions')
            .select('*')
            .eq('id', schoolId)
            .single();

        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Get institution error:', error);
        return null;
    }
}

/** Obtener métricas para el dashboard del Rector */
export async function getSchoolMetrics(schoolId: string) {
    try {
        const { count: studentsCount } = await supabase
            .from('students')
            .select('*', { count: 'exact', head: true })
            .eq('school_id', schoolId)
            .eq('is_active', true);

        const { count: staffCount } = await supabase
            .from('users')
            .select('*', { count: 'exact', head: true })
            .eq('school_id', schoolId)
            .in('role_id', ['docente', 'preceptor'])
            .eq('is_active', true);

        return {
            totalStudents: studentsCount || 0,
            totalStaff: staffCount || 0,
            attendanceRate: 94.5,
            pendingRegistrations: 0,
        };
    } catch (error) {
        console.error('Get metrics error:', error);
        return { totalStudents: 0, totalStaff: 0, attendanceRate: 0, pendingRegistrations: 0 };
    }
}

// ============================================
// STAFF MANAGEMENT (RECTOR)
// ============================================

/** Obtener lista de personal filtrada por escuela y rol */
export async function getStaff(schoolId: string): Promise<StaffMember[]> {
    try {
        const { data, error } = await supabase
            .from('users')
            .select('id, school_id, name, email, phone, role:role_id, avatar_url, is_active')
            .eq('school_id', schoolId)
            .in('role_id', ['docente', 'preceptor'])
            .order('name', { ascending: true });

        if (error) throw error;
        return (data || []) as unknown as StaffMember[];
    } catch (error) {
        console.error('Get staff error:', error);
        return [];
    }
}

/** Cambiar el estado de actividad de un miembro del personal */
export async function toggleStaffStatus(userId: string, newStatus: boolean) {
    const { data, error } = await supabase
        .from('users')
        .update({ is_active: newStatus })
        .eq('id', userId)
        .select()
        .single();

    if (error) throw error;
    return data;
}

/** Registrar nuevo docente o preceptor (Perfil Inicial) */
export async function createStaffMember(staffData: {
    school_id: string;
    name: string;
    email: string;
    role_id: 'docente' | 'preceptor';
    phone?: string;
}) {
    const { data, error } = await supabase
        .from('users')
        .insert([{
            id: `temp_${Math.random().toString(36).substr(2, 9)}`,
            ...staffData,
            is_active: true
        }])
        .select()
        .single();

    if (error) throw error;
    return data;
}

/** Actualizar ID tras registro en Auth */
export async function updateUserAuthId(oldId: string, newAuthId: string) {
    const { data, error } = await supabase
        .from('users')
        .update({ id: newAuthId })
        .eq('id', oldId)
        .select()
        .single();

    if (error) throw error;
    return data;
}

// ============================================
// SUBJECTS & ACADEMIC ASSIGNMENTS
// ============================================

export async function getAllSubjects(schoolId: string) {
    const { data, error } = await supabase
        .from('subjects')
        .select('*')
        .eq('school_id', schoolId)
        .order('grade', { ascending: true });

    if (error) throw error;
    return data || [];
}

export async function getTeacherSubjects(teacherId: string) {
    const { data, error } = await supabase
        .from('teacher_subjects')
        .select(`
            subject_id,
            subjects!inner (id, name, grade, section)
        `)
        .eq('teacher_id', teacherId);

    if (error) throw error;
    return data.map(item => item.subjects);
}

export async function assignSubjectToTeacher(schoolId: string, teacherId: string, subjectId: string) {
    const { data, error } = await supabase
        .from('teacher_subjects')
        .insert([{
            school_id: schoolId,
            teacher_id: teacherId,
            subject_id: subjectId
        }]);

    if (error) {
        if (error.code === '23505') throw new Error('Esta materia ya está asignada a este docente.');
        throw error;
    }
    return data;
}

export async function unassignSubjectFromTeacher(teacherId: string, subjectId: string) {
    const { error } = await supabase
        .from('teacher_subjects')
        .delete()
        .eq('teacher_id', teacherId)
        .eq('subject_id', subjectId);

    if (error) throw error;
    return true;
}

// ============================================
// DOCENTE: ACCIONES Y ALUMNOS
// ============================================

export async function getStudentsByClass(schoolId: string, grade: string, section: string): Promise<Student[]> {
    try {
        const { data, error } = await supabase
            .from('students')
            .select('*')
            .eq('school_id', schoolId)
            .eq('grade', grade)
            .eq('section', section)
            .eq('is_active', true);

        if (error) throw error;
        return (data || []) as Student[];
    } catch (error) {
        console.error('Get students by class error:', error);
        return [];
    }
}

export async function createSanction(sanctionData: {
    school_id: string;
    student_id: string;
    type: string;
    description: string;
    issued_by: string;
}) {
    const { data, error } = await supabase
        .from('sanctions')
        .insert([{
            id: `sanc_${Date.now()}`,
            date: new Date().toISOString().split('T')[0],
            resolved: false,
            ...sanctionData
        }])
        .select()
        .single();

    if (error) throw error;
    return data;
}

// ============================================
// STUDENTS & FAMILIES
// ============================================

export async function getStudents(schoolId: string): Promise<Student[]> {
    const { data, error } = await supabase
        .from('students')
        .select('*')
        .eq('school_id', schoolId)
        .eq('is_active', true);

    if (error) return [];
    return (data || []) as Student[];
}

export async function getFamilies(schoolId: string): Promise<Family[]> {
    try {
        const { data: tutors, error: tutorsError } = await supabase
            .from('users')
            .select('id, name, email')
            .eq('school_id', schoolId)
            .eq('role_id', 'tutor')
            .eq('is_active', true);

        if (tutorsError || !tutors) return [];

        const families: Family[] = [];
        for (const tutor of tutors) {
            const { data: rels } = await supabase
                .from('family_relationships')
                .select('students!inner(*)')
                .eq('tutor_id', tutor.id);

            families.push({
                id: `family_${tutor.id}`,
                school_id: schoolId,
                tutor_id: tutor.id,
                tutor_name: tutor.name,
                tutor_email: tutor.email,
                students: (rels?.map(r => r.students) || []) as unknown as Student[]
            });
        }
        return families;
    } catch (error) {
        console.error('Get families error:', error);
        return [];
    }
}

export async function createFamilyMember(data: { school_id: string; name: string; email: string }) {
    const { data: family, error } = await supabase
        .from('users')
        .insert([{
            ...data,
            role_id: 'tutor',
            is_active: true,
            id: `temp_fam_${Math.random().toString(36).substr(2, 9)}`
        }])
        .select()
        .single();

    if (error) throw error;
    return family;
}

export async function searchStudents(schoolId: string, query: string) {
    const { data, error } = await supabase
        .from('students')
        .select('*')
        .eq('school_id', schoolId)
        .ilike('last_name', `%${query}%`)
        .limit(10);

    if (error) throw error;
    return data || [];
}

export async function linkStudentToFamily(tutorId: string, studentId: string) {
    const { error } = await supabase
        .from('family_relationships')
        .insert([{ tutor_id: tutorId, student_id: studentId }]);

    if (error) {
        if (error.code === '23505') throw new Error('Este alumno ya está vinculado a esta familia.');
        throw error;
    }
    return true;
}

export async function unlinkStudentFromFamily(tutorId: string, studentId: string) {
    const { error } = await supabase
        .from('family_relationships')
        .delete()
        .eq('tutor_id', tutorId)
        .eq('student_id', studentId);

    if (error) throw error;
    return true;
}

/** * ✅ REGISTRAR UN NUEVO ALUMNO Y VINCULARLO AUTOMÁTICAMENTE
 * ACTUALIZADO: Ahora procesa email y password
 */
export async function createAndLinkStudent(studentData: {
    school_id: string;
    first_name: string;
    last_name: string;
    grade: string;
    section: string;
    email: string;      // Nuevo campo
    password: string;   // Nuevo campo
    tutor_id: string;
}) {
    // Generar IDs únicos manuales para VARCHAR
    const studentId = `stu_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    const relationshipId = `rel_${Date.now()}`;

    console.log("========================================");
    console.log("🚀 createAndLinkStudent INICIANDO");
    console.log("📦 Datos recibidos:", JSON.stringify(studentData, null, 2));

    try {
        // 1. Insertar en tabla 'students'
        const studentPayload = {
            id: studentId,
            school_id: studentData.school_id,
            first_name: studentData.first_name,
            last_name: studentData.last_name,
            grade: studentData.grade,
            section: studentData.section,
            email: studentData.email,       // ✅ Guardamos email
            password: studentData.password, // ✅ Guardamos contraseña
            is_active: true
        };

        console.log("📝 PASO 1: Insertando alumno...");
        const { data: student, error: studentError } = await supabase
            .from('students')
            .insert([studentPayload])
            .select()
            .single();

        if (studentError) {
            console.error("❌ ERROR SUPABASE (students):", studentError);
            throw new Error(studentError.message);
        }

        // 2. Crear relación familiar
        const relationshipPayload = {
            id: relationshipId,
            school_id: studentData.school_id,
            tutor_id: studentData.tutor_id,
            student_id: studentId
        };

        console.log("📝 PASO 2: Vinculando con tutor...");
        const { error: linkError } = await supabase
            .from('family_relationships')
            .insert([relationshipPayload]);

        if (linkError) {
            console.error("❌ ERROR SUPABASE (relación):", linkError);
            throw new Error(linkError.message);
        }

        console.log("✅ Proceso completado con éxito");
        return student;

    } catch (error: any) {
        console.error("💥 FALLÓ createAndLinkStudent:", error);
        throw error;
    }
}

// ============================================
// RECENT ACTIVITY
// ============================================

export async function getRecentActivity(schoolId: string) {
    try {
        const { data: announcements } = await supabase
            .from('announcements')
            .select('id, title, type, created_at')
            .eq('school_id', schoolId)
            .eq('is_active', true)
            .order('created_at', { ascending: false })
            .limit(5);

        return (announcements || []).map(ann => ({
            id: ann.id,
            type: 'announcement',
            description: ann.title,
            timestamp: ann.created_at || new Date().toISOString(),
            icon: 'Bell' as const,
        }));
    } catch (error) {
        console.error('Get activity error:', error);
        return [];
    }
}