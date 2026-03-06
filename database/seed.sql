-- ============================================
-- SEED DATA: Demo school with sample data
-- Run AFTER migration.sql in Supabase SQL Editor
-- ============================================

-- 1. Institution
INSERT INTO institutions (id, name, address, phone, email, logo_url, primary_color, secondary_color, academic_year)
VALUES (
    'school-001',
    'Instituto San Martin',
    'Av. San Martin 1234, Buenos Aires',
    '+54 11 4567-8900',
    'info@sanmartin.edu.ar',
    NULL,
    '#6366F1',
    '#EC4899',
    '2026'
) ON CONFLICT (id) DO NOTHING;

-- 2. Roles
INSERT INTO roles (id, name, description) VALUES
    ('role-rector', 'rector', 'Director/Rector de la institucion'),
    ('role-docente', 'docente', 'Profesor/Docente'),
    ('role-preceptor', 'preceptor', 'Preceptor/Auxiliar'),
    ('role-tutor', 'tutor', 'Padre/Madre/Tutor'),
    ('role-student', 'student', 'Alumno/Estudiante')
ON CONFLICT (id) DO NOTHING;

-- 3. Users (staff + tutors)
INSERT INTO users (id, school_id, role_id, name, email, avatar_url, is_active) VALUES
    -- Rector
    ('user-rector-1', 'school-001', 'role-rector', 'Carlos Director', 'rector@sanmartin.edu.ar', NULL, true),
    -- Docentes
    ('user-docente-1', 'school-001', 'role-docente', 'Maria Profesora', 'maria@sanmartin.edu.ar', NULL, true),
    ('user-docente-2', 'school-001', 'role-docente', 'Pedro Gonzalez', 'pedro@sanmartin.edu.ar', NULL, true),
    ('user-docente-3', 'school-001', 'role-docente', 'Laura Martinez', 'laura@sanmartin.edu.ar', NULL, true),
    -- Preceptores
    ('user-preceptor-1', 'school-001', 'role-preceptor', 'Juan Preceptor', 'juan@sanmartin.edu.ar', NULL, true),
    ('user-preceptor-2', 'school-001', 'role-preceptor', 'Sofia Lopez', 'sofia@sanmartin.edu.ar', NULL, true),
    -- Tutores (padres)
    ('user-tutor-1', 'school-001', 'role-tutor', 'Ana Mama', 'ana.mama@gmail.com', NULL, true),
    ('user-tutor-2', 'school-001', 'role-tutor', 'Roberto Papa', 'roberto.papa@gmail.com', NULL, true),
    ('user-tutor-3', 'school-001', 'role-tutor', 'Carmen Tutora', 'carmen.tutora@gmail.com', NULL, true),
    -- Student user (needed before students table for FK)
    ('user-student-1', 'school-001', 'role-student', 'Lucas Alumno', 'lucas@sanmartin.edu.ar', NULL, true)
ON CONFLICT (id) DO NOTHING;

-- 4. Subjects
INSERT INTO subjects (id, school_id, name, teacher_id) VALUES
    ('subj-mat', 'school-001', 'Matematica', 'user-docente-1'),
    ('subj-len', 'school-001', 'Lengua y Literatura', 'user-docente-2'),
    ('subj-his', 'school-001', 'Historia', 'user-docente-3'),
    ('subj-bio', 'school-001', 'Biologia', 'user-docente-1'),
    ('subj-ing', 'school-001', 'Ingles', 'user-docente-2'),
    ('subj-efi', 'school-001', 'Educacion Fisica', 'user-docente-3')
ON CONFLICT (id) DO NOTHING;

-- 5. Students
INSERT INTO students (id, school_id, user_id, first_name, last_name, email, date_of_birth, grade, section, enrollment_date, is_active) VALUES
    ('student-1', 'school-001', 'user-student-1', 'Lucas', 'Alumno', 'lucas@sanmartin.edu.ar', '2010-03-15', '1ro', 'A', '2026-03-01', true),
    ('student-2', 'school-001', NULL, 'Sofia', 'Rodriguez', 'sofia.r@sanmartin.edu.ar', '2010-07-22', '1ro', 'A', '2026-03-01', true),
    ('student-3', 'school-001', NULL, 'Martin', 'Fernandez', 'martin.f@sanmartin.edu.ar', '2010-01-10', '1ro', 'A', '2026-03-01', true),
    ('student-4', 'school-001', NULL, 'Valentina', 'Lopez', 'vale.l@sanmartin.edu.ar', '2010-11-05', '1ro', 'B', '2026-03-01', true),
    ('student-5', 'school-001', NULL, 'Mateo', 'Garcia', 'mateo.g@sanmartin.edu.ar', '2010-09-18', '1ro', 'B', '2026-03-01', true),
    ('student-6', 'school-001', NULL, 'Camila', 'Martinez', 'camila.m@sanmartin.edu.ar', '2009-05-30', '2do', 'A', '2025-03-01', true),
    ('student-7', 'school-001', NULL, 'Nicolas', 'Perez', 'nico.p@sanmartin.edu.ar', '2009-12-14', '2do', 'A', '2025-03-01', true),
    ('student-8', 'school-001', NULL, 'Isabella', 'Diaz', 'isa.d@sanmartin.edu.ar', '2009-08-03', '2do', 'B', '2025-03-01', true)
