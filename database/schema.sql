-- Multi-Tenant Education Management System Schema
-- White Label Architecture: All data is scoped by school_id

-- ============================================
-- INSTITUTIONS TABLE
-- ============================================
CREATE TABLE institutions (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    address TEXT,
    phone VARCHAR(50),
    email VARCHAR(100),
    logo_url TEXT,
    primary_color VARCHAR(7) DEFAULT '#6366F1',
    secondary_color VARCHAR(7) DEFAULT '#EC4899',
    academic_year VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- ROLES TABLE
-- ============================================
CREATE TABLE roles (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    permissions TEXT -- JSON string of permissions
);

-- ============================================
-- USERS TABLE
-- ============================================
CREATE TABLE users (
    id VARCHAR(50) PRIMARY KEY,
    school_id VARCHAR(50) NOT NULL,
    role_id VARCHAR(50) NOT NULL,
    name VARCHAR(200) NOT NULL,
    email VARCHAR(100) NOT NULL,
    phone VARCHAR(50),
    avatar_url TEXT,
    password_hash VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (school_id) REFERENCES institutions(id) ON DELETE CASCADE,
    FOREIGN KEY (role_id) REFERENCES roles(id),
    UNIQUE(school_id, email)
);

-- ============================================
-- STUDENTS TABLE
-- ============================================
CREATE TABLE students (
    id VARCHAR(50) PRIMARY KEY,
    school_id VARCHAR(50) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    date_of_birth DATE,
    grade VARCHAR(20),
    section VARCHAR(10),
    avatar_url TEXT,
    enrollment_date DATE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (school_id) REFERENCES institutions(id) ON DELETE CASCADE
);

-- ============================================
-- FAMILY_RELATIONSHIPS TABLE
-- ============================================
CREATE TABLE family_relationships (
    id VARCHAR(50) PRIMARY KEY,
    school_id VARCHAR(50) NOT NULL,
    tutor_id VARCHAR(50) NOT NULL,
    student_id VARCHAR(50) NOT NULL,
    relationship_type VARCHAR(50) DEFAULT 'parent', -- parent, guardian, etc.
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (school_id) REFERENCES institutions(id) ON DELETE CASCADE,
    FOREIGN KEY (tutor_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    UNIQUE(tutor_id, student_id)
);

-- ============================================
-- ATTENDANCE TABLE
-- ============================================
CREATE TABLE attendance (
    id VARCHAR(50) PRIMARY KEY,
    school_id VARCHAR(50) NOT NULL,
    student_id VARCHAR(50) NOT NULL,
    date DATE NOT NULL,
    status VARCHAR(20) NOT NULL, -- present, absent, late, excused
    notes TEXT,
    recorded_by VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (school_id) REFERENCES institutions(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (recorded_by) REFERENCES users(id),
    UNIQUE(student_id, date)
);

-- ============================================
-- SANCTIONS TABLE
-- ============================================
CREATE TABLE sanctions (
    id VARCHAR(50) PRIMARY KEY,
    school_id VARCHAR(50) NOT NULL,
    student_id VARCHAR(50) NOT NULL,
    type VARCHAR(100) NOT NULL, -- warning, suspension, etc.
    description TEXT NOT NULL,
    date DATE NOT NULL,
    issued_by VARCHAR(50),
    resolved BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (school_id) REFERENCES institutions(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (issued_by) REFERENCES users(id)
);

-- ============================================
-- ANNOUNCEMENTS TABLE
-- ============================================
CREATE TABLE announcements (
    id VARCHAR(50) PRIMARY KEY,
    school_id VARCHAR(50) NOT NULL,
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'general', -- general, urgent, event
    target_audience VARCHAR(50) DEFAULT 'all', -- all, tutors, staff
    published_by VARCHAR(50),
    published_at TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (school_id) REFERENCES institutions(id) ON DELETE CASCADE,
    FOREIGN KEY (published_by) REFERENCES users(id)
);

-- ============================================
-- TASKS TABLE (Tareas asignadas por docentes)
-- ============================================
CREATE TABLE tasks (
    id VARCHAR(50) PRIMARY KEY,
    school_id VARCHAR(50) NOT NULL,
    teacher_id VARCHAR(50) NOT NULL,
    subject_id VARCHAR(50),
    title VARCHAR(200) NOT NULL,
    description TEXT,
    grade VARCHAR(20) NOT NULL,
    section VARCHAR(10) NOT NULL,
    due_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (school_id) REFERENCES institutions(id) ON DELETE CASCADE,
    FOREIGN KEY (teacher_id) REFERENCES users(id)
);

-- ============================================
-- TASK_SUBMISSIONS TABLE (Entregas de alumnos)
-- ============================================
CREATE TABLE task_submissions (
    id VARCHAR(50) PRIMARY KEY,
    task_id VARCHAR(50) NOT NULL,
    student_id VARCHAR(50) NOT NULL,
    file_url TEXT,
    comment TEXT,
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    grade VARCHAR(10),
    graded_at TIMESTAMP,
    FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    UNIQUE(task_id, student_id)
);

-- ============================================
-- EXAMS TABLE (Calendario de pruebas)
-- ============================================
CREATE TABLE exams (
    id VARCHAR(50) PRIMARY KEY,
    school_id VARCHAR(50) NOT NULL,
    teacher_id VARCHAR(50) NOT NULL,
    subject_id VARCHAR(50),
    title VARCHAR(200) NOT NULL,
    description TEXT,
    grade VARCHAR(20) NOT NULL,
    section VARCHAR(10) NOT NULL,
    exam_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (school_id) REFERENCES institutions(id) ON DELETE CASCADE,
    FOREIGN KEY (teacher_id) REFERENCES users(id)
);

-- ============================================
-- NOTIFICATIONS TABLE (Sistema de notificaciones)
-- ============================================
CREATE TABLE notifications (
    id VARCHAR(50) PRIMARY KEY,
    school_id VARCHAR(50) NOT NULL,
    user_id VARCHAR(50) NOT NULL,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'info', -- info, warning, urgent, health, attention_call
    is_read BOOLEAN DEFAULT FALSE,
    related_id VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (school_id) REFERENCES institutions(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ============================================
-- ATTENTION_CALLS TABLE (Citaciones al tutor)
-- ============================================
CREATE TABLE attention_calls (
    id VARCHAR(50) PRIMARY KEY,
    school_id VARCHAR(50) NOT NULL,
    teacher_id VARCHAR(50) NOT NULL,
    student_id VARCHAR(50) NOT NULL,
    tutor_id VARCHAR(50) NOT NULL,
    reason TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'general', -- general, academic, behavior, health
    status VARCHAR(20) DEFAULT 'pending', -- pending, acknowledged, resolved
    scheduled_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (school_id) REFERENCES institutions(id) ON DELETE CASCADE,
    FOREIGN KEY (teacher_id) REFERENCES users(id),
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (tutor_id) REFERENCES users(id)
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================
CREATE INDEX idx_users_school_role ON users(school_id, role_id);
CREATE INDEX idx_students_school ON students(school_id);
CREATE INDEX idx_attendance_student_date ON attendance(student_id, date);
CREATE INDEX idx_sanctions_student ON sanctions(student_id);
CREATE INDEX idx_announcements_school ON announcements(school_id);
CREATE INDEX idx_family_tutor ON family_relationships(tutor_id);
CREATE INDEX idx_family_student ON family_relationships(student_id);
CREATE INDEX idx_tasks_teacher ON tasks(teacher_id);
CREATE INDEX idx_tasks_class ON tasks(school_id, grade, section);
CREATE INDEX idx_task_submissions_task ON task_submissions(task_id);
CREATE INDEX idx_task_submissions_student ON task_submissions(student_id);
CREATE INDEX idx_exams_teacher ON exams(teacher_id);
CREATE INDEX idx_exams_class ON exams(school_id, grade, section);
CREATE INDEX idx_notifications_user ON notifications(user_id, is_read);
CREATE INDEX idx_attention_calls_teacher ON attention_calls(teacher_id);
CREATE INDEX idx_attention_calls_tutor ON attention_calls(tutor_id);
