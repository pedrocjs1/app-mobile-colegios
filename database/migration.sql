-- ============================================
-- MIGRATION: Create missing tables & configure RLS
-- Run this in Supabase SQL Editor
-- ============================================

-- 1. Tasks table (Tareas asignadas por docentes)
CREATE TABLE IF NOT EXISTS tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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

-- 2. Task submissions table (Entregas de alumnos)
CREATE TABLE IF NOT EXISTS task_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    student_id VARCHAR(50) NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    file_url TEXT,
    comment TEXT,
    submitted_at TIMESTAMPTZ DEFAULT NOW(),
    grade VARCHAR(10),
    graded_at TIMESTAMPTZ,
    UNIQUE(task_id, student_id)
);

-- 3. Exams table (Calendario de pruebas)
CREATE TABLE IF NOT EXISTS exams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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

-- 4. Notifications table (Sistema de notificaciones)
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id VARCHAR(50) NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
    user_id VARCHAR(50) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'info',
    is_read BOOLEAN DEFAULT FALSE,
    related_id VARCHAR(50),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Attention calls table (Citaciones al tutor)
CREATE TABLE IF NOT EXISTS attention_calls (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_tasks_teacher ON tasks(teacher_id);
CREATE INDEX IF NOT EXISTS idx_tasks_class ON tasks(school_id, grade, section);
CREATE INDEX IF NOT EXISTS idx_task_submissions_task ON task_submissions(task_id);
CREATE INDEX IF NOT EXISTS idx_task_submissions_student ON task_submissions(student_id);
CREATE INDEX IF NOT EXISTS idx_exams_teacher ON exams(teacher_id);
CREATE INDEX IF NOT EXISTS idx_exams_class ON exams(school_id, grade, section);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_attention_calls_teacher ON attention_calls(teacher_id);
CREATE INDEX IF NOT EXISTS idx_attention_calls_tutor ON attention_calls(tutor_id);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on new tables
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE attention_calls ENABLE ROW LEVEL SECURITY;

-- Policies for new tables (allow all for now, restrict later per school_id)
CREATE POLICY "tasks_anon_select" ON tasks FOR SELECT TO anon USING (true);
CREATE POLICY "tasks_anon_insert" ON tasks FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "tasks_anon_update" ON tasks FOR UPDATE TO anon USING (true);
CREATE POLICY "tasks_anon_delete" ON tasks FOR DELETE TO anon USING (true);
CREATE POLICY "tasks_auth_all" ON tasks FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "task_submissions_anon_select" ON task_submissions FOR SELECT TO anon USING (true);
CREATE POLICY "task_submissions_anon_insert" ON task_submissions FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "task_submissions_anon_update" ON task_submissions FOR UPDATE TO anon USING (true);
CREATE POLICY "task_submissions_auth_all" ON task_submissions FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "exams_anon_select" ON exams FOR SELECT TO anon USING (true);
CREATE POLICY "exams_anon_insert" ON exams FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "exams_anon_update" ON exams FOR UPDATE TO anon USING (true);
CREATE POLICY "exams_anon_delete" ON exams FOR DELETE TO anon USING (true);
CREATE POLICY "exams_auth_all" ON exams FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "notifications_anon_select" ON notifications FOR SELECT TO anon USING (true);
CREATE POLICY "notifications_anon_insert" ON notifications FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "notifications_anon_update" ON notifications FOR UPDATE TO anon USING (true);
CREATE POLICY "notifications_auth_all" ON notifications FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "attention_calls_anon_select" ON attention_calls FOR SELECT TO anon USING (true);
CREATE POLICY "attention_calls_anon_insert" ON attention_calls FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "attention_calls_anon_update" ON attention_calls FOR UPDATE TO anon USING (true);
CREATE POLICY "attention_calls_auth_all" ON attention_calls FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Enable RLS on existing tables (if not already)
ALTER TABLE institutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE sanctions ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;

-- Policies for existing tables
CREATE POLICY "institutions_anon_all" ON institutions FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "institutions_auth_all" ON institutions FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "users_anon_all" ON users FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "users_auth_all" ON users FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "students_anon_all" ON students FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "students_auth_all" ON students FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "roles_anon_all" ON roles FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "roles_auth_all" ON roles FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "family_anon_all" ON family_relationships FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "family_auth_all" ON family_relationships FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "attendance_anon_all" ON attendance FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "attendance_auth_all" ON attendance FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "sanctions_anon_all" ON sanctions FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "sanctions_auth_all" ON sanctions FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "announcements_anon_all" ON announcements FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "announcements_auth_all" ON announcements FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "subjects_anon_all" ON subjects FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "subjects_auth_all" ON subjects FOR ALL TO authenticated USING (true) WITH CHECK (true);
