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
            .in('role_id', ['docente', 'preceptor']);

        if (error) throw error;
        return (data || []) as unknown as StaffMember[];
    } catch (error) {
        console.error('Get staff error:', error);
        return [];
    }
}

/** Registrar nuevo docente o preceptor en la base de datos (Perfil Inicial) */
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

/** * ACTUALIZAR ID DE USUARIO (CRÍTICO PARA AUTH)
 * Vincula el registro de la tabla 'users' con el ID real de Supabase Auth
 */
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

/** Trae todas las materias creadas para una escuela específica */
export async function getAllSubjects(schoolId: string) {
    const { data, error } = await supabase
        .from('subjects')
        .select('*')
        .eq('school_id', schoolId)
        .order('grade', { ascending: true });

    if (error) throw error;
    return data || [];
}

/** Obtiene las materias que tiene asignadas un docente en particular */
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

/** Vincula a un docente con una materia específica */
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

/** Desvincula a un docente de una materia */
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

/** Obtiene alumnos de un curso específico */
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

/** Registrar una sanción o llamado de atención */
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
        const { data: tutors } = await supabase
            .from('users')
            .select('id, name, email')
            .eq('school_id', schoolId)
            .eq('role_id', 'tutor');

        if (!tutors) return [];

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
        return [];
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
        return [];
    }
}