ON CONFLICT (id) DO NOTHING;

-- 6. Family relationships (tutor <-> student)
INSERT INTO family_relationships (id, school_id, tutor_id, student_id, relationship_type) VALUES
    ('fam-1', 'school-001', 'user-tutor-1', 'student-1', 'madre'),
    ('fam-2', 'school-001', 'user-tutor-1', 'student-2', 'madre'),
    ('fam-3', 'school-001', 'user-tutor-2', 'student-3', 'padre'),
    ('fam-4', 'school-001', 'user-tutor-2', 'student-4', 'padre'),
    ('fam-5', 'school-001', 'user-tutor-3', 'student-5', 'tutora')
ON CONFLICT (id) DO NOTHING;

-- 7. Attendance (last 5 days for some students)
INSERT INTO attendance (id, school_id, student_id, date, status, recorded_by) VALUES
    ('att-1', 'school-001', 'student-1', '2026-03-02', 'present', 'user-preceptor-1'),
    ('att-2', 'school-001', 'student-2', '2026-03-02', 'present', 'user-preceptor-1'),
    ('att-3', 'school-001', 'student-3', '2026-03-02', 'absent', 'user-preceptor-1'),
    ('att-4', 'school-001', 'student-4', '2026-03-02', 'present', 'user-preceptor-1'),
    ('att-5', 'school-001', 'student-5', '2026-03-02', 'late', 'user-preceptor-1'),
    ('att-6', 'school-001', 'student-1', '2026-03-03', 'present', 'user-preceptor-1'),
    ('att-7', 'school-001', 'student-2', '2026-03-03', 'present', 'user-preceptor-1'),
    ('att-8', 'school-001', 'student-3', '2026-03-03', 'present', 'user-preceptor-1'),
    ('att-9', 'school-001', 'student-4', '2026-03-03', 'absent', 'user-preceptor-1'),
    ('att-10', 'school-001', 'student-5', '2026-03-03', 'present', 'user-preceptor-1'),
    ('att-11', 'school-001', 'student-1', '2026-03-04', 'present', 'user-preceptor-1'),
    ('att-12', 'school-001', 'student-2', '2026-03-04', 'late', 'user-preceptor-1'),
    ('att-13', 'school-001', 'student-3', '2026-03-04', 'present', 'user-preceptor-1'),
    ('att-14', 'school-001', 'student-1', '2026-03-05', 'present', 'user-preceptor-1'),
    ('att-15', 'school-001', 'student-2', '2026-03-05', 'present', 'user-preceptor-1'),
    ('att-16', 'school-001', 'student-3', '2026-03-05', 'present', 'user-preceptor-1'),
    ('att-17', 'school-001', 'student-4', '2026-03-05', 'present', 'user-preceptor-1'),
    ('att-18', 'school-001', 'student-5', '2026-03-05', 'present', 'user-preceptor-1')
ON CONFLICT (id) DO NOTHING;

-- 8. Sanctions
INSERT INTO sanctions (id, school_id, student_id, type, description, date, issued_by, resolved) VALUES
    ('sanc-1', 'school-001', 'student-3', 'Amonestacion', 'Uso del celular en clase de Matematica', '2026-03-03', 'user-docente-1', false),
    ('sanc-2', 'school-001', 'student-5', 'Llamado de atencion', 'Llegada tarde reiterada', '2026-03-04', 'user-preceptor-1', true)
ON CONFLICT (id) DO NOTHING;

-- 9. Announcements
INSERT INTO announcements (id, school_id, title, content, type, target_audience, published_by, published_at, is_active) VALUES
    ('ann-1', 'school-001', 'Reunion de padres - Marzo', 'Se convoca a reunion de padres el dia 15 de Marzo a las 18:00hs en el salon de actos.', 'event', 'all', 'user-rector-1', NOW() - INTERVAL '2 days', true),
    ('ann-2', 'school-001', 'Suspension de clases por jornada docente', 'El dia viernes 14 de Marzo no habra clases por jornada de capacitacion docente.', 'urgent', 'all', 'user-rector-1', NOW() - INTERVAL '1 day', true),
    ('ann-3', 'school-001', 'Torneo intercolegial de futbol', 'Se invita a los alumnos interesados a inscribirse para el torneo intercolegial. Consultar con el profesor de Educacion Fisica.', 'general', 'all', 'user-docente-3', NOW() - INTERVAL '3 days', true)
ON CONFLICT (id) DO NOTHING;

