import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity, StyleSheet, ActivityIndicator, RefreshControl, Alert } from 'react-native';
import { useAuthStore } from '../../../store/useAuthStore';
import { useTheme } from '../../../hooks/useTheme';
import { useRouter } from 'expo-router';
import {
    Bell,
    BookOpen,
    Calendar,
    ShieldAlert,
    LogOut,
    CheckCircle2,
    Clock,
    ChevronRight,
    AlertCircle
} from 'lucide-react-native';
import * as db from '../../../services/databaseService';

export default function StudentDashboard() {
    const theme = useTheme();
    const user = useAuthStore((state) => state.user);
    const logout = useAuthStore((state) => state.logout);
    const router = useRouter();

    const [isLoading, setIsLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // Mock de datos para visualización inicial (luego los traeremos de DB)
    const [studentData, setStudentData] = useState({
        absences: { justified: 2, unjustified: 3 },
        sanctions: 1,
        pendingTasks: 4,
        nextExam: 'Matemáticas - 15/01'
    });

    const fetchData = async () => {
        setIsLoading(true);
        try {
            // Aquí irán las llamadas a tu databaseService específicas para el alumno
            // Ejemplo: const data = await db.getStudentStats(user.id);
            await new Promise(resolve => setTimeout(resolve, 1000)); // Simulación
        } finally {
            setIsLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    const handleLogout = () => {
        Alert.alert("Cerrar Sesión", "¿Estás seguro de que quieres salir?", [
            { text: "Cancelar", style: "cancel" },
            {
                text: "Salir", style: "destructive", onPress: async () => {
                    await logout();
                    router.replace('/(auth)/login');
                }
            }
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
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchData(); }} colors={[theme.primary]} />}
        >
            {/* Header Premium Alumno */}
            <View style={[styles.header, { backgroundColor: theme.primary }]}>
                <View style={styles.headerTop}>
                    <View style={styles.profileBox}>
                        <Image source={{ uri: `https://ui-avatars.com/api/?name=${user?.name}&background=fff&color=${theme.primary.replace('#', '')}` }} style={styles.avatar} />
                        <View>
                            <Text style={styles.welcomeText}>Hola, {user?.name.split(' ')[0]}</Text>
                            <Text style={styles.subText}>Alumno • Violet Wave EDU</Text>
                        </View>
                    </View>
                    <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
                        <LogOut size={20} color="white" />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Metrics Row 1: Asistencia */}
            <View style={styles.metricsContainer}>
                <Text style={styles.sectionTitle}>Estado de Asistencia</Text>
                <View style={styles.metricsRow}>
                    <View style={[styles.metricCard, { backgroundColor: '#10B981' }]}>
                        <CheckCircle2 size={24} color="white" />
                        <Text style={styles.metricNumber}>{studentData.absences.justified}</Text>
                        <Text style={styles.metricLabel}>Faltas Justif.</Text>
                    </View>
                    <View style={[styles.metricCard, { backgroundColor: '#F59E0B' }]}>
                        <Clock size={24} color="white" />
                        <Text style={styles.metricNumber}>{studentData.absences.unjustified}</Text>
                        <Text style={styles.metricLabel}>Inasistencias</Text>
                    </View>
                </View>

                {/* Metrics Row 2: Conducta y Tareas */}
                <View style={styles.metricsRow}>
                    <View style={[styles.metricCard, { backgroundColor: '#EF4444' }]}>
                        <ShieldAlert size={24} color="white" />
                        <Text style={styles.metricNumber}>{studentData.sanctions}</Text>
                        <Text style={styles.metricLabel}>Sanciones</Text>
                    </View>
                    <View style={[styles.metricCard, { backgroundColor: '#6366F1' }]}>
                        <BookOpen size={24} color="white" />
                        <Text style={styles.metricNumber}>{studentData.pendingTasks}</Text>
                        <Text style={styles.metricLabel}>Tareas Pend.</Text>
                    </View>
                </View>
            </View>

            {/* Acciones Rápidas */}
            <View style={{ paddingHorizontal: 20, marginBottom: 20 }}>
                <Text style={styles.sectionTitle}>Próximos Eventos</Text>
                <TouchableOpacity style={styles.examCard}>
                    <View style={styles.examIconBox}>
                        <Calendar size={24} color="#6366F1" />
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.examTitle}>Próximo Examen</Text>
                        <Text style={styles.examDetail}>{studentData.nextExam}</Text>
                    </View>
                    <ChevronRight size={20} color="#9CA3AF" />
                </TouchableOpacity>
            </View>

            {/* Tareas Recientes */}
            <View style={{ paddingHorizontal: 20, marginBottom: 100 }}>
                <Text style={styles.sectionTitle}>Últimas Tareas</Text>
                <View style={styles.activityCard}>
                    <View style={styles.activityItem}>
                        <View style={[styles.activityIcon, { backgroundColor: '#DBEAFE' }]}>
                            <BookOpen size={20} color="#3B82F6" />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.activityText}>Ensayo de Historia</Text>
                            <Text style={styles.activityTime}>Vence mañana</Text>
                        </View>
                    </View>
                </View>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F0F2F5' },
    loadingText: { marginTop: 15, fontSize: 16, color: '#6B7280' },
    header: { paddingTop: 60, paddingBottom: 30, paddingHorizontal: 20, borderBottomLeftRadius: 35, borderBottomRightRadius: 35 },
    headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    profileBox: { flexDirection: 'row', alignItems: 'center' },
    avatar: { width: 50, height: 50, borderRadius: 15, marginRight: 12, borderWidth: 2, borderColor: 'white' },
    welcomeText: { color: 'white', fontSize: 20, fontWeight: 'bold' },
    subText: { color: 'rgba(255,255,255,0.8)', fontSize: 14 },
    logoutBtn: { backgroundColor: 'rgba(255,255,255,0.2)', padding: 10, borderRadius: 15 },
    metricsContainer: { paddingHorizontal: 20, paddingTop: 20 },
    metricsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
    metricCard: { flex: 1, marginHorizontal: 5, borderRadius: 25, padding: 20, alignItems: 'center', elevation: 3, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10 },
    metricNumber: { fontSize: 28, fontWeight: 'bold', color: 'white', marginTop: 10 },
    metricLabel: { fontSize: 12, color: 'rgba(255,255,255,0.9)', marginTop: 5, fontWeight: '600', textAlign: 'center' },
    sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#1F2937', marginBottom: 15, marginTop: 10 },
    examCard: { backgroundColor: 'white', borderRadius: 25, padding: 20, flexDirection: 'row', alignItems: 'center', elevation: 2 },
    examIconBox: { backgroundColor: '#EEF2FF', padding: 12, borderRadius: 15, marginRight: 15 },
    examTitle: { fontSize: 15, fontWeight: 'bold', color: '#1F2937' },
    examDetail: { fontSize: 13, color: '#6366F1', marginTop: 2, fontWeight: '600' },
    activityCard: { backgroundColor: 'white', borderRadius: 25, padding: 15, elevation: 2 },
    activityItem: { flexDirection: 'row', alignItems: 'center' },
    activityIcon: { padding: 10, borderRadius: 15, marginRight: 15 },
    activityText: { fontWeight: 'bold', color: '#1F2937', fontSize: 14 },
    activityTime: { color: '#9CA3AF', fontSize: 12, marginTop: 2 },
});