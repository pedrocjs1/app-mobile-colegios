import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, TextInput } from 'react-native';
import { useAuthStore } from '../../../store/useAuthStore';
import { useTheme } from '../../../hooks/useTheme';
import { CalendarCheck, Check, X, Clock, ChevronDown, UserCheck } from 'lucide-react-native';
import * as db from '../../../services/databaseService';

type AttendanceStatus = 'present' | 'absent' | 'late' | 'excused';

export default function PreceptorAsistencia() {
    const theme = useTheme();
    const user = useAuthStore((state) => state.user);

    const [loading, setLoading] = useState(true);
    const [students, setStudents] = useState<any[]>([]);
    const [selectedGrade, setSelectedGrade] = useState('1ro');
    const [selectedSection, setSelectedSection] = useState('A');
    const [attendanceMap, setAttendanceMap] = useState<Record<string, AttendanceStatus>>({});
    const [saving, setSaving] = useState(false);
    const [showGradeSelector, setShowGradeSelector] = useState(false);

    const grades = ['1ro', '2do', '3ro', '4to', '5to', '6to', '7mo'];
    const sections = ['A', 'B', 'C'];
    const today = new Date().toISOString().split('T')[0];

    const loadStudents = async () => {
        if (!user?.school_id) return;
        setLoading(true);
        try {
            const data = await db.getStudentsByClass(user.school_id, selectedGrade, selectedSection);
            setStudents(data);
            const map: Record<string, AttendanceStatus> = {};
            data.forEach((s: any) => { map[s.id] = 'present'; });
            setAttendanceMap(map);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadStudents(); }, [selectedGrade, selectedSection]);

    const toggleStatus = (studentId: string) => {
        setAttendanceMap(prev => {
            const current = prev[studentId];
            const next: AttendanceStatus =
                current === 'present' ? 'absent' :
                current === 'absent' ? 'late' :
                current === 'late' ? 'excused' : 'present';
            return { ...prev, [studentId]: next };
        });
    };

    const getStatusConfig = (status: AttendanceStatus) => {
        switch (status) {
            case 'present': return { color: '#10B981', bg: '#D1FAE5', label: 'Presente', icon: <Check size={16} color="#10B981" /> };
            case 'absent': return { color: '#EF4444', bg: '#FEE2E2', label: 'Ausente', icon: <X size={16} color="#EF4444" /> };
            case 'late': return { color: '#F59E0B', bg: '#FEF3C7', label: 'Tarde', icon: <Clock size={16} color="#F59E0B" /> };
            case 'excused': return { color: '#3B82F6', bg: '#DBEAFE', label: 'Justificado', icon: <UserCheck size={16} color="#3B82F6" /> };
        }
    };

    const saveAttendance = async () => {
        if (!user?.school_id || !user?.id) return;
        setSaving(true);
        try {
            for (const [studentId, status] of Object.entries(attendanceMap)) {
                await db.recordAttendance({
                    school_id: user.school_id,
                    student_id: studentId,
                    date: today,
                    status,
                    recorded_by: user.id
                });
            }
            Alert.alert('Guardado', 'La asistencia fue registrada correctamente.');
        } catch (e: any) {
            Alert.alert('Error', e.message || 'No se pudo guardar la asistencia.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <View style={styles.container}>
            <View style={[styles.header, { backgroundColor: theme.primary }]}>
                <Text style={styles.headerTitle}>Asistencia</Text>
                <Text style={styles.headerSub}>Registro diario - {today}</Text>
            </View>

            {/* Selector de Grado y Sección */}
            <View style={styles.selectorContainer}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 10 }}>
                    {grades.map(g => (
                        <TouchableOpacity
                            key={g}
                            style={[styles.chip, selectedGrade === g && { backgroundColor: theme.primary }]}
                            onPress={() => setSelectedGrade(g)}
                        >
                            <Text style={[styles.chipText, selectedGrade === g && { color: 'white' }]}>{g}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {sections.map(s => (
                        <TouchableOpacity
                            key={s}
                            style={[styles.chip, selectedSection === s && { backgroundColor: theme.primary }]}
                            onPress={() => setSelectedSection(s)}
                        >
                            <Text style={[styles.chipText, selectedSection === s && { color: 'white' }]}>Sección {s}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                {loading ? (
                    <ActivityIndicator size="large" color={theme.primary} style={{ marginTop: 40 }} />
                ) : students.length === 0 ? (
                    <View style={styles.emptyState}>
                        <CalendarCheck size={48} color="#D1D5DB" />
                        <Text style={styles.emptyText}>No hay alumnos en {selectedGrade} {selectedSection}</Text>
                    </View>
                ) : (
                    <>
                        {students.map((student) => {
                            const status = attendanceMap[student.id] || 'present';
                            const config = getStatusConfig(status);
                            return (
                                <TouchableOpacity
                                    key={student.id}
                                    style={styles.studentCard}
                                    onPress={() => toggleStatus(student.id)}
                                    activeOpacity={0.7}
                                >
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.studentName}>{student.first_name} {student.last_name}</Text>
                                    </View>
                                    <View style={[styles.statusBadge, { backgroundColor: config.bg }]}>
                                        {config.icon}
                                        <Text style={[styles.statusText, { color: config.color }]}>{config.label}</Text>
                                    </View>
                                </TouchableOpacity>
                            );
                        })}

                        <TouchableOpacity
                            style={[styles.saveButton, { backgroundColor: theme.primary }]}
                            onPress={saveAttendance}
                            disabled={saving}
                        >
                            {saving ? (
                                <ActivityIndicator color="white" />
                            ) : (
                                <>
                                    <CalendarCheck size={20} color="white" />
                                    <Text style={styles.saveButtonText}>Guardar Asistencia</Text>
                                </>
                            )}
                        </TouchableOpacity>
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
    selectorContainer: { paddingHorizontal: 20, paddingTop: 20 },
    chip: { backgroundColor: 'white', paddingHorizontal: 18, paddingVertical: 10, borderRadius: 20, marginRight: 10, elevation: 2 },
    chipText: { fontSize: 13, fontWeight: '700', color: '#4B5563' },
    content: { padding: 20, paddingBottom: 120 },
    studentCard: { backgroundColor: 'white', borderRadius: 20, padding: 18, flexDirection: 'row', alignItems: 'center', marginBottom: 10, elevation: 2 },
    studentName: { fontSize: 15, fontWeight: '700', color: '#1F2937' },
    statusBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, gap: 6 },
    statusText: { fontSize: 12, fontWeight: '700' },
    saveButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 18, borderRadius: 25, marginTop: 20, gap: 10, elevation: 3 },
    saveButtonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
    emptyState: { alignItems: 'center', marginTop: 60 },
    emptyText: { color: '#9CA3AF', fontSize: 14, marginTop: 15 },
});
