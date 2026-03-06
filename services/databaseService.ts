// services/databaseService.ts
// Handles all database queries with Supabase

import { supabase, isSupabaseConfigured } from './supabaseClient';
import { registerStudentAuth } from './authService';
import {
    Institution,
    Student,
    StaffMember,
    Family,
    Task,
    TaskSubmission,
    Exam,
    Notification,
    AttentionCall,
    Sanction,
    Attendance,
} from './mockDatabase';

// ============================================
// DEMO DATA (when Supabase is not configured)
// ============================================
const DEMO_STUDENTS: Student[] = [
    { id: 'stu-1', user_id: 'demo-student-1', school_id: 'demo-school-1', first_name: 'Lucas', last_name: 'Alumno', grade: '4to', section: 'A', email: 'alumno@demo.com', is_active: true },
    { id: 'stu-2', user_id: 'u-2', school_id: 'demo-school-1', first_name: 'Sofía', last_name: 'García', grade: '4to', section: 'A', email: 'sofia@demo.com', is_active: true },
    { id: 'stu-3', user_id: 'u-3', school_id: 'demo-school-1', first_name: 'Mateo', last_name: 'López', grade: '4to', section: 'A', email: 'mateo@demo.com', is_active: true },
    { id: 'stu-4', user_id: 'u-4', school_id: 'demo-school-1', first_name: 'Valentina', last_name: 'Martínez', grade: '5to', section: 'B', email: 'vale@demo.com', is_active: true },
    { id: 'stu-5', user_id: 'u-5', school_id: 'demo-school-1', first_name: 'Benjamín', last_name: 'Rodríguez', grade: '5to', section: 'B', email: 'benja@demo.com', is_active: true },
];

const DEMO_TASKS: Task[] = [
    { id: 'task-1', school_id: 'demo-school-1', teacher_id: 'demo-docente-1', title: 'Trabajo Práctico: Revolución de Mayo', description: 'Realizar un informe de 2 páginas sobre las causas y consecuencias.', grade: '4to', section: 'A', due_date: '2026-03-15', subject_name: 'Historia', teacher_name: 'María Profesora' },
    { id: 'task-2', school_id: 'demo-school-1', teacher_id: 'demo-docente-1', title: 'Ecuaciones de segundo grado', description: 'Resolver los ejercicios 1 al 20 de la página 45.', grade: '4to', section: 'A', due_date: '2026-03-12', subject_name: 'Matemática', teacher_name: 'María Profesora' },
    { id: 'task-3', school_id: 'demo-school-1', teacher_id: 'demo-docente-1', title: 'Ensayo: El cambio climático', description: 'Escribir un ensayo argumentativo de 500 palabras.', grade: '5to', section: 'B', due_date: '2026-03-20', subject_name: 'Lengua', teacher_name: 'María Profesora' },
];

const DEMO_EXAMS: Exam[] = [
    { id: 'exam-1', school_id: 'demo-school-1', teacher_id: 'demo-docente-1', title: 'Parcial de Matemática', description: 'Unidades 1 a 3', grade: '4to', section: 'A', exam_date: '2026-03-18' },
    { id: 'exam-2', school_id: 'demo-school-1', teacher_id: 'demo-docente-1', title: 'Examen de Historia', description: 'Período colonial', grade: '4to', section: 'A', exam_date: '2026-03-25' },
    { id: 'exam-3', school_id: 'demo-school-1', teacher_id: 'demo-docente-1', title: 'Evaluación de Lengua', description: 'Análisis sintáctico', grade: '5to', section: 'B', exam_date: '2026-04-02' },
];

const DEMO_NOTIFICATIONS: Notification[] = [
    { id: 'notif-1', school_id: 'demo-school-1', user_id: 'demo-tutor-1', title: 'Citación del docente', message: 'Su hijo Lucas tiene dificultades en Matemática. Necesitamos coordinar una reunión.', type: 'attention_call', is_read: false, created_at: '2026-03-05T14:30:00Z' },
    { id: 'notif-2', school_id: 'demo-school-1', user_id: 'demo-tutor-1', title: 'Aviso de salud', message: 'Lucas presentó dolor de cabeza durante la clase de Educación Física.', type: 'health', is_read: false, created_at: '2026-03-04T11:00:00Z' },
    { id: 'notif-3', school_id: 'demo-school-1', user_id: 'demo-tutor-1', title: 'Reunión de padres', message: 'Se convoca a reunión de padres el viernes 14/03 a las 18hs.', type: 'info', is_read: true, created_at: '2026-03-03T09:00:00Z' },
];

