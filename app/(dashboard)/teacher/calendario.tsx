import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, Modal, TextInput } from 'react-native';
import { useAuthStore } from '../../../store/useAuthStore';
import { useTheme } from '../../../hooks/useTheme';
import { Calendar, Plus, BookOpen, Clock, X } from 'lucide-react-native';
import * as db from '../../../services/databaseService';

export default function TeacherCalendario() {
    const theme = useTheme();
    const user = useAuthStore((state) => state.user);

    const [loading, setLoading] = useState(true);
    const [exams, setExams] = useState<any[]>([]);
    const [subjects, setSubjects] = useState<any[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [saving, setSaving] = useState(false);

    // Form
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [selectedSubject, setSelectedSubject] = useState<any>(null);
    const [examDate, setExamDate] = useState('');

    const loadData = async () => {
        if (!user?.id) return;
        try {
            const [examsData, subjectsData] = await Promise.all([
                db.getExamsByTeacher(user.id),
                db.getTeacherSubjects(user.id)
            ]);
            setExams(examsData);
            setSubjects(subjectsData);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadData(); }, []);

    const handleCreate = async () => {
        if (!title.trim() || !selectedSubject || !examDate || !user?.id || !user?.school_id) return;
        setSaving(true);
        try {
            await db.createExam({
                school_id: user.school_id,
                teacher_id: user.id,
                subject_id: selectedSubject.id,
                title: title.trim(),
                description: description.trim(),
                grade: selectedSubject.grade,
                section: selectedSubject.section,
                exam_date: examDate
            });
            Alert.alert('Programada', 'La prueba fue programada correctamente.');
            setShowModal(false);
            resetForm();
            loadData();
        } catch (e: any) {
            Alert.alert('Error', e.message || 'No se pudo programar la prueba.');
        } finally {
            setSaving(false);
        }
    };

    const resetForm = () => {
        setTitle('');
        setDescription('');
        setSelectedSubject(null);
        setExamDate('');
    };

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr + 'T12:00:00');
        const days = ['DOM', 'LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB'];
        const months = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'];
        return {
            day: date.getDate().toString(),
            weekday: days[date.getDay()],
            month: months[date.getMonth()]
        };
    };

    const getDaysUntil = (dateStr: string) => {
        const diff = Math.ceil((new Date(dateStr).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
        if (diff < 0) return { text: 'Pasada', color: '#9CA3AF' };
        if (diff === 0) return { text: 'Hoy', color: '#EF4444' };
        if (diff <= 3) return { text: `En ${diff} días`, color: '#F59E0B' };
        return { text: `En ${diff} días`, color: '#10B981' };
    };

    return (
        <View style={styles.container}>
            <View style={[styles.header, { backgroundColor: theme.primary }]}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <View>
                        <Text style={styles.headerTitle}>Calendario de Pruebas</Text>
                        <Text style={styles.headerSub}>Exámenes programados</Text>
                    </View>
                    <TouchableOpacity style={styles.addBtn} onPress={() => setShowModal(true)}>
                        <Plus size={22} color="white" />
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                {loading ? (
                    <ActivityIndicator size="large" color={theme.primary} style={{ marginTop: 40 }} />
                ) : exams.length === 0 ? (
                    <View style={styles.emptyState}>
                        <Calendar size={48} color="#D1D5DB" />
                        <Text style={styles.emptyText}>No hay pruebas programadas</Text>
                        <Text style={styles.emptySubtext}>Tocá + para programar una prueba</Text>
                    </View>
                ) : (
                    exams.map((exam) => {
                        const dateInfo = formatDate(exam.exam_date);
                        const countdown = getDaysUntil(exam.exam_date);
                        return (
                            <View key={exam.id} style={styles.examCard}>
                                <View style={[styles.dateBox, { borderColor: theme.primary }]}>
                                    <Text style={styles.dateDay}>{dateInfo.day}</Text>
                                    <Text style={styles.dateMonth}>{dateInfo.month}</Text>
                                    <Text style={styles.dateWeekday}>{dateInfo.weekday}</Text>
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.examTitle}>{exam.title}</Text>
                                    <Text style={styles.examSubject}>{exam.grade} {exam.section}</Text>
                                    {exam.description && (
                                        <Text style={styles.examDesc}>{exam.description}</Text>
                                    )}
                                    <View style={styles.countdownRow}>
                                        <Clock size={12} color={countdown.color} />
                                        <Text style={[styles.countdownText, { color: countdown.color }]}>{countdown.text}</Text>
                                    </View>
                                </View>
                            </View>
                        );
                    })
                )}
            </ScrollView>

            {/* Modal Nueva Prueba */}
            <Modal visible={showModal} animationType="slide" transparent>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Programar Prueba</Text>
                            <TouchableOpacity onPress={() => { setShowModal(false); resetForm(); }}>
                                <X size={24} color="#6B7280" />
                            </TouchableOpacity>
                        </View>

                        <Text style={styles.label}>Título</Text>
                        <TextInput
                            style={styles.textInput}
                            placeholder="Ej: Examen de Fracciones"
                            value={title}
                            onChangeText={setTitle}
                        />

                        <Text style={styles.label}>Descripción (opcional)</Text>
                        <TextInput
                            style={[styles.textInput, { minHeight: 60 }]}
                            placeholder="Temas a evaluar..."
                            multiline
                            value={description}
                            onChangeText={setDescription}
                        />

                        <Text style={styles.label}>Materia / Curso</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 15 }}>
                            {subjects.map((s: any) => (
                                <TouchableOpacity
                                    key={s.id}
                                    style={[styles.chip, selectedSubject?.id === s.id && { backgroundColor: theme.primary }]}
                                    onPress={() => setSelectedSubject(s)}
                                >
                                    <Text style={[styles.chipText, selectedSubject?.id === s.id && { color: 'white' }]}>
                                        {s.name} ({s.grade} {s.section})
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>

                        <Text style={styles.label}>Fecha del examen (YYYY-MM-DD)</Text>
                        <TextInput
                            style={styles.textInput}
                            placeholder="2025-04-20"
                            value={examDate}
                            onChangeText={setExamDate}
                        />

                        <TouchableOpacity
                            style={[styles.saveButton, { backgroundColor: theme.primary }]}
                            onPress={handleCreate}
                            disabled={saving || !title.trim() || !selectedSubject || !examDate}
                        >
                            {saving ? <ActivityIndicator color="white" /> : (
                                <Text style={styles.saveButtonText}>Programar Prueba</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F0F2F5' },
    header: { paddingTop: 60, paddingBottom: 30, paddingHorizontal: 25, borderBottomLeftRadius: 40, borderBottomRightRadius: 40 },
    headerTitle: { color: 'white', fontSize: 24, fontWeight: '900' },
    headerSub: { color: 'rgba(255,255,255,0.8)', fontSize: 14, marginTop: 4 },
    addBtn: { backgroundColor: 'rgba(255,255,255,0.2)', padding: 12, borderRadius: 15 },
    content: { padding: 20, paddingBottom: 120 },
    examCard: { backgroundColor: 'white', borderRadius: 25, padding: 20, flexDirection: 'row', alignItems: 'center', marginBottom: 15, elevation: 2 },
    dateBox: { borderWidth: 2, borderRadius: 18, padding: 12, alignItems: 'center', marginRight: 18, width: 65 },
    dateDay: { fontSize: 22, fontWeight: 'bold', color: '#1F2937' },
    dateMonth: { fontSize: 10, fontWeight: '800', color: '#6B7280' },
    dateWeekday: { fontSize: 9, fontWeight: '700', color: '#9CA3AF', marginTop: 2 },
    examTitle: { fontSize: 16, fontWeight: 'bold', color: '#1F2937' },
    examSubject: { fontSize: 12, color: '#6B7280', marginTop: 2 },
    examDesc: { fontSize: 12, color: '#9CA3AF', marginTop: 4 },
    countdownRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 8 },
    countdownText: { fontSize: 11, fontWeight: '700' },
    emptyState: { alignItems: 'center', marginTop: 60 },
    emptyText: { color: '#9CA3AF', fontSize: 14, marginTop: 15 },
    emptySubtext: { color: '#D1D5DB', fontSize: 12, marginTop: 5 },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    modalContent: { backgroundColor: 'white', borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 25, maxHeight: '85%' },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#1F2937' },
    label: { fontSize: 14, fontWeight: '700', color: '#374151', marginBottom: 10 },
    chip: { backgroundColor: '#F3F4F6', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, marginRight: 8 },
    chipText: { fontSize: 12, fontWeight: '700', color: '#4B5563' },
    textInput: { backgroundColor: '#F9FAFB', borderRadius: 15, padding: 15, fontSize: 14, borderWidth: 1, borderColor: '#E5E7EB', marginBottom: 15, textAlignVertical: 'top' },
    saveButton: { padding: 18, borderRadius: 25, alignItems: 'center', elevation: 3, marginTop: 5 },
    saveButtonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
});
