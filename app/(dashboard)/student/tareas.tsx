import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, Modal, TextInput } from 'react-native';
import { useTheme } from '../../../hooks/useTheme';
import { useAuthStore } from '../../../store/useAuthStore';
import { BookOpen, CheckCircle, Clock, X, Upload, FileText } from 'lucide-react-native';
import * as db from '../../../services/databaseService';

export default function StudentTareas() {
    const theme = useTheme();
    const user = useAuthStore((state) => state.user);

    const [loading, setLoading] = useState(true);
    const [tasks, setTasks] = useState<any[]>([]);
    const [submissions, setSubmissions] = useState<any[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [selectedTask, setSelectedTask] = useState<any>(null);
    const [comment, setComment] = useState('');
    const [saving, setSaving] = useState(false);
    const [studentData, setStudentData] = useState<any>(null);

    const loadData = async () => {
        if (!user?.id || !user?.school_id) return;
        try {
            const student = await db.getStudentByUserId(user.id);
            if (!student) { setLoading(false); return; }
            setStudentData(student);

            const [tasksData, subsData] = await Promise.all([
                db.getTasksForStudent(user.school_id, student.grade, student.section),
                db.getStudentSubmissions(student.id)
            ]);
            setTasks(tasksData);
            setSubmissions(subsData);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadData(); }, []);

    const isSubmitted = (taskId: string) => submissions.some(s => s.task_id === taskId);

    const handleSubmit = async () => {
        if (!selectedTask || !studentData) return;
        setSaving(true);
        try {
            await db.submitTask({
                task_id: selectedTask.id,
                student_id: studentData.id,
                comment: comment.trim() || undefined
            });
            Alert.alert('Entregada', 'Tu tarea fue entregada correctamente.');
            setShowModal(false);
            setComment('');
            setSelectedTask(null);
            loadData();
        } catch (e: any) {
            if (e.message?.includes('duplicate') || e.code === '23505') {
                Alert.alert('Ya entregada', 'Ya entregaste esta tarea anteriormente.');
            } else {
                Alert.alert('Error', e.message || 'No se pudo entregar la tarea.');
            }
        } finally {
            setSaving(false);
        }
    };

    const getDaysLeft = (dateStr: string) => {
        const diff = Math.ceil((new Date(dateStr).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
        if (diff < 0) return { text: 'Vencida', color: '#EF4444' };
        if (diff === 0) return { text: 'Hoy', color: '#F59E0B' };
        if (diff === 1) return { text: 'Mañana', color: '#F59E0B' };
        return { text: `Vence en ${diff} días`, color: '#10B981' };
    };

    const pendingTasks = tasks.filter(t => !isSubmitted(t.id));
    const completedTasks = tasks.filter(t => isSubmitted(t.id));

    return (
        <View style={styles.container}>
            <View style={[styles.header, { backgroundColor: theme.primary }]}>
                <Text style={styles.headerTitle}>Mis Tareas</Text>
                <Text style={styles.headerSub}>Gestioná tus entregas académicas</Text>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                {loading ? (
                    <ActivityIndicator size="large" color={theme.primary} style={{ marginTop: 40 }} />
                ) : (
                    <>
                        <Text style={styles.sectionTitle}>Pendientes de entrega ({pendingTasks.length})</Text>

                        {pendingTasks.length === 0 ? (
                            <View style={styles.emptyCard}>
                                <CheckCircle size={32} color="#10B981" />
                                <Text style={styles.emptyText}>No tenés tareas pendientes</Text>
                            </View>
                        ) : (
                            pendingTasks.map((task) => {
                                const deadline = getDaysLeft(task.due_date);
                                return (
                                    <TouchableOpacity
                                        key={task.id}
                                        style={styles.taskCard}
                                        onPress={() => { setSelectedTask(task); setShowModal(true); }}
                                    >
                                        <View style={[styles.iconBox, { backgroundColor: '#EEF2FF' }]}>
                                            <BookOpen size={22} color="#6366F1" />
                                        </View>
                                        <View style={{ flex: 1 }}>
                                            <Text style={styles.taskTitle}>{task.title}</Text>
                                            <Text style={styles.taskSubject}>{task.grade} {task.section}</Text>
                                            {task.description && (
                                                <Text style={styles.taskDesc} numberOfLines={1}>{task.description}</Text>
                                            )}
                                            <View style={styles.deadlineRow}>
                                                <Clock size={12} color={deadline.color} />
                                                <Text style={[styles.deadlineText, { color: deadline.color }]}>{deadline.text}</Text>
                                            </View>
                                        </View>
                                        <View style={[styles.submitBtn, { backgroundColor: theme.primary }]}>
                                            <Upload size={16} color="white" />
                                        </View>
                                    </TouchableOpacity>
                                );
                            })
                        )}

                        {completedTasks.length > 0 && (
                            <>
                                <Text style={styles.sectionTitle}>Completadas ({completedTasks.length})</Text>
                                {completedTasks.map((task) => (
                                    <View key={task.id} style={[styles.taskCard, { opacity: 0.7 }]}>
                                        <View style={[styles.iconBox, { backgroundColor: '#D1FAE5' }]}>
                                            <CheckCircle size={22} color="#10B981" />
                                        </View>
                                        <View style={{ flex: 1 }}>
                                            <Text style={styles.taskTitle}>{task.title}</Text>
                                            <Text style={styles.taskSubject}>{task.grade} {task.section}</Text>
                                            <Text style={[styles.statusText, { color: '#10B981' }]}>Entregada</Text>
                                        </View>
                                    </View>
                                ))}
                            </>
                        )}
                    </>
                )}
            </ScrollView>

            {/* Modal Entregar Tarea */}
            <Modal visible={showModal} animationType="slide" transparent>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Entregar Tarea</Text>
                            <TouchableOpacity onPress={() => { setShowModal(false); setComment(''); }}>
                                <X size={24} color="#6B7280" />
                            </TouchableOpacity>
                        </View>

                        {selectedTask && (
                            <View style={styles.taskPreview}>
                                <FileText size={24} color={theme.primary} />
                                <View style={{ flex: 1, marginLeft: 12 }}>
                                    <Text style={styles.previewTitle}>{selectedTask.title}</Text>
                                    {selectedTask.description && (
                                        <Text style={styles.previewDesc}>{selectedTask.description}</Text>
                                    )}
                                </View>
                            </View>
                        )}

                        <Text style={styles.label}>Comentario (opcional)</Text>
                        <TextInput
                            style={[styles.textInput, { minHeight: 80 }]}
                            placeholder="Agregá un comentario sobre tu entrega..."
                            multiline
                            value={comment}
                            onChangeText={setComment}
                        />

                        <TouchableOpacity
                            style={[styles.saveButton, { backgroundColor: theme.primary }]}
                            onPress={handleSubmit}
                            disabled={saving}
                        >
                            {saving ? <ActivityIndicator color="white" /> : (
                                <>
                                    <Upload size={18} color="white" />
                                    <Text style={styles.saveButtonText}>Confirmar Entrega</Text>
                                </>
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
    content: { padding: 20, paddingBottom: 100 },
    sectionTitle: { fontSize: 16, fontWeight: '800', color: '#1F2937', marginBottom: 15, marginTop: 10 },
    taskCard: { backgroundColor: 'white', borderRadius: 25, padding: 20, flexDirection: 'row', alignItems: 'center', marginBottom: 12, elevation: 2 },
    iconBox: { padding: 12, borderRadius: 15, marginRight: 15 },
    taskTitle: { fontSize: 15, fontWeight: 'bold', color: '#1F2937' },
    taskSubject: { fontSize: 12, color: '#6B7280', marginTop: 2 },
    taskDesc: { fontSize: 11, color: '#9CA3AF', marginTop: 2 },
    deadlineRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 6 },
    deadlineText: { fontSize: 11, fontWeight: '700' },
    statusText: { fontSize: 11, fontWeight: '700', marginTop: 6 },
    submitBtn: { padding: 10, borderRadius: 12 },
    emptyCard: { backgroundColor: 'white', borderRadius: 20, padding: 30, alignItems: 'center', elevation: 1, gap: 10 },
    emptyText: { color: '#6B7280', fontSize: 14 },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    modalContent: { backgroundColor: 'white', borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 25 },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#1F2937' },
    taskPreview: { backgroundColor: '#F9FAFB', borderRadius: 15, padding: 15, flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
    previewTitle: { fontSize: 15, fontWeight: 'bold', color: '#1F2937' },
    previewDesc: { fontSize: 12, color: '#6B7280', marginTop: 4 },
    label: { fontSize: 14, fontWeight: '700', color: '#374151', marginBottom: 10 },
    textInput: { backgroundColor: '#F9FAFB', borderRadius: 15, padding: 15, fontSize: 14, borderWidth: 1, borderColor: '#E5E7EB', marginBottom: 20, textAlignVertical: 'top' },
    saveButton: { flexDirection: 'row', padding: 18, borderRadius: 25, alignItems: 'center', justifyContent: 'center', elevation: 3, gap: 10 },
    saveButtonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
});
