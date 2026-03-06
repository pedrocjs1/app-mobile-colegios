import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity, StyleSheet, ActivityIndicator, RefreshControl } from 'react-native';
import { useAuthStore } from '../../../store/useAuthStore';
import { useTheme } from '../../../hooks/useTheme';
import { useRouter } from 'expo-router';
import { Bell, Users, ShieldAlert, CalendarCheck, AlertCircle, ClipboardList } from 'lucide-react-native';
import * as db from '../../../services/databaseService';

export default function PreceptorDashboard() {
    const theme = useTheme();
    const user = useAuthStore((state) => state.user);
    const router = useRouter();

    const [isLoading, setIsLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [metrics, setMetrics] = useState({ totalStudents: 0, totalSanctions: 0, attendanceRate: 0 });
    const [error, setError] = useState<string | null>(null);

    const fetchData = async () => {
        if (!user?.school_id) return;
        try {
            setError(null);
            const metricsData = await db.getSchoolMetrics(user.school_id);
            setMetrics({
                totalStudents: metricsData.totalStudents,
                totalSanctions: 0,
                attendanceRate: metricsData.attendanceRate
            });
        } catch (err) {
            setError('Error al cargar los datos.');
        } finally {
            setIsLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => { fetchData(); }, [user?.school_id]);

    const onRefresh = () => { setRefreshing(true); fetchData(); };

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={theme.primary} />
                <Text style={styles.loadingText}>Cargando panel...</Text>
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.errorContainer}>
                <AlertCircle size={48} color="#EF4444" />
                <Text style={styles.errorTitle}>Error</Text>
                <Text style={styles.errorText}>{error}</Text>
                <TouchableOpacity style={styles.retryButton} onPress={fetchData}>
                    <Text style={styles.retryButtonText}>Reintentar</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <ScrollView
            style={{ flex: 1, backgroundColor: '#F0F2F5' }}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[theme.primary]} />}
        >
            {/* Header */}
            <View style={[styles.header, { backgroundColor: theme.primary }]}>
                <View style={styles.headerTop}>
                    <View style={styles.profileBox}>
                        <Image
                            source={{ uri: user?.avatar_url || `https://ui-avatars.com/api/?name=${user?.name}&background=fff&color=${theme.primary.replace('#', '')}&bold=true` }}
                            style={styles.avatar}
                        />
                        <View>
                            <Text style={styles.welcomeText}>{user?.name || 'Preceptor'}</Text>
                            <Text style={styles.subText}>Panel de Preceptor</Text>
                        </View>
                    </View>
                    <TouchableOpacity style={styles.notifBtn}>
                        <Bell size={22} color="white" />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Métricas */}
            <View style={styles.metricsContainer}>
                <View style={styles.metricsRow}>
                    <View style={[styles.metricCard, { backgroundColor: '#6366F1' }]}>
                        <Users size={28} color="white" />
                        <Text style={styles.metricNumber}>{metrics.totalStudents}</Text>
                        <Text style={styles.metricLabel}>Alumnos</Text>
                    </View>
                    <View style={[styles.metricCard, { backgroundColor: '#10B981' }]}>
                        <CalendarCheck size={28} color="white" />
                        <Text style={styles.metricNumber}>{metrics.attendanceRate}%</Text>
                        <Text style={styles.metricLabel}>Asistencia</Text>
                    </View>
                </View>
            </View>

            {/* Acciones Rápidas */}
            <View style={{ paddingHorizontal: 20, marginBottom: 20 }}>
                <Text style={styles.sectionTitle}>Acciones Rápidas</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <TouchableOpacity
                        style={[styles.actionCard, { backgroundColor: '#6366F1' }]}
                        onPress={() => router.push('/(dashboard)/preceptor/asistencia')}
                    >
                        <CalendarCheck size={32} color="white" />
                        <Text style={styles.actionText}>Tomar{'\n'}Asistencia</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.actionCard, { backgroundColor: '#EF4444' }]}
                        onPress={() => router.push('/(dashboard)/preceptor/sanciones')}
                    >
                        <ShieldAlert size={32} color="white" />
                        <Text style={styles.actionText}>Gestionar{'\n'}Sanciones</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.actionCard, { backgroundColor: '#F59E0B' }]}
                    >
                        <ClipboardList size={32} color="white" />
                        <Text style={styles.actionText}>Reportes{'\n'}Diarios</Text>
                    </TouchableOpacity>
                </ScrollView>
            </View>
            <View style={{ height: 100 }} />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F0F2F5' },
    loadingText: { marginTop: 15, fontSize: 16, color: '#6B7280' },
    errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F0F2F5', paddingHorizontal: 40 },
    errorTitle: { fontSize: 24, fontWeight: 'bold', color: '#1F2937', marginTop: 15 },
    errorText: { fontSize: 14, color: '#6B7280', textAlign: 'center', marginTop: 8 },
    retryButton: { marginTop: 20, backgroundColor: '#6366F1', paddingHorizontal: 30, paddingVertical: 12, borderRadius: 20 },
    retryButtonText: { color: 'white', fontSize: 14, fontWeight: 'bold' },
    header: { paddingTop: 60, paddingBottom: 30, paddingHorizontal: 20, borderBottomLeftRadius: 35, borderBottomRightRadius: 35 },
    headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    profileBox: { flexDirection: 'row', alignItems: 'center' },
    avatar: { width: 50, height: 50, borderRadius: 15, marginRight: 12, borderWidth: 2, borderColor: 'white' },
    welcomeText: { color: 'white', fontSize: 20, fontWeight: 'bold' },
    subText: { color: 'rgba(255,255,255,0.8)', fontSize: 14 },
    notifBtn: { backgroundColor: 'rgba(255,255,255,0.2)', padding: 10, borderRadius: 15 },
    metricsContainer: { paddingHorizontal: 20, paddingTop: 20 },
    metricsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
    metricCard: { flex: 1, marginHorizontal: 5, borderRadius: 25, padding: 20, alignItems: 'center', elevation: 3 },
    metricNumber: { fontSize: 32, fontWeight: 'bold', color: 'white', marginTop: 10 },
    metricLabel: { fontSize: 13, color: 'rgba(255,255,255,0.9)', marginTop: 5, fontWeight: '600' },
    sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#1F2937', marginBottom: 15 },
    actionCard: { width: 140, height: 140, borderRadius: 25, padding: 20, marginRight: 15, justifyContent: 'center', alignItems: 'center', elevation: 3 },
    actionText: { color: 'white', fontSize: 14, fontWeight: 'bold', textAlign: 'center', marginTop: 10 },
});