const DEMO_ATTENTION_CALLS: AttentionCall[] = [
    { id: 'call-1', school_id: 'demo-school-1', teacher_id: 'demo-docente-1', student_id: 'stu-1', tutor_id: 'demo-tutor-1', reason: 'Dificultades en Matemática, se requiere apoyo en casa.', type: 'academic', status: 'pending', created_at: '2026-03-05T14:30:00Z' },
    { id: 'call-2', school_id: 'demo-school-1', teacher_id: 'demo-docente-1', student_id: 'stu-2', tutor_id: 'demo-tutor-1', reason: 'Comportamiento disruptivo en clase.', type: 'behavior', status: 'acknowledged', created_at: '2026-03-02T10:00:00Z' },
];

const DEMO_ATTENDANCE: Attendance[] = [
    { id: 'att-1', school_id: 'demo-school-1', student_id: 'stu-1', date: '2026-03-06', status: 'present', recorded_by: 'demo-preceptor-1' },
    { id: 'att-2', school_id: 'demo-school-1', student_id: 'stu-1', date: '2026-03-05', status: 'present', recorded_by: 'demo-preceptor-1' },
    { id: 'att-3', school_id: 'demo-school-1', student_id: 'stu-1', date: '2026-03-04', status: 'absent', recorded_by: 'demo-preceptor-1', notes: 'Certificado médico' },
    { id: 'att-4', school_id: 'demo-school-1', student_id: 'stu-1', date: '2026-03-03', status: 'present', recorded_by: 'demo-preceptor-1' },
    { id: 'att-5', school_id: 'demo-school-1', student_id: 'stu-1', date: '2026-02-28', status: 'late', recorded_by: 'demo-preceptor-1' },
];

const DEMO_SANCTIONS: Sanction[] = [
    { id: 'sanc-1', school_id: 'demo-school-1', student_id: 'stu-2', type: 'Amonestación', description: 'Uso del celular en clase reiterado', issued_by: 'demo-docente-1', date: '2026-03-04', resolved: false, student_name: 'Sofía García' },
    { id: 'sanc-2', school_id: 'demo-school-1', student_id: 'stu-3', type: 'Apercibimiento', description: 'Llegada tarde sin justificación (3ra vez)', issued_by: 'demo-preceptor-1', date: '2026-03-01', resolved: true, student_name: 'Mateo López' },
];

// ============================================
// INSTITUTION & METRICS QUERIES
// ============================================

