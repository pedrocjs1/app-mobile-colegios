import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useAuthStore } from '../../../store/useAuthStore';
import { useTheme } from '../../../hooks/useTheme';
import { useRouter } from 'expo-router';
import { Users, ChevronRight, BookOpen, ShieldAlert, CalendarCheck } from 'lucide-react-native';
import * as db from '../../../services/databaseService';

export default function TutorHijos() {
    const theme = useTheme();
    const user = useAuthStore((state) => state.user);
    const router = useRouter();

    const [loading, setLoading] = useState(true);
    const [children, setChildren] = useState<any[]>([]);
    const [childStats, setChildStats] = useState<Record<string, any>>({});

    const loadData = async () => {
        if (!user?.id || !user?.school_id) return;
        try {
            const childrenData = await db.getTutorChildren(user.id);
            setChildren(childrenData);

            // Cargar stats de cada hijo
            const statsMap: Record<string, any> = {};
            for (const child of childrenData) {
                const [attendance, sanctions] = await Promise.all([
                    db.getStudentAttendance(child.id),
                    db.getStudentSanctions(child.id)
                ]);
                const absences = attendance.filter((a: any) => a.status === 'absent' || a.status === 'late').length;
                const activeSanctions = sanctions.filter((s: any) => !s.resolved).length;
                const totalDays = attendance.length;
                const presentDays = attendance.filter((a: any) => a.status === 'present' || a.status === 'excused').length;
                statsMap[child.id] = {
                    absences,
                    sanctions: activeSanctions,
                    attendanceRate: totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 100
                };
            }
            setChildStats(statsMap);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadData(); }, []);

    return (
        <View style={styles.container}>
            <View style={[styles.header, { backgroundColor: theme.primary }]}>
                <Text style={styles.headerTitle}>Mis Hijos</Text>
                <Text style={styles.headerSub}>Estado escolar de tus hijos</Text>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                {loading ? (
                    <ActivityIndicator size="large" color={theme.primary} style={{ marginTop: 40 }} />
                ) : children.length === 0 ? (
                    <View style={styles.emptyCard}>
                        <Users size={48} color="#D1D5DB" />
                        <Text style={styles.emptyText}>No hay hijos vinculados</Text>
                    </View>
                ) : (
                    children.map((child) => {
                        const stats = childStats[child.id] || { absences: 0, sanctions: 0, attendanceRate: 100 };
                        return (
                            <TouchableOpacity
                                key={child.id}
                                style={styles.childCard}
                                onPress={() => router.push(`/(dashboard)/hijos/${child.id}`)}
                            >
                                <View style={styles.childHeader}>
                                    <Image
                                        source={{ uri: child.avatar_url || `https://ui-avatars.com/api/?name=${child.first_name}+${child.last_name}&background=6366f1&color=fff` }}
                                        style={styles.childAvatar}
                                    />
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.childName}>{child.first_name} {child.last_name}</Text>
                                        <Text style={styles.childGrade}>{child.grade} - Sección {child.section}</Text>
                                    </View>
                                    <ChevronRight size={20} color="#9CA3AF" />
                                </View>

                                <View style={styles.statsRow}>
                                    <View style={styles.statItem}>
                                        <View style={[styles.statIcon, { backgroundColor: '#D1FAE5' }]}>
                                            <CalendarCheck size={16} color="#10B981" />
                                        </View>
                                        <Text style={styles.statValue}>{stats.attendanceRate}%</Text>
                                        <Text style={styles.statLabel}>Asistencia</Text>
                                    </View>
                                    <View style={styles.statItem}>
                                        <View style={[styles.statIcon, { backgroundColor: '#FEF3C7' }]}>
                                            <BookOpen size={16} color="#F59E0B" />
                                        </View>
                                        <Text style={styles.statValue}>{stats.absences}</Text>
                                        <Text style={styles.statLabel}>Faltas</Text>
                                    </View>
                                    <View style={styles.statItem}>
                                        <View style={[styles.statIcon, { backgroundColor: '#FEE2E2' }]}>
                                            <ShieldAlert size={16} color="#EF4444" />
                                        </View>
                                        <Text style={styles.statValue}>{stats.sanctions}</Text>
                                        <Text style={styles.statLabel}>Sanciones</Text>
                                    </View>
                                </View>
                            </TouchableOpacity>
                        );
                    })
                )}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F0F2F5' },
    header: { paddingTop: 60, paddingBottom: 30, paddingHorizontal: 25, borderBottomLeftRadius: 40, borderBottomRightRadius: 40 },
    headerTitle: { color: 'white', fontSize: 24, fontWeight: '900' },
    headerSub: { color: 'rgba(255,255,255,0.8)', fontSize: 14, marginTop: 4 },
    content: { padding: 20, paddingBottom: 120 },
    childCard: { backgroundColor: 'white', borderRadius: 25, padding: 20, marginBottom: 15, elevation: 2 },
    childHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
    childAvatar: { width: 50, height: 50, borderRadius: 18, marginRight: 15 },
    childName: { fontSize: 17, fontWeight: 'bold', color: '#1F2937' },
    childGrade: { fontSize: 13, color: '#6B7280', marginTop: 2 },
    statsRow: { flexDirection: 'row', justifyContent: 'space-around', borderTopWidth: 1, borderTopColor: '#F3F4F6', paddingTop: 15 },
    statItem: { alignItems: 'center' },
    statIcon: { padding: 8, borderRadius: 10, marginBottom: 6 },
    statValue: { fontSize: 18, fontWeight: 'bold', color: '#1F2937' },
    statLabel: { fontSize: 11, color: '#9CA3AF', fontWeight: '600' },
    emptyCard: { backgroundColor: 'white', borderRadius: 20, padding: 40, alignItems: 'center', elevation: 1, gap: 10 },
    emptyText: { color: '#6B7280', fontSize: 14 },
});
