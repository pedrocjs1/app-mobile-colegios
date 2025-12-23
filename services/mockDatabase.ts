// Mock Database Service for Multi-Tenant Education App
// This simulates a backend database with role-based access control

import { UserRole, User } from '../store/useAuthStore';

// ============================================
// TYPES
// ============================================

export interface Institution {
    id: string;
    name: string;
    address: string;
    phone: string;
    email: string;
    logo_url?: string;
    primary_color: string;
    secondary_color: string;
    academic_year: string;
}

export interface Student {
    id: string;
    school_id: string;
    first_name: string;
    last_name: string;
    date_of_birth: string;
    grade: string;
    section: string;
    avatar_url?: string;
    enrollment_date: string;
    is_active: boolean;
}

export interface StaffMember {
    id: string;
    school_id: string;
    name: string;
    email: string;
    phone: string;
    role: 'teacher' | 'preceptor';
    avatar_url?: string;
    is_active: boolean;
}

export interface Family {
    id: string;
    school_id: string;
    tutor_id: string;
    tutor_name: string;
    tutor_email: string;
    students: Student[];
}

export interface Attendance {
    id: string;
    school_id: string;
    student_id: string;
    date: string;
    status: 'present' | 'absent' | 'late' | 'excused';
    notes?: string;
}

export interface Sanction {
    id: string;
    school_id: string;
    student_id: string;
    type: string;
    description: string;
    date: string;
    resolved: boolean;
}

// ============================================
// MOCK DATA
// ============================================

const mockInstitutions: Institution[] = [
    {
        id: 'school_A',
        name: 'Academy Alpha',
        address: 'Av. Libertador 1234, CABA',
        phone: '+54 11 4567-8900',
        email: 'info@academyalpha.edu.ar',
        primary_color: '#6366F1',
        secondary_color: '#EC4899',
        academic_year: '2024',
    },
    {
        id: 'school_B',
        name: 'Greenwood High',
        address: 'Calle San Martín 567, Córdoba',
        phone: '+54 351 456-7890',
        email: 'contacto@greenwood.edu.ar',
        primary_color: '#10B981',
        secondary_color: '#F59E0B',
        academic_year: '2024',
    },
    {
        id: 'school_C',
        name: 'Instituto San Martín',
        address: 'Av. Belgrano 890, Rosario',
        phone: '+54 341 567-8901',
        email: 'admin@sanmartin.edu.ar',
        primary_color: '#8B5CF6',
        secondary_color: '#EC4899',
        academic_year: '2024',
    },
];

const mockUsers: (User & { password: string })[] = [
    // Tutors
    {
        id: 'user_tutor_1',
        name: 'Flia. Gomez',
        email: 'gomez@example.com',
        password: 'demo123',
        role: 'tutor',
        school_id: 'school_A',
        avatar_url: 'https://i.pravatar.cc/150?img=32',
    },
    {
        id: 'user_tutor_2',
        name: 'Flia. Perez',
        email: 'perez@example.com',
        password: 'demo123',
        role: 'tutor',
        school_id: 'school_B',
        avatar_url: 'https://i.pravatar.cc/150?img=33',
    },
    // Rector
    {
        id: 'user_rector_1',
        name: 'Director Rodriguez',
        email: 'rodriguez@sanmartin.edu.ar',
        password: 'demo123',
        role: 'rector',
        school_id: 'school_C',
        avatar_url: 'https://i.pravatar.cc/150?img=60',
    },
];

const mockStaff: StaffMember[] = [
    {
        id: 'staff_1',
        school_id: 'school_C',
        name: 'Prof. María García',
        email: 'mgarcia@sanmartin.edu.ar',
        phone: '+54 341 567-1111',
        role: 'teacher',
        avatar_url: 'https://i.pravatar.cc/150?img=45',
        is_active: true,
    },
    {
        id: 'staff_2',
        school_id: 'school_C',
        name: 'Prof. Juan Martínez',
        email: 'jmartinez@sanmartin.edu.ar',
        phone: '+54 341 567-2222',
        role: 'teacher',
        avatar_url: 'https://i.pravatar.cc/150?img=12',
        is_active: true,
    },
    {
        id: 'staff_3',
        school_id: 'school_C',
        name: 'Prec. Laura Fernández',
        email: 'lfernandez@sanmartin.edu.ar',
        phone: '+54 341 567-3333',
        role: 'preceptor',
        avatar_url: 'https://i.pravatar.cc/150?img=47',
        is_active: true,
    },
    {
        id: 'staff_4',
        school_id: 'school_C',
        name: 'Prof. Carlos López',
        email: 'clopez@sanmartin.edu.ar',
        phone: '+54 341 567-4444',
        role: 'teacher',
        avatar_url: 'https://i.pravatar.cc/150?img=13',
        is_active: true,
    },
];

