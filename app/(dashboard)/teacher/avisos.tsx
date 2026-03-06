import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, Modal, TextInput } from 'react-native';
import { useAuthStore } from '../../../store/useAuthStore';
import { useTheme } from '../../../hooks/useTheme';
import { MessageSquare, Send, Plus, X, User, AlertTriangle, BookOpen, Heart, CheckCircle } from 'lucide-react-native';
import * as db from '../../../services/databaseService';

export default function TeacherAvisos() {
    const theme = useTheme();
    const user = useAuthStore((state) => state.user);

    const [loading, setLoading] = useState(true);
    const [calls, setCalls] = useState<any[]>([]);
    const [subjects, setSubjects] = useState<any[]>([]);
    const [students, setStudents] = useState<any[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [saving, setSaving] = useState(false);

    // Form
    const [selectedSubject, setSelectedSubject] = useState<any>(null);
    const [selectedStudent, setSelectedStudent] = useState<any>(null);
    const [reason, setReason] = useState('');
    const [callType, setCallType] = useState<string>('general');
    const [scheduledDate, setScheduledDate] = useState('');

    const callTypes = [
        { id: 'general', label: 'General', icon: <MessageSquare size={16} color="#6366F1" />, color: '#6366F1' },
        { id: 'academic', label: 'Académico', icon: <BookOpen size={16} color="#3B82F6" />, color: '#3B82F6' },
        { id: 'behavior', label: 'Conducta', icon: <AlertTriangle size={16} color="#F59E0B" />, color: '#F59E0B' },
        { id: 'health', label: 'Salud', icon: <Heart size={16} color="#EF4444" />, color: '#EF4444' },
    ];

    const loadData = async () => {
        if (!user?.id) return;
        try {
            const [callsData, subjectsData] = await Promise.all([
                db.getAttentionCallsByTeacher(user.id),
                db.getTeacherSubjects(user.id)
            ]);
            setCalls(callsData);
            setSubjects(subjectsData);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadData(); }, []);

    const loadStudentsForSubject = async (subject: any) => {
        setSelectedSubject(subject);
        if (!user?.school_id) return;
        try {
            const data = await db.getStudentsByClass(user.school_id, subject.grade, subject.section);
            setStudents(data);
        } catch (e) {
            console.error(e);
        }
    };

    const handleCreate = async () => {
        if (!selectedStudent || !reason.trim() || !user?.id || !user?.school_id) return;
        setSaving(true);
        try {
            // Buscar tutor del alumno
            const tutors = await db.getStudentTutors(selectedStudent.id);
            if (!tutors || tutors.length === 0) {
                Alert.alert('Error', 'No se encontró un tutor vinculado a este alumno.');
                setSaving(false);
                return;
            }

            await db.createAttentionCall({
                school_id: user.school_id,
                teacher_id: user.id,
                student_id: selectedStudent.id,
                tutor_id: tutors[0].id,
                reason: reason.trim(),
                type: callType,
                scheduled_date: scheduledDate || undefined
            });

            Alert.alert('Enviado', 'El aviso fue enviado al tutor correctamente.');
            setShowModal(false);
            resetForm();
            loadData();
        } catch (e: any) {
            Alert.alert('Error', e.message || 'No se pudo enviar el aviso.');
        } finally {
            setSaving(false);
        }
    };

    const resetForm = () => {
        setSelectedSubject(null);
        setSelectedStudent(null);
        setReason('');
        setCallType('general');
        setScheduledDate('');
        setStudents([]);
    };

    const getTypeConfig = (type: string) => {
        return callTypes.find(t => t.id === type) || callTypes[0];
    };

    const getStatusConfig = (status: string) => {
        switch (status) {
            case 'pending': return { label: 'Pendiente', color: '#F59E0B', bg: '#FEF3C7' };
            case 'acknowledged': return { label: 'Visto', color: '#3B82F6', bg: '#DBEAFE' };
            case 'resolved': return { label: 'Resuelto', color: '#10B981', bg: '#D1FAE5' };
            default: return { label: 'Pendiente', color: '#F59E0B', bg: '#FEF3C7' };
        }
    };

    return (
        <View style={styles.container}>
            <View style={[styles.header, { backgroundColor: theme.primary }]}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <View>
                        <Text style={styles.headerTitle}>Avisos al Tutor</Text>
                        <Text style={styles.headerSub}>Llamados de atención y citaciones</Text>
                    </View>
                    <TouchableOpacity style={styles.addBtn} onPress={() => setShowModal(true)}>
                        <Plus size={22} color="white" />
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                {loading ? (
                    <ActivityIndicator size="large" color={theme.primary} style={{ marginTop: 40 }} />
                ) : calls.length === 0 ? (
                    <View style={styles.emptyState}>
                        <MessageSquare size={48} color="#D1D5DB" />
                        <Text style={styles.emptyText}>No hay avisos enviados</Text>
                        <Text style={styles.emptySubtext}>Tocá + para enviar un aviso al tutor</Text>
                    </View>
                ) : (
                    calls.map((call) => {
                        const typeConfig = getTypeConfig(call.type);
                        const statusConfig = getStatusConfig(call.status);
                        return (
                            <View key={call.id} style={styles.callCard}>
                                <View style={[styles.typeIndicator, { backgroundColor: typeConfig.color }]} />
                                <View style={{ flex: 1 }}>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                        <Text style={styles.callType}>{typeConfig.label}</Text>
                                        <View style={[styles.statusBadge, { backgroundColor: statusConfig.bg }]}>
                                            <Text style={{ color: statusConfig.color, fontSize: 9, fontWeight: 'bold' }}>
                                                {statusConfig.label}
                                            </Text>
                                        </View>
                                    </View>
                                    <Text style={styles.callReason}>{call.reason}</Text>
                                    {call.scheduled_date && (
                                        <Text style={styles.callDate}>Citado: {call.scheduled_date}</Text>
                                    )}
                                </View>
                            </View>
                        );
                    })
                )}
            </ScrollView>

            {/* Modal Nuevo Aviso */}
            <Modal visible={showModal} animationType="slide" transparent>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Nuevo Aviso</Text>
                            <TouchableOpacity onPress={() => { setShowModal(false); resetForm(); }}>
                                <X size={24} color="#6B7280" />
                            </TouchableOpacity>
                        </View>

                        <Text style={styles.label}>Tipo de aviso</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 15 }}>
                            {callTypes.map(t => (
                                <TouchableOpacity
                                    key={t.id}
                                    style={[styles.chip, callType === t.id && { backgroundColor: t.color }]}
                                    onPress={() => setCallType(t.id)}
                                >
                                    <Text style={[styles.chipText, callType === t.id && { color: 'white' }]}>{t.label}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>

                        <Text style={styles.label}>Seleccionar materia</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 15 }}>
                            {subjects.map((s: any) => (
                                <TouchableOpacity
                                    key={s.id}
                                    style={[styles.chip, selectedSubject?.id === s.id && { backgroundColor: theme.primary }]}
                                    onPress={() => loadStudentsForSubject(s)}
                                >
                                    <Text style={[styles.chipText, selectedSubject?.id === s.id && { color: 'white' }]}>
                                        {s.name} ({s.grade} {s.section})
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>

                        {students.length > 0 && (
                            <>
                                <Text style={styles.label}>Alumno</Text>
                                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 15 }}>
                                    {students.map(s => (
                                        <TouchableOpacity
                                            key={s.id}
                                            style={[styles.chip, selectedStudent?.id === s.id && { backgroundColor: theme.primary }]}
                                            onPress={() => setSelectedStudent(s)}
                                        >
                                            <Text style={[styles.chipText, selectedStudent?.id === s.id && { color: 'white' }]}>
                                                {s.first_name} {s.last_name}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </ScrollView>
                            </>
                        )}

                        <Text style={styles.label}>Motivo</Text>
                        <TextInput
                            style={[styles.textInput, { minHeight: 80 }]}
                            placeholder="Describa el motivo del aviso..."
                            multiline
                            value={reason}
                            onChangeText={setReason}
                        />

                        <Text style={styles.label}>Fecha de citación (opcional, YYYY-MM-DD)</Text>
                        <TextInput
                            style={styles.textInput}
                            placeholder="2025-03-20"
                            value={scheduledDate}
                            onChangeText={setScheduledDate}
                        />

                        <TouchableOpacity
                            style={[styles.saveButton, { backgroundColor: theme.primary }]}
                            onPress={handleCreate}
                            disabled={saving || !selectedStudent || !reason.trim()}
                        >
                            {saving ? <ActivityIndicator color="white" /> : (
                                <>
                                    <Send size={18} color="white" />
                                    <Text style={styles.saveButtonText}>Enviar Aviso</Text>
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
    addBtn: { backgroundColor: 'rgba(255,255,255,0.2)', padding: 12, borderRadius: 15 },
    content: { padding: 20, paddingBottom: 120 },
    callCard: { backgroundColor: 'white', borderRadius: 20, padding: 18, flexDirection: 'row', alignItems: 'center', marginBottom: 12, elevation: 2 },
    typeIndicator: { width: 4, height: 45, borderRadius: 2, marginRight: 15 },
    callType: { fontSize: 14, fontWeight: 'bold', color: '#1F2937' },
    callReason: { fontSize: 13, color: '#6B7280', marginTop: 4 },
    callDate: { fontSize: 11, color: '#9CA3AF', marginTop: 4 },
    statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
    emptyState: { alignItems: 'center', marginTop: 60 },
    emptyText: { color: '#9CA3AF', fontSize: 14, marginTop: 15 },
    emptySubtext: { color: '#D1D5DB', fontSize: 12, marginTop: 5 },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    modalContent: { backgroundColor: 'white', borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 25, maxHeight: '90%' },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#1F2937' },
    label: { fontSize: 14, fontWeight: '700', color: '#374151', marginBottom: 10 },
    chip: { backgroundColor: '#F3F4F6', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, marginRight: 8 },
    chipText: { fontSize: 12, fontWeight: '700', color: '#4B5563' },
    textInput: { backgroundColor: '#F9FAFB', borderRadius: 15, padding: 15, fontSize: 14, borderWidth: 1, borderColor: '#E5E7EB', marginBottom: 15, textAlignVertical: 'top' },
    saveButton: { flexDirection: 'row', padding: 18, borderRadius: 25, alignItems: 'center', justifyContent: 'center', elevation: 3, marginTop: 5, gap: 10 },
    saveButtonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
});
