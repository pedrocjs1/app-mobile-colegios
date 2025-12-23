import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity, StyleSheet, ActivityIndicator, RefreshControl } from 'react-native';
import { useAuthStore } from '../../../store/useAuthStore';
import { useTheme } from '../../../hooks/useTheme';
import { useRouter } from 'expo-router';
import { Bell, Users, UserPlus, Settings, FileText, TrendingUp, Calendar, AlertCircle } from 'lucide-react-native';
import * as db from '../../../services/databaseService';

export default function RectorDashboard() {
    const theme = useTheme();
    const user = useAuthStore((state) => state.user);
    const router = useRouter();

    // State
    const [institution, setInstitution] = useState<any>(null);
    const [metrics, setMetrics] = useState<any>(null);
    const [recentActivity, setRecentActivity] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [refreshing, setRefreshing] = useState(false);

    // Fetch data
    const fetchData = async () => {
        if (!user?.school_id) {
            setError('No se encontró el ID de la institución');
            setIsLoading(false);
            return;
        }

        try {
            setError(null);

            // Fetch all data in parallel
            const [institutionData, metricsData, activityData] = await Promise.all([
                db.getInstitution(user.school_id),
                db.getSchoolMetrics(user.school_id),
                db.getRecentActivity(user.school_id),
            ]);

            setInstitution(institutionData);
            setMetrics(metricsData);
            setRecentActivity(activityData);
        } catch (err) {
            console.error('Error fetching dashboard data:', err);
            setError('Error al cargar los datos. Por favor intenta de nuevo.');
        } finally {
            setIsLoading(false);
            setRefreshing(false);
        }
    };

    // Initial load
    useEffect(() => {
        fetchData();
    }, [user?.school_id]);

    // Pull to refresh
    const onRefresh = () => {
        setRefreshing(true);
        fetchData();
    };

    // Loading state
    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={theme.primary} />
                <Text style={styles.loadingText}>Cargando dashboard...</Text>
            </View>
        );
    }

    // Error state
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
            refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[theme.primary]} />
            }
        >
            {/* Header Premium */}
            <View style={[styles.header, { backgroundColor: theme.primary }]}>
                <View style={styles.headerTop}>
                    <View style={styles.profileBox}>
                        <Image
                            source={{ uri: user?.avatar_url || 'https://i.pravatar.cc/150?img=60' }}
                            style={styles.avatar}
                        />
                        <View>
                            <Text style={styles.welcomeText}>{user?.name || 'Director'}</Text>
                            <Text style={styles.subText}>{institution?.name || 'Instituto'}</Text>
                        </View>
                    </View>
                    <TouchableOpacity style={styles.notifBtn}>
                        <Bell size={22} color="white" />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Metrics Cards */}
            <View style={styles.metricsContainer}>
                <View style={styles.metricsRow}>
                    <View style={[styles.metricCard, { backgroundColor: '#6366F1' }]}>
                        <Users size={28} color="white" />
                        <Text style={styles.metricNumber}>{metrics?.totalStudents || 0}</Text>
                        <Text style={styles.metricLabel}>Alumnos</Text>
                    </View>

                    <View style={[styles.metricCard, { backgroundColor: '#EC4899' }]}>
                        <UserPlus size={28} color="white" />
                        <Text style={styles.metricNumber}>{metrics?.totalStaff || 0}</Text>
                        <Text style={styles.metricLabel}>Personal</Text>
                    </View>
                </View>

                <View style={styles.metricsRow}>
                    <View style={[styles.metricCard, { backgroundColor: '#10B981' }]}>
                        <FileText size={28} color="white" />
                        <Text style={styles.metricNumber}>{metrics?.pendingRegistrations || 0}</Text>
                        <Text style={styles.metricLabel}>Pendientes</Text>
                    </View>

                    <View style={[styles.metricCard, { backgroundColor: '#F59E0B' }]}>
                        <TrendingUp size={28} color="white" />
                        <Text style={styles.metricNumber}>{metrics?.attendanceRate || 0}%</Text>
                        <Text style={styles.metricLabel}>Asistencia</Text>
                    </View>
                </View>
            </View>

            {/* Quick Actions */}
            <View style={{ paddingHorizontal: 20, marginBottom: 20 }}>
                <Text style={styles.sectionTitle}>Acciones Rápidas</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <TouchableOpacity
                        style={[styles.actionCard, { backgroundColor: '#6366F1' }]}
                        onPress={() => router.push('/(dashboard)/rector/personal')}
                    >
                        <Users size={32} color="white" />
                        <Text style={styles.actionText}>Gestión de{'\n'}Personal</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.actionCard, { backgroundColor: '#EC4899' }]}
                        onPress={() => router.push('/(dashboard)/rector/familias')}
                    >
                        <UserPlus size={32} color="white" />
                        <Text style={styles.actionText}>Registro de{'\n'}Familias</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.actionCard, { backgroundColor: '#10B981' }]}
                        onPress={() => router.push('/(dashboard)/rector/configuracion')}
                    >
                        <Settings size={32} color="white" />
                        <Text style={styles.actionText}>Configuración{'\n'}Escolar</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.actionCard, { backgroundColor: '#8B5CF6' }]}
                    >
                        <FileText size={32} color="white" />
                        <Text style={styles.actionText}>Reportes{'\n'}y Métricas</Text>
                    </TouchableOpacity>
                </ScrollView>
            </View>

            {/* Recent Activity */}
            <View style={{ paddingHorizontal: 20, marginBottom: 30 }}>
                <Text style={styles.sectionTitle}>Actividad Reciente</Text>
                <View style={styles.activityCard}>
                    {recentActivity.length > 0 ? (
                        recentActivity.map((activity, index) => (
                            <View key={activity.id} style={styles.activityItem}>
                                <View style={[styles.activityIcon, { backgroundColor: getActivityColor(activity.type) }]}>
                                    {getActivityIcon(activity.type)}
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.activityText}>{activity.description}</Text>
                                    <Text style={styles.activityTime}>{formatTime(activity.timestamp)}</Text>
                                </View>
                            </View>
                        ))
                    ) : (
                        <Text style={styles.emptyText}>No hay actividad reciente</Text>
                    )}
                </View>
            </View>
        </ScrollView>
    );
}