const mockStudents: Student[] = [
    {
        id: 'student_1',
        school_id: 'school_C',
        first_name: 'Sofía',
        last_name: 'González',
        date_of_birth: '2010-05-15',
        grade: '7mo',
        section: 'A',
        avatar_url: 'https://i.pravatar.cc/150?img=5',
        enrollment_date: '2024-03-01',
        is_active: true,
    },
    {
        id: 'student_2',
        school_id: 'school_C',
        first_name: 'Mateo',
        last_name: 'Ramírez',
        date_of_birth: '2011-08-22',
        grade: '6to',
        section: 'B',
        avatar_url: 'https://i.pravatar.cc/150?img=8',
        enrollment_date: '2024-03-01',
        is_active: true,
    },
    {
        id: 'student_3',
        school_id: 'school_C',
        first_name: 'Valentina',
        last_name: 'Torres',
        date_of_birth: '2009-12-10',
        grade: '8vo',
        section: 'A',
        avatar_url: 'https://i.pravatar.cc/150?img=9',
        enrollment_date: '2024-03-01',
        is_active: true,
    },
];

// ============================================
// MOCK DATABASE SERVICE
// ============================================

class MockDatabase {
    // Authentication
    async authenticateUser(email: string, password: string): Promise<User | null> {
        const user = mockUsers.find(
            (u) => u.email === email && u.password === password
        );

        if (!user) return null;

        // Return user without password
        const { password: _, ...userWithoutPassword } = user;
        return userWithoutPassword;
    }

    // Get user by credentials (for demo login)
    getUserByRole(role: UserRole, schoolId: string): User | null {
        const user = mockUsers.find(
            (u) => u.role === role && u.school_id === schoolId
        );

        if (!user) return null;

        const { password: _, ...userWithoutPassword } = user;
        return userWithoutPassword;
    }

    // Institutions
    getInstitution(schoolId: string): Institution | null {
        return mockInstitutions.find((i) => i.id === schoolId) || null;
    }

    // Staff Management
    getStaff(schoolId: string, role?: 'teacher' | 'preceptor'): StaffMember[] {
        let staff = mockStaff.filter((s) => s.school_id === schoolId);

        if (role) {
            staff = staff.filter((s) => s.role === role);
        }

        return staff;
    }

    addStaffMember(staff: Omit<StaffMember, 'id'>): StaffMember {
        const newStaff: StaffMember = {
            ...staff,
            id: `staff_${Date.now()}`,
        };
        mockStaff.push(newStaff);
        return newStaff;
    }

    // Student Management
    getStudents(schoolId: string): Student[] {
        return mockStudents.filter((s) => s.school_id === schoolId);
    }

    getStudent(studentId: string): Student | null {
        return mockStudents.find((s) => s.id === studentId) || null;
    }

    // Family Management
    getFamilies(schoolId: string): Family[] {
        // Mock family data - in real app, this would join users and students
        return [
            {
                id: 'family_1',
                school_id: schoolId,
                tutor_id: 'tutor_1',
                tutor_name: 'Flia. González',
                tutor_email: 'gonzalez@example.com',
                students: mockStudents.filter((s) => s.school_id === schoolId).slice(0, 2),
            },
            {
                id: 'family_2',
                school_id: schoolId,
                tutor_id: 'tutor_2',
                tutor_name: 'Flia. Ramírez',
                tutor_email: 'ramirez@example.com',
                students: mockStudents.filter((s) => s.school_id === schoolId).slice(1, 2),
            },
        ];
    }

    // Metrics for Dashboard
    getSchoolMetrics(schoolId: string) {
        const students = this.getStudents(schoolId);
        const staff = this.getStaff(schoolId);

        return {
            totalStudents: students.length,
            totalStaff: staff.length,
            totalTeachers: staff.filter((s) => s.role === 'teacher').length,
            totalPreceptors: staff.filter((s) => s.role === 'preceptor').length,
            pendingRegistrations: 3, // Mock value
            attendanceRate: 94.5, // Mock value
        };
    }

    // Recent Activity (mock)
    getRecentActivity(schoolId: string) {
        return [
            {
                id: 'activity_1',
                type: 'enrollment',
                description: 'Nueva inscripción: Sofía González',
                timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
                icon: 'UserPlus',
            },
            {
                id: 'activity_2',
                type: 'staff',
                description: 'Nuevo docente: Prof. María García',
                timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
                icon: 'Users',
            },
            {
                id: 'activity_3',
                type: 'announcement',
                description: 'Publicado: Reunión de padres - 25/12',
                timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
                icon: 'Bell',
            },
        ];
    }
}

// Export singleton instance
export const mockDB = new MockDatabase();
