import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, Modal, TextInput } from 'react-native';
import { useAuthStore } from '../../../store/useAuthStore';
import { useTheme } from '../../../hooks/useTheme';
import { FilePlus, BookOpen, Clock, ChevronRight, X, Users, CheckCircle } from 'lucide-react-native';
import * as db from '../../../services/databaseService';

export default function TeacherTareas() {
    const theme = useTheme();
    const user = useAuthStore((state) => state.user);

    const [loading, setLoading] = useState(true);
    const [tasks, setTasks] = useState<any[]>([]);
    const [subjects, setSubjects] = useState<any[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [showSubmissions, setShowSubmissions] = useState(false);
    const [selectedTask, setSelectedTask] = useState<any>(null);
    const [submissions, setSubmissions] = useState<any[]>([]);
    const [saving, setSaving] = useState(false);

    // Form
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [selectedSubject, setSelectedSubject] = useState<any>(null);
    const [dueDate, setDueDate] = useState('');

    const loadData = async () => {
        if (!user?.id) return;
        try {
            const [tasksData, subjectsData] = await Promise.all([
                db.getTasksByTeacher(user.id),
                db.getTeacherSubjects(user.id)
            ]);
            setTasks(tasksData);
            setSubjects(subjectsData);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadData(); }, []);

    const handleCreate = async () => {
        if (!title.trim() || !selectedSubject || !dueDate || !user?.id || !user?.school_id) return;
        setSaving(true);
        try {
            await db.createTask({
                school_id: user.school_id,
                teacher_id: user.id,
                subject_id: selectedSubject.id,
                title: title.trim(),
                description: description.trim(),
                grade: selectedSubject.grade,
                section: selectedSubject.section,
                due_date: dueDate
            });
            Alert.alert('Creada', 'La tarea fue asignada correctamente.');
            setShowModal(false);
            resetForm();
            loadData();
        } catch (e: any) {
            Alert.alert('Error', e.message || 'No se pudo crear la tarea.');
        } finally {
            setSaving(false);
        }
    };

    const viewSubmissions = async (task: any) => {
        setSelectedTask(task);
        setShowSubmissions(true);
        try {
            const data = await db.getTaskSubmissions(task.id);
            setSubmissions(data);
        } catch (e) {
            console.error(e);
        }
    };

    const resetForm = () => {
        setTitle('');
        setDescription('');
        setSelectedSubject(null);
        setDueDate('');
    };

    const getDaysLeft = (dateStr: string) => {
        const diff = Math.ceil((new Date(dateStr).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
        if (diff < 0) return { text: 'Vencida', color: '#EF4444' };
        if (diff === 0) return { text: 'Hoy', color: '#F59E0B' };
        if (diff === 1) return { text: 'Mañana', color: '#F59E0B' };
        return { text: `${diff} días`, color: '#10B981' };
    };

    return (
        <View style={styles.container}>
            <View style={[styles.header, { backgroundColor: theme.primary }]}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <View>
                        <Text style={styles.headerTitle}>Mis Tareas</Text>
                        <Text style={styles.headerSub}>Tareas asignadas a tus cursos</Text>
                    </View>
                    <TouchableOpacity style={styles.addBtn} onPress={() => setShowModal(true)}>
                        <FilePlus size={22} color="white" />
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                {loading ? (
                    <ActivityIndicator size="large" color={theme.primary} style={{ marginTop: 40 }} />
                ) : tasks.length === 0 ? (
                    <View style={styles.emptyState}>
                        <BookOpen size={48} color="#D1D5DB" />
                        <Text style={styles.emptyText}>No hay tareas creadas</Text>
                        <Text style={styles.emptySubtext}>Tocá + para crear una nueva tarea</Text>
                    </View>
                ) : (
                    tasks.map((task) => {
                        const deadline = getDaysLeft(task.due_date);
                        return (
                            <TouchableOpacity
                                key={task.id}
                                style={styles.taskCard}
                                onPress={() => viewSubmissions(task)}
                            >
                                <View style={[styles.iconBox, { backgroundColor: '#EEF2FF' }]}>
                                    <BookOpen size={22} color={theme.primary} />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.taskTitle}>{task.title}</Text>
                                    <Text style={styles.taskSubject}>{task.grade} {task.section}</Text>
                                    <View style={styles.deadlineRow}>
                                        <Clock size={12} color={deadline.color} />
                                        <Text style={[styles.deadlineText, { color: deadline.color }]}>{deadline.text}</Text>
                                    </View>
                                </View>
                                <ChevronRight size={20} color="#9CA3AF" />
                            </TouchableOpacity>
                        );
                    })
                )}
            </ScrollView>

            {/* Modal Nueva Tarea */}
            <Modal visible={showModal} animationType="slide" transparent>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Nueva Tarea</Text>
                            <TouchableOpacity onPress={() => { setShowModal(false); resetForm(); }}>
                                <X size={24} color="#6B7280" />
                            </TouchableOpacity>
                        </View>

                        <Text style={styles.label}>Título</Text>
                        <TextInput
                            style={styles.textInput}
                            placeholder="Ej: Ejercicios de Álgebra"
                            value={title}
                            onChangeText={setTitle}
                        />

                        <Text style={styles.label}>Descripción</Text>
                        <TextInput
                            style={[styles.textInput, { minHeight: 80 }]}
                            placeholder="Descripción de la tarea..."
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

                        <Text style={styles.label}>Fecha de entrega (YYYY-MM-DD)</Text>
                        <TextInput
                            style={styles.textInput}
                            placeholder="2025-03-15"
                            value={dueDate}
                            onChangeText={setDueDate}
                        />

                        <TouchableOpacity
                            style={[styles.saveButton, { backgroundColor: theme.primary }]}
                            onPress={handleCreate}
                            disabled={saving || !title.trim() || !selectedSubject || !dueDate}
                        >
                            {saving ? <ActivityIndicator color="white" /> : (
                                <Text style={styles.saveButtonText}>Crear Tarea</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* Modal Ver Entregas */}
            <Modal visible={showSubmissions} animationType="slide" transparent>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Entregas: {selectedTask?.title}</Text>
                            <TouchableOpacity onPress={() => setShowSubmissions(false)}>
                                <X size={24} color="#6B7280" />
                            </TouchableOpacity>
                        </View>

                        {submissions.length === 0 ? (
                            <View style={styles.emptyState}>
                                <Users size={40} color="#D1D5DB" />
                                <Text style={styles.emptyText}>Aún no hay entregas</Text>
                            </View>
                        ) : (
                            <ScrollView>
                                {submissions.map((sub) => (
                                    <View key={sub.id} style={styles.submissionCard}>
                                        <CheckCircle size={20} color="#10B981" />
                                        <View style={{ flex: 1, marginLeft: 12 }}>
                                            <Text style={styles.studentName}>{sub.student_name}</Text>
                                            <Text style={styles.submissionDate}>
                                                {new Date(sub.submitted_at).toLocaleDateString()}
                                            </Text>
                                            {sub.comment && <Text style={styles.comment}>{sub.comment}</Text>}
                                        </View>
                                    </View>
                                ))}
                            </ScrollView>
                        )}
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
    taskCard: { backgroundColor: 'white', borderRadius: 25, padding: 20, flexDirection: 'row', alignItems: 'center', marginBottom: 12, elevation: 2 },
    iconBox: { padding: 12, borderRadius: 15, marginRight: 15 },
    taskTitle: { fontSize: 15, fontWeight: 'bold', color: '#1F2937' },
    taskSubject: { fontSize: 12, color: '#6B7280', marginTop: 2 },
    deadlineRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 6 },
    deadlineText: { fontSize: 11, fontWeight: '700' },
    emptyState: { alignItems: 'center', marginTop: 60 },
    emptyText: { color: '#9CA3AF', fontSize: 14, marginTop: 15 },
    emptySubtext: { color: '#D1D5DB', fontSize: 12, marginTop: 5 },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    modalContent: { backgroundColor: 'white', borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 25, maxHeight: '85%' },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#1F2937', flex: 1 },
    label: { fontSize: 14, fontWeight: '700', color: '#374151', marginBottom: 10 },
    chip: { backgroundColor: '#F3F4F6', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, marginRight: 8 },
    chipText: { fontSize: 12, fontWeight: '700', color: '#4B5563' },
    textInput: { backgroundColor: '#F9FAFB', borderRadius: 15, padding: 15, fontSize: 14, borderWidth: 1, borderColor: '#E5E7EB', marginBottom: 15, textAlignVertical: 'top' },
    saveButton: { padding: 18, borderRadius: 25, alignItems: 'center', elevation: 3, marginTop: 5 },
    saveButtonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
    submissionCard: { backgroundColor: '#F9FAFB', borderRadius: 15, padding: 15, flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
    studentName: { fontSize: 14, fontWeight: 'bold', color: '#1F2937' },
    submissionDate: { fontSize: 11, color: '#6B7280', marginTop: 2 },
    comment: { fontSize: 12, color: '#9CA3AF', marginTop: 4, fontStyle: 'italic' },
});