/** Obtener detalles de la institución */
export async function getInstitution(schoolId: string): Promise<Institution | null> {
    if (!isSupabaseConfigured()) {
        return { id: 'demo-school-1', name: 'Instituto Demo EduConnect', address: 'Av. Siempreviva 742', phone: '011-4444-5555', email: 'info@demo.edu.ar', logo_url: '', created_at: '2025-01-01' } as Institution;
    }
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
    if (!isSupabaseConfigured()) {
        return { totalStudents: 247, totalStaff: 18, attendanceRate: 94.5, pendingRegistrations: 3 };
    }
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
            .in('role_id', ['role-docente', 'role-preceptor'])
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
    if (!isSupabaseConfigured()) {
        return [
            { id: 'demo-docente-1', school_id: 'demo-school-1', name: 'María Profesora', email: 'docente@demo.com', role: 'docente', is_active: true },
            { id: 'demo-preceptor-1', school_id: 'demo-school-1', name: 'Juan Preceptor', email: 'preceptor@demo.com', role: 'preceptor', is_active: true },
            { id: 'staff-3', school_id: 'demo-school-1', name: 'Laura Fernández', email: 'laura@demo.com', role: 'docente', is_active: true },
            { id: 'staff-4', school_id: 'demo-school-1', name: 'Pedro Sánchez', email: 'pedro@demo.com', role: 'docente', is_active: false },
        ] as StaffMember[];
    }
    try {
        const { data, error } = await supabase
            .from('users')
            .select('id, school_id, name, email, role_id, avatar_url, is_active')
            .eq('school_id', schoolId)
            .in('role_id', ['role-docente', 'role-preceptor'])
            .order('name', { ascending: true });

        if (error) throw error;

        // Map role_id to readable role names
        const roleMap: Record<string, string> = {
            'role-docente': 'docente',
            'role-preceptor': 'preceptor',
        };

        return (data || []).map((item: any) => ({
            ...item,
            role: roleMap[item.role_id] || item.role_id,
        })) as unknown as StaffMember[];
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
    // Map short role to role_id
    const roleMap: Record<string, string> = { 'docente': 'role-docente', 'preceptor': 'role-preceptor' };
    const { data, error } = await supabase
        .from('users')
        .insert([{
            id: `temp_${Math.random().toString(36).substr(2, 9)}`,
            ...staffData,
            role_id: roleMap[staffData.role_id] || staffData.role_id,
            is_active: true
        }])
        .select()
        .single();

    if (error) throw error;
    return data;
}

// ============================================
// SUBJECTS & ACADEMIC ASSIGNMENTS
// ============================================

export async function getAllSubjects(schoolId: string) {
    if (!isSupabaseConfigured()) {
        return [
            { id: 'sub-1', school_id: schoolId, name: 'Matemática', grade: '4to', section: 'A' },
            { id: 'sub-2', school_id: schoolId, name: 'Historia', grade: '4to', section: 'A' },
            { id: 'sub-3', school_id: schoolId, name: 'Lengua', grade: '5to', section: 'B' },
            { id: 'sub-4', school_id: schoolId, name: 'Biología', grade: '5to', section: 'B' },
        ];
    }
    const { data, error } = await supabase
        .from('subjects')
        .select('*')
        .eq('school_id', schoolId)
        .order('grade', { ascending: true });

    if (error) throw error;
    return data || [];
}

export async function getTeacherSubjects(teacherId: string) {
    if (!isSupabaseConfigured()) {
        return [
            { id: 'sub-1', name: 'Matemática', grade: '4to', section: 'A' },
            { id: 'sub-2', name: 'Historia', grade: '4to', section: 'A' },
            { id: 'sub-3', name: 'Lengua', grade: '5to', section: 'B' },
        ];
    }
    try {
        const { data, error } = await supabase
            .from('subjects')
            .select('*')
            .eq('teacher_id', teacherId);

        if (error) throw error;
        return data || [];
    } catch (error) {
        console.error('Get teacher subjects error:', error);
        return [];
    }
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
    if (!isSupabaseConfigured()) {
        return DEMO_STUDENTS.filter(s => s.grade === grade && s.section === section);
    }
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
    if (!isSupabaseConfigured()) return DEMO_STUDENTS;
    const { data, error } = await supabase
        .from('students')
        .select('*')
        .eq('school_id', schoolId)
        .eq('is_active', true);

    if (error) return [];
    return (data || []) as Student[];
}

export async function getFamilies(schoolId: string): Promise<Family[]> {
    if (!isSupabaseConfigured()) {
        return [{
            id: 'fam-1', school_id: 'demo-school-1', tutor_id: 'demo-tutor-1',
            tutor_name: 'Ana Mamá', tutor_email: 'tutor@demo.com',
            students: DEMO_STUDENTS.slice(0, 2),
        }];
    }
    try {
        const { data: tutors, error: tutorsError } = await supabase
            .from('users')
            .select('id, name, email')
            .eq('school_id', schoolId)
            .eq('role_id', 'role-tutor')
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
            role_id: 'role-tutor',
            is_active: true,
            id: `temp_fam_${Math.random().toString(36).substr(2, 9)}`
        }])
        .select()
        .single();

    if (error) throw error;
    return family;
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

