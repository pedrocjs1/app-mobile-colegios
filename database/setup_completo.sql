-- ============================================
-- SETUP COMPLETO v3: Tablas + RLS + Datos Demo
-- Pegar TODO en Supabase > SQL Editor > Run
-- ============================================

-- =====================
-- PARTE 1: ARREGLAR TABLAS EXISTENTES
-- =====================

-- Agregar columna teacher_id a subjects si no existe
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'subjects' AND column_name = 'teacher_id'
  ) THEN
    ALTER TABLE subjects ADD COLUMN teacher_id VARCHAR(50);
  END IF;
END $$;

-- Eliminar tabla teacher_subjects (vieja, ya no se usa - usamos teacher_id en subjects)
DROP TABLE IF EXISTS teacher_subjects CASCADE;

-- Corregir columna id de subjects si es UUID (cambiar a VARCHAR para IDs legibles)
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'subjects' AND column_name = 'id' AND data_type = 'uuid'
  ) THEN
    DELETE FROM subjects;
    ALTER TABLE subjects ALTER COLUMN id DROP DEFAULT;
    ALTER TABLE subjects ALTER COLUMN id TYPE VARCHAR(50) USING id::text;
  END IF;
END $$;

-- Corregir columna school_id de subjects si es UUID
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'subjects' AND column_name = 'school_id' AND data_type = 'uuid'
  ) THEN
    ALTER TABLE subjects ALTER COLUMN school_id TYPE VARCHAR(50) USING school_id::text;
  END IF;
END $$;

-- =====================
-- PARTE 2: CREAR TABLAS NUEVAS (VARCHAR IDs, igual que las existentes)
-- =====================

-- Borrar tablas nuevas si existen (por si quedaron mal de un intento anterior)
DROP TABLE IF EXISTS attention_calls CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS task_submissions CASCADE;
DROP TABLE IF EXISTS exams CASCADE;
DROP TABLE IF EXISTS tasks CASCADE;

