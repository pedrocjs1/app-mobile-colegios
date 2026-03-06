import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, Modal, TextInput } from 'react-native';
import { useAuthStore } from '../../../store/useAuthStore';
import { useTheme } from '../../../hooks/useTheme';
import { ShieldAlert, Plus, CheckCircle, AlertTriangle, X, ChevronRight } from 'lucide-react-native';
import * as db from '../../../services/databaseService';

export default function PreceptorSanciones() {
    const theme = useTheme();
    const user = useAuthStore((state) => state.user);

    const [loading, setLoading] = useState(true);
    const [sanctions, setSanctions] = useState<any[]>([]);
    const [students, setStudents] = useState<any[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState<any>(null);
    const [sanctionType, setSanctionType] = useState('Llamado de atención');
    const [description, setDescription] = useState('');
    const [saving, setSaving] = useState(false);

    const sanctionTypes = ['Llamado de atención', 'Apercibimiento', 'Amonestación', 'Suspensión'];

    const loadData = async () => {
        if (!user?.school_id) return;
        try {
            const [sanctionsData, studentsData] = await Promise.all([
                db.getSchoolSanctions(user.school_id),
                db.getStudents(user.school_id)
            ]);
            setSanctions(sanctionsData);
            setStudents(studentsData);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadData(); }, []);

    const handleCreateSanction = async () => {
        if (!selectedStudent || !description.trim() || !user?.id || !user?.school_id) return;
        setSaving(true);
        try {
            await db.createSanction({
                school_id: user.school_id,
                student_id: selectedStudent.id,
                type: sanctionType,
                description: description.trim(),
                issued_by: user.id
            });
            Alert.alert('Registrada', 'La sanción fue registrada correctamente.');
            setShowModal(false);
            setDescription('');
            setSelectedStudent(null);
            loadData();
        } catch (e: any) {
            Alert.alert('Error', e.message || 'No se pudo registrar la sanción.');
        } finally {
            setSaving(false);
        }
    };

    const handleResolve = async (sanctionId: string) => {
        try {
            await db.resolveSanction(sanctionId);
            Alert.alert('Resuelta', 'La sanción fue marcada como resuelta.');
            loadData();
        } catch (e) {
            Alert.alert('Error', 'No se pudo resolver la sanción.');
        }
    };

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'Llamado de atención': return '#F59E0B';
            case 'Apercibimiento': return '#F97316';
            case 'Amonestación': return '#EF4444';
            case 'Suspensión': return '#DC2626';
            default: return '#6B7280';
        }
    };

    return (
        <View style={styles.container}>
            <View style={[styles.header, { backgroundColor: theme.primary }]}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <View>
                        <Text style={styles.headerTitle}>Sanciones</Text>
                        <Text style={styles.headerSub}>Gestión disciplinaria</Text>
                    </View>
                    <TouchableOpacity style={styles.addBtn} onPress={() => setShowModal(true)}>
                        <Plus size={22} color="white" />
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                {loading ? (
                    <ActivityIndicator size="large" color={theme.primary} style={{ marginTop: 40 }} />
                ) : sanctions.length === 0 ? (
                    <View style={styles.emptyState}>
                        <ShieldAlert size={48} color="#D1D5DB" />
                        <Text style={styles.emptyText}>No hay sanciones registradas</Text>
                    </View>
                ) : (
                    sanctions.map((sanction) => (
                        <View key={sanction.id} style={styles.sanctionCard}>
                            <View style={[styles.typeIndicator, { backgroundColor: getTypeColor(sanction.type) }]} />
                            <View style={{ flex: 1 }}>
                                <Text style={styles.studentName}>{sanction.student_name}</Text>
                                <Text style={styles.sanctionType}>{sanction.type}</Text>
                                <Text style={styles.sanctionDesc}>{sanction.description}</Text>
                                <Text style={styles.sanctionDate}>{sanction.date}</Text>
                            </View>
                            {!sanction.resolved ? (
                                <TouchableOpacity
                                    style={styles.resolveBtn}
                                    onPress={() => handleResolve(sanction.id)}
                                >
                                    <CheckCircle size={20} color="#10B981" />
                                </TouchableOpacity>
                            ) : (
                                <View style={[styles.badge, { backgroundColor: '#D1FAE5' }]}>
                                    <Text style={{ color: '#10B981', fontSize: 10, fontWeight: 'bold' }}>RESUELTA</Text>
                                </View>
                            )}
                        </View>
                    ))
                )}
            </ScrollView>

            {/* Modal Nueva Sanción */}
            <Modal visible={showModal} animationType="slide" transparent>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Nueva Sanción</Text>
                            <TouchableOpacity onPress={() => setShowModal(false)}>
                                <X size={24} color="#6B7280" />
                            </TouchableOpacity>
                        </View>

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

                        <Text style={styles.label}>Tipo de Sanción</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 15 }}>
                            {sanctionTypes.map(t => (
                                <TouchableOpacity
                                    key={t}
                                    style={[styles.chip, sanctionType === t && { backgroundColor: getTypeColor(t) }]}
                                    onPress={() => setSanctionType(t)}
                                >
                                    <Text style={[styles.chipText, sanctionType === t && { color: 'white' }]}>{t}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>

                        <Text style={styles.label}>Descripción</Text>
                        <TextInput
                            style={styles.textInput}
                            placeholder="Describa el motivo de la sanción..."
                            multiline
                            numberOfLines={3}
                            value={description}
                            onChangeText={setDescription}
                        />

                        <TouchableOpacity
                            style={[styles.saveButton, { backgroundColor: theme.primary }]}
                            onPress={handleCreateSanction}
                            disabled={saving || !selectedStudent || !description.trim()}
                        >
                            {saving ? <ActivityIndicator color="white" /> : (
                                <Text style={styles.saveButtonText}>Registrar Sanción</Text>
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
    sanctionCard: { backgroundColor: 'white', borderRadius: 20, padding: 18, flexDirection: 'row', alignItems: 'center', marginBottom: 12, elevation: 2 },
    typeIndicator: { width: 4, height: 50, borderRadius: 2, marginRight: 15 },
    studentName: { fontSize: 15, fontWeight: 'bold', color: '#1F2937' },
    sanctionType: { fontSize: 12, fontWeight: '700', color: '#6B7280', marginTop: 2 },
    sanctionDesc: { fontSize: 12, color: '#9CA3AF', marginTop: 4 },
    sanctionDate: { fontSize: 11, color: '#D1D5DB', marginTop: 4 },
    resolveBtn: { padding: 10, backgroundColor: '#F0FDF4', borderRadius: 12 },
    badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
    emptyState: { alignItems: 'center', marginTop: 60 },
    emptyText: { color: '#9CA3AF', fontSize: 14, marginTop: 15 },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    modalContent: { backgroundColor: 'white', borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 25, maxHeight: '80%' },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#1F2937' },
    label: { fontSize: 14, fontWeight: '700', color: '#374151', marginBottom: 10 },
    chip: { backgroundColor: '#F3F4F6', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, marginRight: 8 },
    chipText: { fontSize: 12, fontWeight: '700', color: '#4B5563' },
    textInput: { backgroundColor: '#F9FAFB', borderRadius: 15, padding: 15, fontSize: 14, borderWidth: 1, borderColor: '#E5E7EB', marginBottom: 20, textAlignVertical: 'top', minHeight: 80 },
    saveButton: { padding: 18, borderRadius: 25, alignItems: 'center', elevation: 3 },
    saveButtonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
});
