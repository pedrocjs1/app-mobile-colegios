import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { useTheme } from '../../../hooks/useTheme';
import { useAuthStore } from '../../../store/useAuthStore';
import { CalendarCheck, AlertTriangle, CheckCircle2, Clock } from 'lucide-react-native';
import * as db from '../../../services/databaseService';

export default function StudentAsistencia() {
    const theme = useTheme();
    const user = useAuthStore((state) => state.user);

    const [loading, setLoading] = useState(true);
    const [attendance, setAttendance] = useState<any[]>([]);
    const [stats, setStats] = useState({ present: 0, absent: 0, late: 0, excused: 0 });

    const loadData = async () => {
        if (!user?.id) return;
        try {
            const student = await db.getStudentByUserId(user.id);
            if (!student) { setLoading(false); return; }

            const data = await db.getStudentAttendance(student.id);
            setAttendance(data);

            setStats({
                present: data.filter((a: any) => a.status === 'present').length,
                absent: data.filter((a: any) => a.status === 'absent').length,
                late: data.filter((a: any) => a.status === 'late').length,
                excused: data.filter((a: any) => a.status === 'excused').length,
            });
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadData(); }, []);

    const totalDays = stats.present + stats.absent + stats.late + stats.excused;
    const presenceRate = totalDays > 0 ? Math.round(((stats.present + stats.excused) / totalDays) * 100) : 100;

    const getStatusConfig = (status: string) => {
        switch (status) {
            case 'present': return { label: 'Presente', color: '#10B981', bg: '#D1FAE5' };
            case 'absent': return { label: 'Ausente', color: '#EF4444', bg: '#FEE2E2' };
            case 'late': return { label: 'Tarde', color: '#F59E0B', bg: '#FEF3C7' };
            case 'excused': return { label: 'Justificado', color: '#3B82F6', bg: '#DBEAFE' };
            default: return { label: status, color: '#6B7280', bg: '#F3F4F6' };
        }
    };

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr + 'T12:00:00');
        const months = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'];
        return { day: date.getDate().toString().padStart(2, '0'), month: months[date.getMonth()] };
    };

    return (
        <View style={styles.container}>
            <View style={[styles.header, { backgroundColor: theme.primary }]}>
                <Text style={styles.headerTitle}>Mi Asistencia</Text>
                <Text style={styles.headerSub}>Resumen del ciclo lectivo actual</Text>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                {loading ? (
                    <ActivityIndicator size="large" color={theme.primary} style={{ marginTop: 40 }} />
                ) : (
                    <>
                        <View style={styles.summaryContainer}>
                            <View style={[styles.summaryCard, { backgroundColor: '#10B981' }]}>
                                <CheckCircle2 size={24} color="white" />
                                <Text style={styles.summaryNum}>{presenceRate}%</Text>
                                <Text style={styles.summaryLabel}>Presencia</Text>
                            </View>
                            <View style={[styles.summaryCard, { backgroundColor: '#F59E0B' }]}>
                                <AlertTriangle size={24} color="white" />
                                <Text style={styles.summaryNum}>{stats.absent + stats.late}</Text>
                                <Text style={styles.summaryLabel}>Inasistencias</Text>
                            </View>
                        </View>

                        <Text style={styles.sectionTitle}>Registro de Faltas</Text>

                        {attendance.filter(a => a.status !== 'present').length === 0 ? (
                            <View style={styles.emptyCard}>
                                <CheckCircle2 size={32} color="#10B981" />
                                <Text style={styles.emptyText}>Sin inasistencias registradas</Text>
                            </View>
                        ) : (
                            <View style={styles.historyCard}>
                                {attendance
                                    .filter(a => a.status !== 'present')
                                    .map((record, index, arr) => {
                                        const config = getStatusConfig(record.status);
                                        const dateInfo = formatDate(record.date);
                                        return (
                                            <View key={record.id} style={[styles.historyItem, index === arr.length - 1 && { borderBottomWidth: 0 }]}>
                                                <View style={styles.dateBox}>
                                                    <Text style={styles.dateDay}>{dateInfo.day}</Text>
                                                    <Text style={styles.dateMonth}>{dateInfo.month}</Text>
                                                </View>
                                                <View style={{ flex: 1 }}>
                                                    <Text style={styles.historyType}>{config.label}</Text>
                                                    {record.notes && <Text style={styles.historyReason}>{record.notes}</Text>}
                                                </View>
                                                <View style={[styles.badge, { backgroundColor: config.bg }]}>
                                                    <Text style={{ color: config.color, fontSize: 10, fontWeight: 'bold' }}>
                                                        {config.label.toUpperCase()}
                                                    </Text>
                                                </View>
                                            </View>
                                        );
                                    })}
                            </View>
                        )}
                    </>
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
    content: { padding: 20, paddingBottom: 100 },
    summaryContainer: { flexDirection: 'row', gap: 15, marginBottom: 25 },
    summaryCard: { flex: 1, borderRadius: 25, padding: 20, alignItems: 'center', elevation: 3 },
    summaryNum: { color: 'white', fontSize: 24, fontWeight: 'bold', marginTop: 8 },
    summaryLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 11, fontWeight: '700' },
    sectionTitle: { fontSize: 18, fontWeight: '800', color: '#1F2937', marginBottom: 15 },
    historyCard: { backgroundColor: 'white', borderRadius: 30, padding: 10, elevation: 2 },
    historyItem: { flexDirection: 'row', alignItems: 'center', padding: 15, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
    dateBox: { backgroundColor: '#F3F4F6', padding: 8, borderRadius: 12, alignItems: 'center', marginRight: 15, width: 50 },
    dateDay: { fontSize: 16, fontWeight: 'bold', color: '#1F2937' },
    dateMonth: { fontSize: 9, fontWeight: '800', color: '#6B7280' },
    historyType: { fontSize: 14, fontWeight: 'bold', color: '#1F2937' },
    historyReason: { fontSize: 12, color: '#6B7280', marginTop: 2 },
    badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
    emptyCard: { backgroundColor: 'white', borderRadius: 20, padding: 30, alignItems: 'center', elevation: 1, gap: 10 },
    emptyText: { color: '#6B7280', fontSize: 14 },
});