CREATE TABLE tasks (
    id VARCHAR(50) PRIMARY KEY,
    school_id VARCHAR(50) NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
    teacher_id VARCHAR(50) NOT NULL REFERENCES users(id),
    subject_id VARCHAR(50),
    title VARCHAR(200) NOT NULL,
    description TEXT,
    grade VARCHAR(20) NOT NULL,
    section VARCHAR(10) NOT NULL,
    due_date DATE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE task_submissions (
    id VARCHAR(50) PRIMARY KEY,
    task_id VARCHAR(50) NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    student_id VARCHAR(50) NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    file_url TEXT,
    comment TEXT,
    submitted_at TIMESTAMPTZ DEFAULT NOW(),
    grade VARCHAR(10),
    graded_at TIMESTAMPTZ,
    UNIQUE(task_id, student_id)
);

CREATE TABLE exams (
    id VARCHAR(50) PRIMARY KEY,
    school_id VARCHAR(50) NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
    teacher_id VARCHAR(50) NOT NULL REFERENCES users(id),
    subject_id VARCHAR(50),
    title VARCHAR(200) NOT NULL,
    description TEXT,
    grade VARCHAR(20) NOT NULL,
    section VARCHAR(10) NOT NULL,
    exam_date DATE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE notifications (
    id VARCHAR(50) PRIMARY KEY,
    school_id VARCHAR(50) NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
    user_id VARCHAR(50) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'info',
    is_read BOOLEAN DEFAULT FALSE,
    related_id VARCHAR(50),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE attention_calls (
    id VARCHAR(50) PRIMARY KEY,
    school_id VARCHAR(50) NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
    teacher_id VARCHAR(50) NOT NULL REFERENCES users(id),
    student_id VARCHAR(50) NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    tutor_id VARCHAR(50) NOT NULL REFERENCES users(id),
    reason TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'general',
    status VARCHAR(20) DEFAULT 'pending',
    scheduled_date DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================
-- PARTE 3: INDICES
-- =====================
CREATE INDEX IF NOT EXISTS idx_tasks_teacher ON tasks(teacher_id);
CREATE INDEX IF NOT EXISTS idx_tasks_class ON tasks(school_id, grade, section);
CREATE INDEX IF NOT EXISTS idx_task_submissions_task ON task_submissions(task_id);
CREATE INDEX IF NOT EXISTS idx_task_submissions_student ON task_submissions(student_id);
CREATE INDEX IF NOT EXISTS idx_exams_teacher ON exams(teacher_id);
CREATE INDEX IF NOT EXISTS idx_exams_class ON exams(school_id, grade, section);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_attention_calls_teacher ON attention_calls(teacher_id);
CREATE INDEX IF NOT EXISTS idx_attention_calls_tutor ON attention_calls(tutor_id);

-- =====================
-- PARTE 4: RLS + POLICIES
-- =====================

ALTER TABLE institutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE sanctions ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE attention_calls ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  DROP POLICY IF EXISTS "institutions_anon_all" ON institutions;
  DROP POLICY IF EXISTS "institutions_auth_all" ON institutions;
  CREATE POLICY "institutions_anon_all" ON institutions FOR ALL TO anon USING (true) WITH CHECK (true);
  CREATE POLICY "institutions_auth_all" ON institutions FOR ALL TO authenticated USING (true) WITH CHECK (true);
  DROP POLICY IF EXISTS "users_anon_all" ON users;
  DROP POLICY IF EXISTS "users_auth_all" ON users;
  CREATE POLICY "users_anon_all" ON users FOR ALL TO anon USING (true) WITH CHECK (true);
  CREATE POLICY "users_auth_all" ON users FOR ALL TO authenticated USING (true) WITH CHECK (true);
  DROP POLICY IF EXISTS "students_anon_all" ON students;
  DROP POLICY IF EXISTS "students_auth_all" ON students;
  CREATE POLICY "students_anon_all" ON students FOR ALL TO anon USING (true) WITH CHECK (true);
  CREATE POLICY "students_auth_all" ON students FOR ALL TO authenticated USING (true) WITH CHECK (true);
  DROP POLICY IF EXISTS "roles_anon_all" ON roles;
  DROP POLICY IF EXISTS "roles_auth_all" ON roles;
  CREATE POLICY "roles_anon_all" ON roles FOR ALL TO anon USING (true) WITH CHECK (true);
  CREATE POLICY "roles_auth_all" ON roles FOR ALL TO authenticated USING (true) WITH CHECK (true);
  DROP POLICY IF EXISTS "family_anon_all" ON family_relationships;
  DROP POLICY IF EXISTS "family_auth_all" ON family_relationships;
  CREATE POLICY "family_anon_all" ON family_relationships FOR ALL TO anon USING (true) WITH CHECK (true);
  CREATE POLICY "family_auth_all" ON family_relationships FOR ALL TO authenticated USING (true) WITH CHECK (true);
  DROP POLICY IF EXISTS "attendance_anon_all" ON attendance;
  DROP POLICY IF EXISTS "attendance_auth_all" ON attendance;
  CREATE POLICY "attendance_anon_all" ON attendance FOR ALL TO anon USING (true) WITH CHECK (true);
  CREATE POLICY "attendance_auth_all" ON attendance FOR ALL TO authenticated USING (true) WITH CHECK (true);
  DROP POLICY IF EXISTS "sanctions_anon_all" ON sanctions;
  DROP POLICY IF EXISTS "sanctions_auth_all" ON sanctions;
  CREATE POLICY "sanctions_anon_all" ON sanctions FOR ALL TO anon USING (true) WITH CHECK (true);
  CREATE POLICY "sanctions_auth_all" ON sanctions FOR ALL TO authenticated USING (true) WITH CHECK (true);
  DROP POLICY IF EXISTS "announcements_anon_all" ON announcements;
  DROP POLICY IF EXISTS "announcements_auth_all" ON announcements;
  CREATE POLICY "announcements_anon_all" ON announcements FOR ALL TO anon USING (true) WITH CHECK (true);
  CREATE POLICY "announcements_auth_all" ON announcements FOR ALL TO authenticated USING (true) WITH CHECK (true);
  DROP POLICY IF EXISTS "subjects_anon_all" ON subjects;
  DROP POLICY IF EXISTS "subjects_auth_all" ON subjects;
  CREATE POLICY "subjects_anon_all" ON subjects FOR ALL TO anon USING (true) WITH CHECK (true);
  CREATE POLICY "subjects_auth_all" ON subjects FOR ALL TO authenticated USING (true) WITH CHECK (true);
  DROP POLICY IF EXISTS "tasks_anon_all" ON tasks;
  DROP POLICY IF EXISTS "tasks_auth_all" ON tasks;
  CREATE POLICY "tasks_anon_all" ON tasks FOR ALL TO anon USING (true) WITH CHECK (true);
  CREATE POLICY "tasks_auth_all" ON tasks FOR ALL TO authenticated USING (true) WITH CHECK (true);
  DROP POLICY IF EXISTS "task_submissions_anon_all" ON task_submissions;
  DROP POLICY IF EXISTS "task_submissions_auth_all" ON task_submissions;
  CREATE POLICY "task_submissions_anon_all" ON task_submissions FOR ALL TO anon USING (true) WITH CHECK (true);
  CREATE POLICY "task_submissions_auth_all" ON task_submissions FOR ALL TO authenticated USING (true) WITH CHECK (true);
  DROP POLICY IF EXISTS "exams_anon_all" ON exams;
  DROP POLICY IF EXISTS "exams_auth_all" ON exams;
  CREATE POLICY "exams_anon_all" ON exams FOR ALL TO anon USING (true) WITH CHECK (true);
  CREATE POLICY "exams_auth_all" ON exams FOR ALL TO authenticated USING (true) WITH CHECK (true);
  DROP POLICY IF EXISTS "notifications_anon_all" ON notifications;
  DROP POLICY IF EXISTS "notifications_auth_all" ON notifications;
  CREATE POLICY "notifications_anon_all" ON notifications FOR ALL TO anon USING (true) WITH CHECK (true);
  CREATE POLICY "notifications_auth_all" ON notifications FOR ALL TO authenticated USING (true) WITH CHECK (true);
  DROP POLICY IF EXISTS "attention_calls_anon_all" ON attention_calls;
  DROP POLICY IF EXISTS "attention_calls_auth_all" ON attention_calls;
  CREATE POLICY "attention_calls_anon_all" ON attention_calls FOR ALL TO anon USING (true) WITH CHECK (true);
  CREATE POLICY "attention_calls_auth_all" ON attention_calls FOR ALL TO authenticated USING (true) WITH CHECK (true);
END $$;

-- =====================
-- PARTE 5: LIMPIAR DATOS VIEJOS (para re-ejecutar sin problemas)
-- =====================
DELETE FROM attention_calls WHERE school_id = 'school-001';
DELETE FROM notifications WHERE school_id = 'school-001';
DELETE FROM task_submissions WHERE task_id IN (SELECT id FROM tasks WHERE school_id = 'school-001');
DELETE FROM exams WHERE school_id = 'school-001';
DELETE FROM tasks WHERE school_id = 'school-001';
DELETE FROM sanctions WHERE school_id = 'school-001';
DELETE FROM attendance WHERE school_id = 'school-001';
DELETE FROM family_relationships WHERE school_id = 'school-001';
DELETE FROM students WHERE school_id = 'school-001';
DELETE FROM subjects WHERE school_id = 'school-001';
DELETE FROM announcements WHERE school_id = 'school-001';
DELETE FROM users WHERE school_id = 'school-001';
DELETE FROM roles WHERE id LIKE 'role-%';
DELETE FROM institutions WHERE id = 'school-001';

-- =====================
-- PARTE 6: INSERTAR DATOS DEMO
-- =====================

INSERT INTO institutions (id, name, address, phone, email, logo_url, primary_color, secondary_color, academic_year)
VALUES ('school-001', 'Instituto San Martin', 'Av. San Martin 1234, Buenos Aires', '+54 11 4567-8900', 'info@sanmartin.edu.ar', NULL, '#6366F1', '#EC4899', '2026');

INSERT INTO roles (id, name, description) VALUES
    ('role-rector', 'rector', 'Director/Rector'),
    ('role-docente', 'docente', 'Profesor/Docente'),
    ('role-preceptor', 'preceptor', 'Preceptor'),
    ('role-tutor', 'tutor', 'Padre/Madre/Tutor'),
    ('role-student', 'student', 'Alumno');

INSERT INTO users (id, school_id, role_id, name, email, avatar_url, is_active) VALUES
    ('user-rector-1', 'school-001', 'role-rector', 'Carlos Director', 'rector@sanmartin.edu.ar', NULL, true),
    ('user-docente-1', 'school-001', 'role-docente', 'Maria Profesora', 'maria@sanmartin.edu.ar', NULL, true),
    ('user-docente-2', 'school-001', 'role-docente', 'Pedro Gonzalez', 'pedro@sanmartin.edu.ar', NULL, true),
    ('user-docente-3', 'school-001', 'role-docente', 'Laura Martinez', 'laura@sanmartin.edu.ar', NULL, true),
    ('user-preceptor-1', 'school-001', 'role-preceptor', 'Juan Preceptor', 'juan@sanmartin.edu.ar', NULL, true),
    ('user-preceptor-2', 'school-001', 'role-preceptor', 'Sofia Lopez', 'sofia@sanmartin.edu.ar', NULL, true),
    ('user-tutor-1', 'school-001', 'role-tutor', 'Ana Mama', 'ana.mama@gmail.com', NULL, true),
    ('user-tutor-2', 'school-001', 'role-tutor', 'Roberto Papa', 'roberto.papa@gmail.com', NULL, true),
    ('user-tutor-3', 'school-001', 'role-tutor', 'Carmen Tutora', 'carmen.tutora@gmail.com', NULL, true),
    ('user-student-1', 'school-001', 'role-student', 'Lucas Alumno', 'lucas@sanmartin.edu.ar', NULL, true);

INSERT INTO subjects (id, school_id, name, grade, section, teacher_id) VALUES
    ('subj-mat', 'school-001', 'Matematica', '1ro', 'A', 'user-docente-1'),
    ('subj-len', 'school-001', 'Lengua y Literatura', '1ro', 'A', 'user-docente-2'),
    ('subj-his', 'school-001', 'Historia', '1ro', 'A', 'user-docente-3'),
    ('subj-bio', 'school-001', 'Biologia', '2do', 'A', 'user-docente-1'),
    ('subj-ing', 'school-001', 'Ingles', '2do', 'A', 'user-docente-2'),
    ('subj-efi', 'school-001', 'Educacion Fisica', '1ro', 'A', 'user-docente-3');

INSERT INTO students (id, school_id, user_id, first_name, last_name, email, date_of_birth, grade, section, enrollment_date, is_active) VALUES
    ('student-1', 'school-001', 'user-student-1', 'Lucas', 'Alumno', 'lucas@sanmartin.edu.ar', '2010-03-15', '1ro', 'A', '2026-03-01', true),
    ('student-2', 'school-001', NULL, 'Sofia', 'Rodriguez', 'sofia.r@sanmartin.edu.ar', '2010-07-22', '1ro', 'A', '2026-03-01', true),
    ('student-3', 'school-001', NULL, 'Martin', 'Fernandez', 'martin.f@sanmartin.edu.ar', '2010-01-10', '1ro', 'A', '2026-03-01', true),
    ('student-4', 'school-001', NULL, 'Valentina', 'Lopez', 'vale.l@sanmartin.edu.ar', '2010-11-05', '1ro', 'B', '2026-03-01', true),
    ('student-5', 'school-001', NULL, 'Mateo', 'Garcia', 'mateo.g@sanmartin.edu.ar', '2010-09-18', '1ro', 'B', '2026-03-01', true),
    ('student-6', 'school-001', NULL, 'Camila', 'Martinez', 'camila.m@sanmartin.edu.ar', '2009-05-30', '2do', 'A', '2025-03-01', true),
    ('student-7', 'school-001', NULL, 'Nicolas', 'Perez', 'nico.p@sanmartin.edu.ar', '2009-12-14', '2do', 'A', '2025-03-01', true),
    ('student-8', 'school-001', NULL, 'Isabella', 'Diaz', 'isa.d@sanmartin.edu.ar', '2009-08-03', '2do', 'B', '2025-03-01', true);

INSERT INTO family_relationships (id, school_id, tutor_id, student_id, relationship_type) VALUES
    ('fam-1', 'school-001', 'user-tutor-1', 'student-1', 'madre'),
    ('fam-2', 'school-001', 'user-tutor-1', 'student-2', 'madre'),
    ('fam-3', 'school-001', 'user-tutor-2', 'student-3', 'padre'),
    ('fam-4', 'school-001', 'user-tutor-2', 'student-4', 'padre'),
    ('fam-5', 'school-001', 'user-tutor-3', 'student-5', 'tutora');

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
    ('att-18', 'school-001', 'student-5', '2026-03-05', 'present', 'user-preceptor-1');

INSERT INTO sanctions (id, school_id, student_id, type, description, date, issued_by, resolved) VALUES
    ('sanc-1', 'school-001', 'student-3', 'Amonestacion', 'Uso del celular en clase de Matematica', '2026-03-03', 'user-docente-1', false),
    ('sanc-2', 'school-001', 'student-5', 'Llamado de atencion', 'Llegada tarde reiterada', '2026-03-04', 'user-preceptor-1', true);

INSERT INTO announcements (id, school_id, title, content, type, target_audience, published_by, published_at, is_active) VALUES
    ('ann-1', 'school-001', 'Reunion de padres - Marzo', 'Se convoca a reunion de padres el dia 15 de Marzo a las 18:00hs.', 'event', 'all', 'user-rector-1', NOW() - INTERVAL '2 days', true),
    ('ann-2', 'school-001', 'Suspension de clases por jornada docente', 'El viernes 14 de Marzo no habra clases.', 'urgent', 'all', 'user-rector-1', NOW() - INTERVAL '1 day', true),
    ('ann-3', 'school-001', 'Torneo intercolegial de futbol', 'Inscribirse con el profesor de Ed. Fisica.', 'general', 'all', 'user-docente-3', NOW() - INTERVAL '3 days', true);

INSERT INTO tasks (id, school_id, teacher_id, subject_id, title, description, grade, section, due_date) VALUES
    ('task-1', 'school-001', 'user-docente-1', 'subj-mat', 'Ejercicios de ecuaciones', 'Resolver ejercicios 1 al 15 de la pagina 42', '1ro', 'A', '2026-03-10'),
    ('task-2', 'school-001', 'user-docente-2', 'subj-len', 'Analisis literario', 'Realizar analisis del cuento El Aleph de Borges', '1ro', 'A', '2026-03-12'),
    ('task-3', 'school-001', 'user-docente-3', 'subj-his', 'TP: Revolucion de Mayo', 'Investigar sobre los eventos de Mayo de 1810', '1ro', 'A', '2026-03-15'),
    ('task-4', 'school-001', 'user-docente-1', 'subj-mat', 'Problemas de geometria', 'Resolver problemas de areas y perimetros', '1ro', 'B', '2026-03-11'),
    ('task-5', 'school-001', 'user-docente-2', 'subj-ing', 'Reading comprehension', 'Read chapter 3 and answer the questions', '2do', 'A', '2026-03-13');

INSERT INTO task_submissions (id, task_id, student_id, comment, submitted_at, grade) VALUES
    ('sub-1', 'task-1', 'student-1', 'Ejercicios resueltos', NOW() - INTERVAL '1 day', '8'),
    ('sub-2', 'task-1', 'student-2', NULL, NOW() - INTERVAL '2 days', '9'),
    ('sub-3', 'task-2', 'student-1', 'Analisis completo', NOW() - INTERVAL '12 hours', NULL);

INSERT INTO exams (id, school_id, teacher_id, subject_id, title, description, grade, section, exam_date) VALUES
    ('exam-1', 'school-001', 'user-docente-1', 'subj-mat', 'Parcial de Ecuaciones', 'Ecuaciones de primer y segundo grado', '1ro', 'A', '2026-03-20'),
    ('exam-2', 'school-001', 'user-docente-2', 'subj-len', 'Evaluacion de Comprension Lectora', 'Analisis de texto narrativo', '1ro', 'A', '2026-03-22'),
    ('exam-3', 'school-001', 'user-docente-3', 'subj-his', 'Prueba de Historia Argentina', 'Periodo 1810-1853', '1ro', 'A', '2026-03-25'),
    ('exam-4', 'school-001', 'user-docente-1', 'subj-bio', 'Parcial de Biologia', 'La celula y sus organelas', '2do', 'A', '2026-03-21');

INSERT INTO notifications (id, school_id, user_id, title, message, type, is_read) VALUES
    ('notif-1', 'school-001', 'user-tutor-1', 'Inasistencia de su hijo/a', 'Sofia Rodriguez falto el dia 02/03.', 'warning', false),
    ('notif-2', 'school-001', 'user-tutor-1', 'Reunion de padres', 'Reunion el 15 de Marzo a las 18hs.', 'info', false),
    ('notif-3', 'school-001', 'user-tutor-2', 'Sancion registrada', 'Amonestacion para Martin Fernandez.', 'urgent', false),
    ('notif-4', 'school-001', 'user-tutor-2', 'Tarea pendiente', 'Valentina tiene tarea de Mate pendiente.', 'info', true),
    ('notif-5', 'school-001', 'user-student-1', 'Nueva tarea', 'Tarea de Mate: Ecuaciones. Entrega: 10/03.', 'info', false),
    ('notif-6', 'school-001', 'user-student-1', 'Nota publicada', 'Tu tarea de Mate fue calificada con 8.', 'info', true),
    ('notif-7', 'school-001', 'user-docente-1', 'Entrega recibida', 'Lucas Alumno entrego la tarea.', 'info', false),
    ('notif-8', 'school-001', 'user-docente-1', 'Reunion de departamento', 'Reunion de Mate el jueves a las 16hs.', 'info', false);

INSERT INTO attention_calls (id, school_id, teacher_id, student_id, tutor_id, reason, type, status, scheduled_date) VALUES
    ('atcall-1', 'school-001', 'user-docente-1', 'student-3', 'user-tutor-2', 'Bajo rendimiento en Matematica', 'academic', 'pending', '2026-03-12'),
    ('atcall-2', 'school-001', 'user-preceptor-1', 'student-5', 'user-tutor-3', 'Llegadas tarde reiteradas', 'behavior', 'acknowledged', '2026-03-10');

-- ============================================
-- LISTO! Si ves "Success" todo esta OK.
-- ============================================