/** * ✅ REGISTRAR UN NUEVO ALUMNO INTEGRAL (AUTH + USERS + STUDENTS + LINK)
 * Esta función garantiza que el alumno tenga credenciales y perfil para el login.
 */
export async function createAndLinkStudent(studentData: {
    school_id: string;
    first_name: string;
    last_name: string;
    grade: string;
    section: string;
    email: string;
    password: string;
    tutor_id: string;
}) {
    console.log("🚀 Iniciando creación integral del alumno:", studentData.email);

    try {
        // 1. Crear el usuario en Supabase Auth
        const authUser = await registerStudentAuth(studentData.email, studentData.password);
        if (!authUser) throw new Error("No se pudo crear la cuenta de autenticación.");

        const newAuthId = authUser.id;

        // 2. Crear el perfil en la tabla 'users' (Permite el login en la App)
        const { error: userError } = await supabase
            .from('users')
            .insert([{
                id: newAuthId,
                school_id: studentData.school_id,
                role_id: 'role-student', // <-- Rol definido para el alumno
                name: `${studentData.first_name} ${studentData.last_name}`,
                email: studentData.email.trim().toLowerCase(),
                is_active: true
            }]);

        if (userError) throw new Error(`Error en tabla users: ${userError.message}`);

        // 3. Crear el registro en la tabla 'students' vinculado al user_id de Auth
        const studentId = `stu_${Date.now()}`;
        const { data: student, error: studentError } = await supabase
            .from('students')
            .insert([{
                id: studentId,
                user_id: newAuthId, // ✅ Vinculación vital para RLS y perfiles
                school_id: studentData.school_id,
                first_name: studentData.first_name,
                last_name: studentData.last_name,
                grade: studentData.grade,
                section: studentData.section,
                email: studentData.email,
                is_active: true
            }])
            .select()
            .single();

        if (studentError) throw new Error(`Error en tabla students: ${studentError.message}`);

        // 4. Vincular con el tutor en 'family_relationships'
        const { error: linkError } = await supabase
            .from('family_relationships')
            .insert([{
                id: `rel_${Date.now()}`,
                school_id: studentData.school_id,
                tutor_id: studentData.tutor_id,
                student_id: studentId
            }]);

        if (linkError) throw new Error(`Error vinculando familia: ${linkError.message}`);

        console.log("✅ Alumno registrado y vinculado correctamente.");
        return student;

    } catch (error: any) {
        console.error("💥 Error fatal en createAndLinkStudent:", error.message);
        throw error;
    }
}

// ============================================
// TASKS (TAREAS)
// ============================================

/** Crear nueva tarea (Docente) */
export async function createTask(taskData: {
    school_id: string;
    teacher_id: string;
    subject_id?: string;
    title: string;
    description?: string;
    grade: string;
    section: string;
    due_date: string;
}) {
    const { data, error } = await supabase
        .from('tasks')
        .insert([{
            id: `task_${Date.now()}`,
            ...taskData
        }])
        .select()
        .single();

    if (error) throw error;
    return data;
}

/** Obtener tareas creadas por un docente */
export async function getTasksByTeacher(teacherId: string): Promise<Task[]> {
    if (!isSupabaseConfigured()) return DEMO_TASKS;
    const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('teacher_id', teacherId)
        .order('due_date', { ascending: true });

    if (error) return [];
    return (data || []) as Task[];
}

/** Obtener tareas para un alumno (por grado y sección) */
export async function getTasksForStudent(schoolId: string, grade: string, section: string): Promise<Task[]> {
    if (!isSupabaseConfigured()) return DEMO_TASKS.filter(t => t.grade === grade && t.section === section);
    const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('school_id', schoolId)
        .eq('grade', grade)
        .eq('section', section)
        .order('due_date', { ascending: true });

    if (error) return [];
    return (data || []) as Task[];
}

/** Entregar tarea (Alumno) */
export async function submitTask(submissionData: {
    task_id: string;
    student_id: string;
    file_url?: string;
    comment?: string;
}) {
    const { data, error } = await supabase
        .from('task_submissions')
        .insert([{
            id: `sub_${Date.now()}`,
            ...submissionData
        }])
        .select()
        .single();

    if (error) throw error;
    return data;
}