// Helper functions
function getActivityColor(type: string): string {
    switch (type) {
        case 'enrollment': return '#DBEAFE';
        case 'staff': return '#FCE7F3';
        case 'announcement': return '#FEF3C7';
        default: return '#F3F4F6';
    }
}

function getActivityIcon(type: string) {
    switch (type) {
        case 'enrollment': return <UserPlus size={20} color="#3B82F6" />;
        case 'staff': return <Users size={20} color="#EC4899" />;
        case 'announcement': return <Bell size={20} color="#F59E0B" />;
        default: return <Calendar size={20} color="#6B7280" />;
    }
}

function formatTime(timestamp: string): string {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

    if (diffHours < 1) return 'Hace menos de 1 hora';
    if (diffHours < 24) return `Hace ${diffHours} horas`;
    const diffDays = Math.floor(diffHours / 24);
    return `Hace ${diffDays} día${diffDays > 1 ? 's' : ''}`;
}

const styles = StyleSheet.create({
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F0F2F5',
    },
    loadingText: {
        marginTop: 15,
        fontSize: 16,
        color: '#6B7280',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F0F2F5',
        paddingHorizontal: 40,
    },
    errorTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1F2937',
        marginTop: 15,
    },
    errorText: {
        fontSize: 14,
        color: '#6B7280',
        textAlign: 'center',
        marginTop: 8,
    },
    retryButton: {
        marginTop: 20,
        backgroundColor: '#6366F1',
        paddingHorizontal: 30,
        paddingVertical: 12,
        borderRadius: 20,
    },
    retryButtonText: {
        color: 'white',
        fontSize: 14,
        fontWeight: 'bold',
    },
    header: {
        paddingTop: 60,
        paddingBottom: 30,
        paddingHorizontal: 20,
        borderBottomLeftRadius: 35,
        borderBottomRightRadius: 35,
    },
    headerTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    profileBox: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatar: {
        width: 50,
        height: 50,
        borderRadius: 15,
        marginRight: 12,
        borderWidth: 2,
        borderColor: 'white',
    },
    welcomeText: {
        color: 'white',
        fontSize: 20,
        fontWeight: 'bold',
    },
    subText: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: 14,
    },
    notifBtn: {
        backgroundColor: 'rgba(255,255,255,0.2)',
        padding: 10,
        borderRadius: 15,
    },
    metricsContainer: {
        paddingHorizontal: 20,
        paddingTop: 20,
    },
    metricsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 15,
    },
    metricCard: {
        flex: 1,
        marginHorizontal: 5,
        borderRadius: 25,
        padding: 20,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 3,
    },
    metricNumber: {
        fontSize: 32,
        fontWeight: 'bold',
        color: 'white',
        marginTop: 10,
    },
    metricLabel: {
        fontSize: 13,
        color: 'rgba(255,255,255,0.9)',
        marginTop: 5,
        fontWeight: '600',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1F2937',
        marginBottom: 15,
    },
    actionCard: {
        width: 140,
        height: 140,
        borderRadius: 25,
        padding: 20,
        marginRight: 15,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 3,
    },
    actionText: {
        color: 'white',
        fontSize: 14,
        fontWeight: 'bold',
        textAlign: 'center',
        marginTop: 10,
    },
    activityCard: {
        backgroundColor: 'white',
        borderRadius: 25,
        padding: 15,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
    activityItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
    },
    activityIcon: {
        padding: 10,
        borderRadius: 15,
        marginRight: 15,
    },
    activityText: {
        fontWeight: 'bold',
        color: '#1F2937',
        fontSize: 14,
    },
    activityTime: {
        color: '#9CA3AF',
        fontSize: 12,
        marginTop: 2,
    },
    emptyText: {
        textAlign: 'center',
        color: '#9CA3AF',
        fontSize: 14,
        paddingVertical: 20,
    },
});
