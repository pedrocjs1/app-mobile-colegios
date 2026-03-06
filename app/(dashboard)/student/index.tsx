import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity, StyleSheet, ActivityIndicator, RefreshControl, Alert } from 'react-native';
import { useAuthStore } from '../../../store/useAuthStore';
import { useTheme } from '../../../hooks/useTheme';
import { useRouter } from 'expo-router';
import { BookOpen, Calendar, ShieldAlert, LogOut, CheckCircle2, Clock } from 'lucide-react-native';
import * as db from '../../../services/databaseService';

export default function StudentDashboard() {
    const theme = useTheme();
    const user = useAuthStore((state) => state.user);
    const logout = useAuthStore((state) => state.logout);
    const router = useRouter();

    const [isLoading, setIsLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [stats, setStats] = useState({
        justified: 0, unjustified: 0, sanctions: 0, pendingTasks: 0, nextExam: ''
    });

    const fetchData = async () => {
        if (!user?.id || !user?.school_id) { setIsLoading(false); return; }
        try {
            const student = await db.getStudentByUserId(user.id);
            if (!student) { setIsLoading(false); return; }

            const [attendance, sanctions, tasks, submissions, exams] = await Promise.all([
                db.getStudentAttendance(student.id),
                db.getStudentSanctions(student.id),
                db.getTasksForStudent(user.school_id, student.grade, student.section),
                db.getStudentSubmissions(student.id),
                db.getExamsForStudent(user.school_id, student.grade, student.section)
            ]);

            const justified = attendance.filter((a: any) => a.status === 'excused').length;
            const unjustified = attendance.filter((a: any) => a.status === 'absent').length;
            const submittedIds = new Set(submissions.map((s: any) => s.task_id));
            const pending = tasks.filter((t: any) => !submittedIds.has(t.id)).length;
            const futureExams = exams
                .filter((e: any) => new Date(e.exam_date) >= new Date())
                .sort((a: any, b: any) => new Date(a.exam_date).getTime() - new Date(b.exam_date).getTime());

            setStats({
                justified, unjustified,
                sanctions: sanctions.filter((s: any) => !s.resolved).length,
                pendingTasks: pending,
                nextExam: futureExams.length > 0
                    ? `${futureExams[0].title} - ${futureExams[0].exam_date}`
                    : 'Sin pruebas programadas'
            });
        } catch (e) { console.error(e); }
        finally { setIsLoading(false); setRefreshing(false); }
    };

    useEffect(() => { fetchData(); }, [user?.id]);
    const onRefresh = () => { setRefreshing(true); fetchData(); };

    const handleLogout = () => {
        Alert.alert("Cerrar Sesión", "¿Estás seguro de que quieres salir?", [
            { text: "Cancelar", style: "cancel" },
            { text: "Salir", style: "destructive", onPress: async () => { await logout(); router.replace('/(auth)/login'); } }
        ]);
    };

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={theme.primary} />
                <Text style={styles.loadingText}>Cargando tu progreso...</Text>
            </View>
        );
    }

    return (
        <ScrollView
            style={{ flex: 1, backgroundColor: '#F0F2F5' }}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[theme.primary]} />}
        >
            <View style={[styles.header, { backgroundColor: theme.primary }]}>
                <View style={styles.headerTop}>
                    <View style={styles.profileBox}>
                        <Image source={{ uri: `https://ui-avatars.com/api/?name=${user?.name}&background=fff&color=${theme.primary.replace('#', '')}&bold=true` }} style={styles.avatar} />
                        <View>
                            <Text style={styles.welcomeText}>Hola, {user?.name?.split(' ')[0]}</Text>
                            <Text style={styles.subText}>Panel de Estudiante</Text>
                        </View>
                    </View>
                    <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
                        <LogOut size={20} color="white" />
                    </TouchableOpacity>
                </View>
            </View>

            <View style={styles.metricsContainer}>
                <Text style={styles.sectionTitle}>Mi Estado Escolar</Text>
                <View style={styles.metricsRow}>
                    <View style={[styles.metricCard, { backgroundColor: '#10B981' }]}>
                        <CheckCircle2 size={24} color="white" />
                        <Text style={styles.metricNumber}>{stats.justified}</Text>
                        <Text style={styles.metricLabel}>Justificadas</Text>
                    </View>
                    <View style={[styles.metricCard, { backgroundColor: '#F59E0B' }]}>
                        <Clock size={24} color="white" />
                        <Text style={styles.metricNumber}>{stats.unjustified}</Text>
                        <Text style={styles.metricLabel}>Faltas</Text>
                    </View>
                </View>
                <View style={styles.metricsRow}>
                    <View style={[styles.metricCard, { backgroundColor: '#EF4444' }]}>
                        <ShieldAlert size={24} color="white" />
                        <Text style={styles.metricNumber}>{stats.sanctions}</Text>
                        <Text style={styles.metricLabel}>Sanciones</Text>
                    </View>
                    <View style={[styles.metricCard, { backgroundColor: '#6366F1' }]}>
                        <BookOpen size={24} color="white" />
                        <Text style={styles.metricNumber}>{stats.pendingTasks}</Text>
                        <Text style={styles.metricLabel}>Tareas</Text>
                    </View>
                </View>

                <Text style={styles.sectionTitle}>Próximo Examen</Text>
                <View style={styles.examCard}>
                    <Calendar size={24} color={theme.primary} />
                    <View style={{ flex: 1, marginLeft: 15 }}>
                        <Text style={styles.examDetail}>{stats.nextExam}</Text>
                    </View>
                </View>
            </View>
            <View style={{ height: 100 }} />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F0F2F5' },
    loadingText: { marginTop: 10, color: '#6B7280' },
    header: { paddingTop: 60, paddingBottom: 35, paddingHorizontal: 20, borderBottomLeftRadius: 35, borderBottomRightRadius: 35, elevation: 5 },
    headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    profileBox: { flexDirection: 'row', alignItems: 'center' },
    avatar: { width: 50, height: 50, borderRadius: 15, marginRight: 12, borderWidth: 2, borderColor: 'white' },
    welcomeText: { color: 'white', fontSize: 20, fontWeight: 'bold' },
    subText: { color: 'rgba(255,255,255,0.8)', fontSize: 13 },
    logoutBtn: { backgroundColor: 'rgba(255,255,255,0.2)', padding: 10, borderRadius: 15 },
    metricsContainer: { padding: 20 },
    sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#1F2937', marginBottom: 15, marginTop: 10 },
    metricsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
    metricCard: { flex: 1, marginHorizontal: 5, borderRadius: 25, padding: 20, alignItems: 'center', elevation: 3 },
    metricNumber: { fontSize: 28, fontWeight: 'bold', color: 'white', marginTop: 10 },
    metricLabel: { fontSize: 11, color: 'white', fontWeight: '600', marginTop: 5 },
    examCard: { backgroundColor: 'white', borderRadius: 20, padding: 20, flexDirection: 'row', alignItems: 'center', elevation: 2 },
    examDetail: { fontSize: 15, fontWeight: 'bold', color: '#1F2937' }
});
