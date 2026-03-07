import React, { useState, useEffect } from 'react';
import {
    View, Text, ScrollView, TouchableOpacity, StyleSheet,
    ActivityIndicator, Alert, RefreshControl, Modal, TextInput,
    KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard
} from 'react-native';
import { useAuthStore } from '../../../store/useAuthStore';
import { useTheme } from '../../../hooks/useTheme';
import { Book, Plus, X, User, Trash2, Edit3 } from 'lucide-react-native';
import { getAllSubjects, createSubject, getStaff } from '../../../services/databaseService';
import { supabase } from '../../../services/supabaseClient';

interface Subject {
    id: string;
    school_id: string;
    name: string;
    grade: string;
    section: string;
    teacher_id: string | null;
}

interface Teacher {
    id: string;
    name: string;
}

export default function MateriasScreen() {
    const theme = useTheme();
    const user = useAuthStore((state) => state.user);

    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [teachers, setTeachers] = useState<Teacher[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Modal crear materia
    const [isCreateVisible, setIsCreateVisible] = useState(false);
    const [newSubject, setNewSubject] = useState({ name: '', grade: '1ro', section: 'A', teacher_id: '' });

    // Modal asignar docente
    const [isAssignVisible, setIsAssignVisible] = useState(false);
    const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);

    // Cargar datos
    const loadData = async () => {
        if (!user?.school_id) return;
        try {
            const [subjectsData, staffData] = await Promise.all([
                getAllSubjects(user.school_id),
                getStaff(user.school_id),
            ]);
            setSubjects(subjectsData || []);
            // Filtrar solo docentes
            const docentes = (staffData || []).filter((s: any) => s.role === 'Docente' || s.role_id === 'role-docente');
            setTeachers(docentes.map((d: any) => ({ id: d.id, name: d.name })));
        } catch (e) {
            console.error('Error cargando materias:', e);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => { loadData(); }, [user?.school_id]);

    const onRefresh = () => { setRefreshing(true); loadData(); };

    // Crear materia
    const handleCreate = async () => {
        if (!newSubject.name.trim()) return Alert.alert('Aviso', 'Ingresa el nombre de la materia.');
        setIsSubmitting(true);
        try {
            await createSubject(
                user!.school_id,
                newSubject.name.trim(),
                newSubject.grade,
                newSubject.section,
                newSubject.teacher_id || undefined
            );
            setIsCreateVisible(false);
            setNewSubject({ name: '', grade: '1ro', section: 'A', teacher_id: '' });
            Alert.alert('Listo', 'Materia creada correctamente.');
            loadData();
        } catch (e: any) {
            Alert.alert('Error', e.message || 'No se pudo crear la materia.');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Asignar/cambiar docente
    const handleAssignTeacher = async (teacherId: string) => {
        if (!selectedSubject) return;
        setIsSubmitting(true);
        try {
            const { error } = await supabase
                .from('subjects')
                .update({ teacher_id: teacherId || null })
                .eq('id', selectedSubject.id);
            if (error) throw error;
            setIsAssignVisible(false);
            setSelectedSubject(null);
            loadData();
        } catch (e: any) {
            Alert.alert('Error', e.message || 'No se pudo asignar el docente.');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Eliminar materia
    const handleDelete = (subject: Subject) => {
        Alert.alert(
            'Eliminar materia',
            `¿Eliminar "${subject.name}" (${subject.grade} ${subject.section})?`,
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Eliminar', style: 'destructive',
                    onPress: async () => {
                        try {
                            const { error } = await supabase.from('subjects').delete().eq('id', subject.id);
                            if (error) throw error;
                            loadData();
                        } catch (e: any) {
                            Alert.alert('Error', e.message || 'No se pudo eliminar.');
                        }
                    }
                }
            ]
        );
    };

    // Obtener nombre del docente
    const getTeacherName = (teacherId: string | null) => {
        if (!teacherId) return 'Sin asignar';
        const teacher = teachers.find(t => t.id === teacherId);
        return teacher?.name || 'Docente desconocido';
    };

    // Agrupar materias por grado
    const grouped = subjects.reduce((acc: Record<string, Subject[]>, sub) => {
        const key = `${sub.grade} ${sub.section}`;
        if (!acc[key]) acc[key] = [];
        acc[key].push(sub);
        return acc;
    }, {});

    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F0F2F5' }}>
                <ActivityIndicator size="large" color={theme.primary} />
                <Text style={{ marginTop: 12, color: '#6B7280' }}>Cargando materias...</Text>
            </View>
        );
    }

    return (
        <View style={{ flex: 1, backgroundColor: '#F0F2F5' }}>
            {/* Header */}
            <View style={[styles.header, { backgroundColor: theme.primary }]}>
                <Text style={styles.headerTitle}>Materias</Text>
                <TouchableOpacity style={styles.addBtn} onPress={() => setIsCreateVisible(true)}>
                    <Plus size={22} color="white" />
                </TouchableOpacity>
            </View>

            {/* Lista de materias */}
            <ScrollView
                style={{ flex: 1, paddingHorizontal: 16 }}
                contentContainerStyle={{ paddingTop: 16, paddingBottom: 120 }}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[theme.primary]} />}
            >
                {subjects.length === 0 ? (
                    <View style={styles.emptyBox}>
                        <Book size={48} color="#D1D5DB" />
                        <Text style={styles.emptyTitle}>No hay materias</Text>
                        <Text style={styles.emptyText}>Tocá el + para crear la primera materia</Text>
                    </View>
                ) : (
                    Object.entries(grouped).map(([key, subs]) => (
                        <View key={key} style={{ marginBottom: 20 }}>
                            <Text style={styles.groupTitle}>{key}</Text>
                            {subs.map(sub => (
                                <View key={sub.id} style={styles.subjectCard}>
                                    <View style={[styles.subjectIcon, { backgroundColor: theme.primary + '15' }]}>
                                        <Book size={20} color={theme.primary} />
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.subjectName}>{sub.name}</Text>
                                        <TouchableOpacity onPress={() => { setSelectedSubject(sub); setIsAssignVisible(true); }}>
                                            <Text style={[styles.teacherName, !sub.teacher_id && { color: '#EF4444' }]}>
                                                <User size={12} color={sub.teacher_id ? '#6B7280' : '#EF4444'} /> {getTeacherName(sub.teacher_id)}
                                                {' '}
                                                <Text style={{ color: theme.primary, fontSize: 12 }}>(cambiar)</Text>
                                            </Text>
                                        </TouchableOpacity>
                                    </View>
                                    <TouchableOpacity onPress={() => handleDelete(sub)} style={{ padding: 8 }}>
                                        <Trash2 size={18} color="#EF4444" />
                                    </TouchableOpacity>
                                </View>
                            ))}
                        </View>
                    ))
                )}
            </ScrollView>

            {/* MODAL CREAR MATERIA */}
            <Modal visible={isCreateVisible} transparent animationType="fade">
                <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
                    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                        <View style={styles.overlay}>
                            <View style={styles.modalContent}>
                                <View style={styles.modalHeader}>
                                    <Text style={styles.modalTitle}>Nueva Materia</Text>
                                    <TouchableOpacity onPress={() => setIsCreateVisible(false)}><X size={24} color="#000" /></TouchableOpacity>
                                </View>
                                <ScrollView style={{ padding: 16 }}>
                                    <Text style={styles.label}>Nombre</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Ej: Química, Arte, Música..."
                                        value={newSubject.name}
                                        onChangeText={(t) => setNewSubject(p => ({ ...p, name: t }))}
                                    />

                                    <Text style={styles.label}>Curso</Text>
                                    <View style={styles.chipRow}>
                                        {['1ro', '2do', '3ro', '4to', '5to', '6to'].map(g => (
                                            <TouchableOpacity
                                                key={g}
                                                onPress={() => setNewSubject(p => ({ ...p, grade: g }))}
                                                style={[styles.chip, newSubject.grade === g && { backgroundColor: theme.primary }]}
                                            >
                                                <Text style={[styles.chipText, newSubject.grade === g && { color: '#FFF' }]}>{g}</Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>

                                    <Text style={styles.label}>Sección</Text>
                                    <View style={styles.chipRow}>
                                        {['A', 'B', 'C', 'D'].map(s => (
                                            <TouchableOpacity
                                                key={s}
                                                onPress={() => setNewSubject(p => ({ ...p, section: s }))}
                                                style={[styles.chip, newSubject.section === s && { backgroundColor: theme.primary }]}
                                            >
                                                <Text style={[styles.chipText, newSubject.section === s && { color: '#FFF' }]}>{s}</Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>

                                    <Text style={styles.label}>Docente (opcional)</Text>
                                    <View style={styles.chipRow}>
                                        <TouchableOpacity
                                            onPress={() => setNewSubject(p => ({ ...p, teacher_id: '' }))}
                                            style={[styles.chip, { paddingHorizontal: 14 }, !newSubject.teacher_id && { backgroundColor: theme.primary }]}
                                        >
                                            <Text style={[styles.chipText, !newSubject.teacher_id && { color: '#FFF' }]}>Sin asignar</Text>
                                        </TouchableOpacity>
                                    </View>
                                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 6 }}>
                                        {teachers.map(t => (
                                            <TouchableOpacity
                                                key={t.id}
                                                onPress={() => setNewSubject(p => ({ ...p, teacher_id: t.id }))}
                                                style={[styles.chip, { marginRight: 8 }, newSubject.teacher_id === t.id && { backgroundColor: theme.primary }]}
                                            >
                                                <Text style={[styles.chipText, newSubject.teacher_id === t.id && { color: '#FFF' }]}>{t.name}</Text>
                                            </TouchableOpacity>
                                        ))}
                                    </ScrollView>

                                    <TouchableOpacity
                                        style={[styles.submitBtn, { backgroundColor: theme.primary }, isSubmitting && { opacity: 0.5 }]}
                                        onPress={handleCreate}
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting ? <ActivityIndicator color="white" /> : <Text style={styles.submitText}>Crear Materia</Text>}
                                    </TouchableOpacity>
                                </ScrollView>
                            </View>
                        </View>
                    </TouchableWithoutFeedback>
                </KeyboardAvoidingView>
            </Modal>

            {/* MODAL ASIGNAR DOCENTE */}
            <Modal visible={isAssignVisible} transparent animationType="fade">
                <View style={styles.overlay}>
                    <View style={[styles.modalContent, { maxHeight: 450 }]}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Asignar docente a {selectedSubject?.name}</Text>
                            <TouchableOpacity onPress={() => { setIsAssignVisible(false); setSelectedSubject(null); }}><X size={24} color="#000" /></TouchableOpacity>
                        </View>
                        <ScrollView style={{ padding: 8 }}>
                            {/* Opción sin asignar */}
                            <TouchableOpacity
                                style={[styles.teacherOption, !selectedSubject?.teacher_id && { backgroundColor: '#FEF2F2' }]}
                                onPress={() => handleAssignTeacher('')}
                                disabled={isSubmitting}
                            >
                                <X size={18} color="#EF4444" style={{ marginRight: 10 }} />
                                <Text style={{ color: '#EF4444', fontWeight: '600' }}>Sin asignar</Text>
                            </TouchableOpacity>
                            {teachers.map(t => (
                                <TouchableOpacity
                                    key={t.id}
                                    style={[styles.teacherOption, selectedSubject?.teacher_id === t.id && { backgroundColor: theme.primary + '15', borderColor: theme.primary }]}
                                    onPress={() => handleAssignTeacher(t.id)}
                                    disabled={isSubmitting}
                                >
                                    <User size={18} color={selectedSubject?.teacher_id === t.id ? theme.primary : '#6B7280'} style={{ marginRight: 10 }} />
                                    <Text style={[{ fontWeight: '600', color: '#333' }, selectedSubject?.teacher_id === t.id && { color: theme.primary }]}>
                                        {t.name} {selectedSubject?.teacher_id === t.id ? '(actual)' : ''}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    header: { paddingTop: 60, paddingBottom: 20, paddingHorizontal: 20, borderBottomLeftRadius: 35, borderBottomRightRadius: 35, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    headerTitle: { color: 'white', fontSize: 22, fontWeight: 'bold' },
    addBtn: { backgroundColor: 'rgba(255,255,255,0.2)', padding: 10, borderRadius: 14 },
    emptyBox: { alignItems: 'center', paddingVertical: 60 },
    emptyTitle: { fontSize: 18, fontWeight: 'bold', color: '#9CA3AF', marginTop: 12 },
    emptyText: { color: '#D1D5DB', marginTop: 4 },
    groupTitle: { fontSize: 16, fontWeight: '800', color: '#374151', marginBottom: 10, marginLeft: 4 },
    subjectCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', borderRadius: 16, padding: 14, marginBottom: 10, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 6, elevation: 2 },
    subjectIcon: { width: 42, height: 42, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
    subjectName: { fontSize: 15, fontWeight: '700', color: '#1F2937' },
    teacherName: { fontSize: 13, color: '#6B7280', marginTop: 3 },
    overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', paddingHorizontal: 20 },
    modalContent: { backgroundColor: 'white', borderRadius: 24, maxHeight: 550, overflow: 'hidden' },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
    modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#1F2937', flex: 1 },
    label: { fontWeight: '700', color: '#374151', marginBottom: 8, marginTop: 12 },
    input: { backgroundColor: '#F9FAFB', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12, padding: 14, fontSize: 15 },
    chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    chip: { paddingHorizontal: 14, paddingVertical: 9, borderRadius: 10, backgroundColor: '#F0F0F0' },
    chipText: { fontWeight: '600', fontSize: 13, color: '#333' },
    submitBtn: { padding: 16, borderRadius: 14, alignItems: 'center', marginTop: 20, marginBottom: 20 },
    submitText: { color: 'white', fontWeight: '700', fontSize: 16 },
    teacherOption: { flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 12, marginHorizontal: 8, marginBottom: 6, borderWidth: 1, borderColor: '#E5E7EB' },
});