/** Obtener entregas de una tarea */
export async function getTaskSubmissions(taskId: string): Promise<TaskSubmission[]> {
    if (!isSupabaseConfigured()) {
        return [
            { id: 'sub-1', task_id: taskId, student_id: 'stu-1', comment: 'Adjunto mi trabajo.', submitted_at: '2026-03-10T10:00:00Z', student_name: 'Lucas Alumno' },
            { id: 'sub-2', task_id: taskId, student_id: 'stu-2', comment: 'Entrega completa.', submitted_at: '2026-03-10T14:00:00Z', student_name: 'Sofía García' },
        ] as TaskSubmission[];
    }
    const { data, error } = await supabase
        .from('task_submissions')
        .select('*, students!inner(first_name, last_name)')
        .eq('task_id', taskId);

    if (error) return [];
    return (data || []).map((s: any) => ({
        ...s,
        student_name: `${s.students?.first_name} ${s.students?.last_name}`
    })) as TaskSubmission[];
}

/** Obtener entregas de un alumno */
export async function getStudentSubmissions(studentId: string): Promise<TaskSubmission[]> {
    if (!isSupabaseConfigured()) {
        return [{ id: 'sub-1', task_id: 'task-2', student_id: studentId, comment: 'Ejercicios resueltos.', submitted_at: '2026-03-10T10:00:00Z' }] as TaskSubmission[];
    }
    const { data, error } = await supabase
        .from('task_submissions')
        .select('*')
        .eq('student_id', studentId);

    if (error) return [];
    return (data || []) as TaskSubmission[];
}

// ============================================
// EXAMS (PRUEBAS / CALENDARIO)
// ============================================

/** Crear examen (Docente) */
export async function createExam(examData: {
    school_id: string;
    teacher_id: string;
    subject_id?: string;
    title: string;
    description?: string;
    grade: string;
    section: string;
    exam_date: string;
}) {
    const { data, error } = await supabase
        .from('exams')
        .insert([{
            id: `exam_${Date.now()}`,
            ...examData
        }])
        .select()
        .single();

    if (error) throw error;
    return data;
}

/** Obtener exámenes por docente */
export async function getExamsByTeacher(teacherId: string): Promise<Exam[]> {
    if (!isSupabaseConfigured()) return DEMO_EXAMS;
    const { data, error } = await supabase
        .from('exams')
        .select('*')
        .eq('teacher_id', teacherId)
        .order('exam_date', { ascending: true });

    if (error) return [];
    return (data || []) as Exam[];
}

/** Obtener exámenes para un alumno (por grado y sección) */
export async function getExamsForStudent(schoolId: string, grade: string, section: string): Promise<Exam[]> {
    if (!isSupabaseConfigured()) return DEMO_EXAMS.filter(e => e.grade === grade && e.section === section);
    const { data, error } = await supabase
        .from('exams')
        .select('*')
        .eq('school_id', schoolId)
        .eq('grade', grade)
        .eq('section', section)
        .order('exam_date', { ascending: true });

    if (error) return [];
    return (data || []) as Exam[];
}

// ============================================
// NOTIFICATIONS (NOTIFICACIONES)
// ============================================

/** Crear notificación */
export async function createNotification(notifData: {
    school_id: string;
    user_id: string;
    title: string;
    message: string;
    type?: string;
    related_id?: string;
}) {
    const { data, error } = await supabase
        .from('notifications')
        .insert([{
            id: `notif_${Date.now()}`,
            is_read: false,
            ...notifData
        }])
        .select()
        .single();

    if (error) throw error;
    return data;
}

/** Obtener notificaciones de un usuario */
export async function getNotifications(userId: string): Promise<Notification[]> {
    if (!isSupabaseConfigured()) return DEMO_NOTIFICATIONS.filter(n => n.user_id === userId);
    const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

    if (error) return [];
    return (data || []) as Notification[];
}

/** Marcar notificación como leída */
export async function markNotificationRead(notifId: string) {
    const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notifId);

    if (error) throw error;
    return true;
}

