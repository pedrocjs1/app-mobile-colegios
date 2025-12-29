import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, RefreshControl } from 'react-native';
import { useAuthStore } from '../../../store/useAuthStore';
import { useTheme } from '../../../hooks/useTheme';
import {
    Bell, ShieldAlert, FilePlus, CalendarDays,
    Send, ChevronRight, BookMarked, LogOut, Users, User, ClipboardList
} from 'lucide-react-native';
import { getTeacherSubjects, getStudentsByClass } from '../../../services/databaseService';

export default function TeacherDashboard() {
    const theme = useTheme();
    const { user, logout } = useAuthStore();

    const [loading, setLoading] = useState(true);
    const [subjects, setSubjects] = useState<any[]>([]);
    const [selectedSubject, setSelectedSubject] = useState<any>(null);
    const [students, setStudents] = useState<any[]>([]);
    const [loadingStudents, setLoadingStudents] = useState(false);

    // Cargar materias del docente
    const loadData = async () => {
        if (!user?.id) return;
        try {
            setLoading(true);
            const data = await getTeacherSubjects(user.id);
            setSubjects(data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadData(); }, []);

    const handleSelectSubject = async (subject: any) => {
        setSelectedSubject(subject);
        setLoadingStudents(true);
        try {
            const data = await getStudentsByClass(user!.school_id, subject.grade, subject.section);
            setStudents(data);
        } finally {
            setLoadingStudents(false);
        }
    };

    return (
        <View style={{ flex: 1, backgroundColor: '#F0F2F5' }}>
            {/* Header */}
            <View style={[styles.header, { backgroundColor: theme.primary }]}>
                <View style={styles.headerContent}>
                    <View>
                        <Text style={styles.welcomeText}>¡Hola, Profe!</Text>
                        <Text style={styles.userName}>{user?.name || 'Docente'}</Text>
                    </View>
                    <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
                        <LogOut size={22} color="white" />
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 100 }}>
                {/* MATERIAS */}
                <View style={styles.sectionContainer}>
                    <Text style={styles.sectionTitle}>Mis Materias y Cursos</Text>
                    {loading ? <ActivityIndicator color={theme.primary} /> : subjects.map((sub) => (
                        <TouchableOpacity
                            key={sub.id}
                            style={[styles.subjectCard, selectedSubject?.id === sub.id && { borderColor: theme.primary, borderWidth: 2 }]}
                            onPress={() => handleSelectSubject(sub)}
                        >
                            <View style={[styles.subjectIndicator, { backgroundColor: theme.primary }]} />
                            <View style={{ flex: 1 }}>
                                <Text style={styles.subjectName}>{sub.name}</Text>
                                <Text style={styles.subjectDetail}>{sub.grade} - {sub.section}</Text>
                            </View>
                            <ChevronRight size={20} color={theme.primary} />
                        </TouchableOpacity>
                    ))}
                </View>

                {/* ALUMNOS (Solo si hay materia seleccionada) */}
                {selectedSubject && (
                    <View style={styles.sectionContainer}>
                        <Text style={styles.sectionTitle}>Alumnos de {selectedSubject.name}</Text>
                        {loadingStudents ? <ActivityIndicator /> : students.map((stu) => (
                            <View key={stu.id} style={styles.studentCard}>
                                <Text style={styles.studentName}>{stu.first_name} {stu.last_name}</Text>
                                <View style={{ flexDirection: 'row', gap: 10 }}>
                                    <TouchableOpacity style={styles.actionBtn} onPress={() => Alert.alert("Sanción", "Módulo en desarrollo")}>
                                        <ShieldAlert size={18} color="#EF4444" />
                                    </TouchableOpacity>
                                    <TouchableOpacity style={styles.actionBtn} onPress={() => Alert.alert("Citar", "Módulo en desarrollo")}>
                                        <Send size={18} color={theme.primary} />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        ))}
                    </View>
                )}

                {/* ACCIONES DE GESTIÓN */}
                <View style={styles.sectionContainer}>
                    <Text style={styles.sectionTitle}>Gestión Académica</Text>
                    <View style={{ flexDirection: 'row', gap: 15 }}>
                        <TouchableOpacity style={styles.gridBtn} onPress={() => Alert.alert("Tareas", "Módulo para subir tareas")}>
                            <FilePlus size={24} color="#8B5CF6" />
                            <Text style={styles.gridBtnText}>Nueva Tarea</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.gridBtn} onPress={() => Alert.alert("Pruebas", "Módulo para subir notas")}>
                            <ClipboardList size={24} color="#F59E0B" />
                            <Text style={styles.gridBtnText}>Nueva Prueba</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    header: { paddingTop: 60, paddingBottom: 40, paddingHorizontal: 25, borderBottomLeftRadius: 40, borderBottomRightRadius: 40 },
    headerContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    welcomeText: { color: 'rgba(255,255,255,0.8)', fontSize: 16, fontWeight: '600' },
    userName: { color: 'white', fontSize: 24, fontWeight: '900' },
    logoutBtn: { backgroundColor: 'rgba(255,255,255,0.2)', padding: 10, borderRadius: 15 },
    sectionContainer: { marginTop: 25, paddingHorizontal: 20 },
    sectionTitle: { fontSize: 18, fontWeight: '800', color: '#1F2937', marginBottom: 15 },
    subjectCard: { backgroundColor: 'white', borderRadius: 22, padding: 18, marginBottom: 12, flexDirection: 'row', alignItems: 'center', elevation: 2 },
    subjectIndicator: { width: 4, height: 35, borderRadius: 2, marginRight: 15 },
    subjectName: { fontSize: 16, fontWeight: 'bold', color: '#1F2937' },
    subjectDetail: { fontSize: 12, color: '#6B7280' },
    studentCard: { backgroundColor: 'white', borderRadius: 15, padding: 15, marginBottom: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    studentName: { fontWeight: '600', color: '#374151' },
    actionBtn: { padding: 8, backgroundColor: '#F9FAFB', borderRadius: 10 },
    gridBtn: { flex: 1, backgroundColor: 'white', padding: 20, borderRadius: 25, alignItems: 'center', elevation: 2, gap: 8 },
    gridBtnText: { fontSize: 12, fontWeight: '800', color: '#4B5563' }
});