-- 10. Tasks (tareas)
INSERT INTO tasks (id, school_id, teacher_id, subject_id, title, description, grade, section, due_date) VALUES
    ('task-1', 'school-001', 'user-docente-1', 'subj-mat', 'Ejercicios de ecuaciones', 'Resolver ejercicios 1 al 15 de la pagina 42', '1ro', 'A', '2026-03-10'),
    ('task-2', 'school-001', 'user-docente-2', 'subj-len', 'Analisis literario', 'Realizar analisis del cuento "El Aleph" de Borges', '1ro', 'A', '2026-03-12'),
    ('task-3', 'school-001', 'user-docente-3', 'subj-his', 'Trabajo practico: Revolucion de Mayo', 'Investigar y elaborar un informe sobre los eventos de Mayo de 1810', '1ro', 'A', '2026-03-15'),
    ('task-4', 'school-001', 'user-docente-1', 'subj-mat', 'Problemas de geometria', 'Resolver problemas de areas y perimetros', '1ro', 'B', '2026-03-11'),
    ('task-5', 'school-001', 'user-docente-2', 'subj-ing', 'Reading comprehension', 'Read chapter 3 and answer the questions', '2do', 'A', '2026-03-13')
ON CONFLICT (id) DO NOTHING;

-- 11. Task submissions
INSERT INTO task_submissions (id, task_id, student_id, comment, submitted_at, grade) VALUES
    ('sub-1', 'task-1', 'student-1', 'Ejercicios resueltos', NOW() - INTERVAL '1 day', '8'),
    ('sub-2', 'task-1', 'student-2', NULL, NOW() - INTERVAL '2 days', '9'),
    ('sub-3', 'task-2', 'student-1', 'Analisis completo adjunto', NOW() - INTERVAL '12 hours', NULL)
ON CONFLICT (task_id, student_id) DO NOTHING;

-- 12. Exams
INSERT INTO exams (id, school_id, teacher_id, subject_id, title, description, grade, section, exam_date) VALUES
    ('exam-1', 'school-001', 'user-docente-1', 'subj-mat', 'Parcial de Ecuaciones', 'Temas: ecuaciones de primer y segundo grado', '1ro', 'A', '2026-03-20'),
    ('exam-2', 'school-001', 'user-docente-2', 'subj-len', 'Evaluacion de Comprension Lectora', 'Analisis de texto narrativo', '1ro', 'A', '2026-03-22'),
    ('exam-3', 'school-001', 'user-docente-3', 'subj-his', 'Prueba de Historia Argentina', 'Periodo 1810-1853', '1ro', 'A', '2026-03-25'),
    ('exam-4', 'school-001', 'user-docente-1', 'subj-bio', 'Parcial de Biologia', 'La celula y sus organelas', '2do', 'A', '2026-03-21')
ON CONFLICT (id) DO NOTHING;

-- 13. Notifications
INSERT INTO notifications (id, school_id, user_id, title, message, type, is_read) VALUES
    -- Para el tutor 1
    ('notif-1', 'school-001', 'user-tutor-1', 'Inasistencia de su hijo/a', 'Sofia Rodriguez tuvo una inasistencia el dia 02/03.', 'warning', false),
    ('notif-2', 'school-001', 'user-tutor-1', 'Reunion de padres', 'Se recuerda la reunion de padres el 15 de Marzo a las 18:00hs.', 'info', false),
    -- Para el tutor 2
    ('notif-3', 'school-001', 'user-tutor-2', 'Sancion registrada', 'Se registro una amonestacion para Martin Fernandez por uso de celular en clase.', 'urgent', false),
    ('notif-4', 'school-001', 'user-tutor-2', 'Tarea pendiente', 'Valentina Lopez tiene una tarea de Matematica pendiente de entrega.', 'info', true),
    -- Para el estudiante
    ('notif-5', 'school-001', 'user-student-1', 'Nueva tarea asignada', 'Se asigno una nueva tarea de Matematica: Ejercicios de ecuaciones. Fecha de entrega: 10/03.', 'info', false),
    ('notif-6', 'school-001', 'user-student-1', 'Nota publicada', 'Tu tarea de Matematica fue calificada con un 8.', 'info', true),
    -- Para docentes
    ('notif-7', 'school-001', 'user-docente-1', 'Entrega recibida', 'Lucas Alumno entrego la tarea de ecuaciones.', 'info', false),
    ('notif-8', 'school-001', 'user-docente-1', 'Reunion de departamento', 'Se recuerda la reunion de departamento de Matematica el jueves a las 16hs.', 'info', false)
ON CONFLICT (id) DO NOTHING;

-- 14. Attention calls (citaciones)
INSERT INTO attention_calls (id, school_id, teacher_id, student_id, tutor_id, reason, type, status, scheduled_date) VALUES
    ('atcall-1', 'school-001', 'user-docente-1', 'student-3', 'user-tutor-2', 'Bajo rendimiento en Matematica y uso reiterado del celular en clase', 'academic', 'pending', '2026-03-12'),
    ('atcall-2', 'school-001', 'user-preceptor-1', 'student-5', 'user-tutor-3', 'Llegadas tarde reiteradas durante la primera semana', 'behavior', 'acknowledged', '2026-03-10')
ON CONFLICT (id) DO NOTHING;