/** Contar notificaciones no leídas */
export async function getUnreadNotificationCount(userId: string): Promise<number> {
    if (!isSupabaseConfigured()) return DEMO_NOTIFICATIONS.filter(n => n.user_id === userId && !n.is_read).length;
    const { count, error } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('is_read', false);

    if (error) return 0;
    return count || 0;
}

// ============================================
// ATTENTION CALLS (CITACIONES AL TUTOR)
// ============================================

/** Crear citación al tutor (Docente) */
export async function createAttentionCall(callData: {
    school_id: string;
    teacher_id: string;
    student_id: string;
    tutor_id: string;
    reason: string;
    type?: string;
    scheduled_date?: string;
}) {
    const { data, error } = await supabase
        .from('attention_calls')
        .insert([{
            id: `call_${Date.now()}`,
            status: 'pending',
            ...callData
        }])
        .select()
        .single();

    if (error) throw error;

    // Crear notificación para el tutor
    await createNotification({
        school_id: callData.school_id,
        user_id: callData.tutor_id,
        title: 'Citación del docente',
        message: callData.reason,
        type: 'attention_call',
        related_id: data.id
    });

    return data;
}

/** Obtener citaciones por docente */
export async function getAttentionCallsByTeacher(teacherId: string): Promise<AttentionCall[]> {
    if (!isSupabaseConfigured()) return DEMO_ATTENTION_CALLS.filter(c => c.teacher_id === teacherId);
    const { data, error } = await supabase
        .from('attention_calls')
        .select('*')
        .eq('teacher_id', teacherId)
        .order('created_at', { ascending: false });

    if (error) return [];
    return (data || []) as AttentionCall[];
}

/** Obtener citaciones por tutor */
export async function getAttentionCallsByTutor(tutorId: string): Promise<AttentionCall[]> {
    if (!isSupabaseConfigured()) return DEMO_ATTENTION_CALLS.filter(c => c.tutor_id === tutorId);
    const { data, error } = await supabase
        .from('attention_calls')
        .select('*')
        .eq('tutor_id', tutorId)
        .order('created_at', { ascending: false });

    if (error) return [];
    return (data || []) as AttentionCall[];
}

/** Actualizar estado de citación */
export async function updateAttentionCallStatus(callId: string, status: string) {
    const { error } = await supabase
        .from('attention_calls')
        .update({ status })
        .eq('id', callId);

    if (error) throw error;
    return true;
}

// ============================================
// ATTENDANCE MANAGEMENT (PRECEPTOR)
// ============================================

/** Registrar asistencia */
export async function recordAttendance(attendanceData: {
    school_id: string;
    student_id: string;
    date: string;
    status: string;
    notes?: string;
    recorded_by: string;
}) {
    const { data, error } = await supabase
        .from('attendance')
        .insert([{
            id: `att_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
            ...attendanceData
        }])
        .select()
        .single();

    if (error) throw error;
    return data;
}

/** Obtener asistencia de un alumno */
export async function getStudentAttendance(studentId: string): Promise<Attendance[]> {
    if (!isSupabaseConfigured()) return DEMO_ATTENDANCE.filter(a => a.student_id === studentId);
    const { data, error } = await supabase
        .from('attendance')
        .select('*')
        .eq('student_id', studentId)
        .order('date', { ascending: false });

    if (error) return [];
    return (data || []) as Attendance[];
}

/** Obtener asistencia de una clase en una fecha */
export async function getClassAttendance(schoolId: string, grade: string, section: string, date: string) {
    if (!isSupabaseConfigured()) {
        const students = DEMO_STUDENTS.filter(s => s.grade === grade && s.section === section);
        return students.map(s => ({
            ...s,
            attendance: DEMO_ATTENDANCE.find(a => a.student_id === s.id && a.date === date) || null
        }));
    }
    const { data: students } = await supabase
        .from('students')
        .select('id, first_name, last_name')
        .eq('school_id', schoolId)
        .eq('grade', grade)
        .eq('section', section)
        .eq('is_active', true);

    if (!students) return [];

    const { data: attendance } = await supabase
        .from('attendance')
        .select('*')
        .eq('school_id', schoolId)
        .eq('date', date)
        .in('student_id', students.map(s => s.id));

    return students.map(student => ({
        ...student,
        attendance: attendance?.find(a => a.student_id === student.id) || null
    }));
}

/** Obtener sanciones de un colegio */
export async function getSchoolSanctions(schoolId: string): Promise<any[]> {
    if (!isSupabaseConfigured()) return DEMO_SANCTIONS;
    const { data, error } = await supabase
        .from('sanctions')
        .select('*, students!inner(first_name, last_name)')
        .eq('school_id', schoolId)
        .order('date', { ascending: false });

    if (error) return [];
    return (data || []).map((s: any) => ({
        ...s,
        student_name: `${s.students?.first_name} ${s.students?.last_name}`
    }));
}

/** Obtener sanciones de un alumno */
export async function getStudentSanctions(studentId: string): Promise<Sanction[]> {
    if (!isSupabaseConfigured()) return DEMO_SANCTIONS.filter(s => s.student_id === studentId);
    const { data, error } = await supabase
        .from('sanctions')
        .select('*')
        .eq('student_id', studentId)
        .order('date', { ascending: false });

    if (error) return [];
    return (data || []) as Sanction[];
}

/** Resolver una sanción */
export async function resolveSanction(sanctionId: string) {
    const { error } = await supabase
        .from('sanctions')
        .update({ resolved: true })
        .eq('id', sanctionId);

    if (error) throw error;
    return true;
}

/** Obtener los tutores de un alumno */
export async function getStudentTutors(studentId: string) {
    if (!isSupabaseConfigured()) return [{ id: 'demo-tutor-1', name: 'Ana Mamá', email: 'tutor@demo.com' }];
    try {
        const { data, error } = await supabase
            .from('family_relationships')
            .select('tutor_id, users(id, name, email)')
            .eq('student_id', studentId);

        if (error) throw error;
        return (data || []).map((r: any) => r.users).filter(Boolean);
    } catch (error) {
        console.error('Get student tutors error:', error);
        return [];
    }
}

/** Obtener hijos de un tutor */
export async function getTutorChildren(tutorId: string): Promise<Student[]> {
    if (!isSupabaseConfigured()) return DEMO_STUDENTS.slice(0, 2);
    const { data, error } = await supabase
        .from('family_relationships')
        .select('students!inner(*)')
        .eq('tutor_id', tutorId);

    if (error) return [];
    return (data || []).map((r: any) => r.students) as Student[];
}

/** Obtener datos del estudiante por user_id */
export async function getStudentByUserId(userId: string): Promise<Student | null> {
    if (!isSupabaseConfigured()) return DEMO_STUDENTS.find(s => s.user_id === userId) || DEMO_STUDENTS[0];
    const { data, error } = await supabase
        .from('students')
        .select('*')
        .eq('user_id', userId)
        .single();

    if (error) return null;
    return data as Student;
}

// ============================================
// RECENT ACTIVITY
// ============================================

export async function getRecentActivity(schoolId: string) {
    if (!isSupabaseConfigured()) {
        return [
            { id: '1', type: 'enrollment', description: 'Nuevo alumno: Valentina Martínez inscripta en 5to B', timestamp: new Date(Date.now() - 2 * 3600000).toISOString() },
            { id: '2', type: 'staff', description: 'Laura Fernández asignada como docente de Lengua', timestamp: new Date(Date.now() - 8 * 3600000).toISOString() },
            { id: '3', type: 'announcement', description: 'Acto del 25 de Mayo confirmado para las 10hs', timestamp: new Date(Date.now() - 24 * 3600000).toISOString() },
        ];
    }
    try {
        const { data: announcements } = await supabase
            .from('announcements')
            .select('id, title, type, published_at')
            .eq('school_id', schoolId)
            .eq('is_active', true)
            .order('published_at', { ascending: false })
            .limit(5);

        return (announcements || []).map(ann => ({
            id: ann.id,
            type: 'announcement',
            description: ann.title,
            timestamp: ann.published_at || new Date().toISOString(),
            icon: 'Bell' as const,
        }));
    } catch (error) {
        console.error('Get activity error:', error);
        return [];
    }
}