import React, { useState, useEffect } from 'react';
import {
    View, Text, ScrollView, Image, TouchableOpacity, StyleSheet,
    ActivityIndicator, Alert, RefreshControl, Modal, TextInput,
    KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard
} from 'react-native';
import { useAuthStore } from '../../../store/useAuthStore';
import { useTheme } from '../../../hooks/useTheme';
import { useRouter } from 'expo-router';
import {
    ArrowLeft, UserPlus, Mail, Phone, RefreshCcw, X, User,
    ShieldCheck, Key, Book, ChevronRight, Plus, Trash2
} from 'lucide-react-native';
import {
    getStaff,
    createStaffMember,
    getTeacherSubjects,
    getAllSubjects,
    assignSubjectToTeacher,
    unassignSubjectFromTeacher
} from '../../../services/databaseService';
import { registerStaffAuth } from '../../../services/authService'; // IMPORTANTE
import { StaffMember } from '../../../services/mockDatabase';

export default function PersonalScreen() {
    const theme = useTheme();
    const user = useAuthStore((state) => state.user);
    const router = useRouter();

    // Estados de lista
    const [filter, setFilter] = useState<'all' | 'docente' | 'preceptor'>('all');
    const [staff, setStaff] = useState<StaffMember[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // Estados Modal de Creación
    const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
    const [formData, setFormData] = useState({ name: '', email: '', phone: '', role_id: 'docente' as 'docente' | 'preceptor' });
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Estados Modal de Gestión (Detalle)
    const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
    const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null);
    const [newPassword, setNewPassword] = useState('');
    const [staffSubjects, setStaffSubjects] = useState<any[]>([]);

    // Estados Selector de Materias
    const [isSubjectSelectorVisible, setIsSubjectSelectorVisible] = useState(false);
    const [allAvailableSubjects, setAllAvailableSubjects] = useState<any[]>([]);

    const loadStaff = async () => {
        if (!user?.school_id) return;
        try {
            const data = await getStaff(user.school_id);
            setStaff(data);
        } catch (error) {
            Alert.alert('Error', 'No se pudo conectar con la base de datos.');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => { loadStaff(); }, [user?.school_id]);

    const handleOpenDetail = async (member: StaffMember) => {
        setSelectedStaff(member);
        setIsDetailModalVisible(true);
        refreshStaffSubjects(member.id);
    };

    const refreshStaffSubjects = async (teacherId: string) => {
        try {
            const subjects = await getTeacherSubjects(teacherId);
            setStaffSubjects(subjects);
        } catch (e) {
            setStaffSubjects([]);
        }
    };

    // LÓGICA DE ACTUALIZACIÓN DE CONTRASEÑA (NUEVA)
    const handleUpdatePassword = async () => {
        if (!selectedStaff || !newPassword) {
            Alert.alert("Campos vacíos", "Por favor ingresa una contraseña.");
            return;
        }

        if (newPassword.length < 6) {
            Alert.alert("Contraseña débil", "La contraseña debe tener al menos 6 caracteres.");
            return;
        }

        setIsSubmitting(true);
        try {
            const result = await registerStaffAuth(selectedStaff.email, newPassword, selectedStaff.id);

            if (result.success) {
                Alert.alert("¡Acceso Creado!", `Se han habilitado las credenciales para ${selectedStaff.name}.`);
                setNewPassword('');
                loadStaff(); // Recargamos para actualizar el ID en la lista si fuera necesario
            } else {
                Alert.alert("Error de Registro", result.error || "No se pudo crear el acceso.");
            }
        } catch (error: any) {
            Alert.alert("Error", error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleOpenSubjectSelector = async () => {
        if (!user?.school_id) return;
        try {
            const subjects = await getAllSubjects(user.school_id);
            setAllAvailableSubjects(subjects);
            setIsSubjectSelectorVisible(true);
        } catch (e) {
            Alert.alert("Error", "No se pudieron cargar las materias.");
        }
    };

    const handleAssignSubject = async (subjectId: string) => {
        if (!selectedStaff) return;
        try {
            await assignSubjectToTeacher(user!.school_id, selectedStaff.id, subjectId);
            setIsSubjectSelectorVisible(false);
            refreshStaffSubjects(selectedStaff.id);
        } catch (e: any) {
            Alert.alert("Aviso", e.message || "La materia ya está asignada.");
        }
    };

    const handleRemoveSubject = async (subjectId: string) => {
        if (!selectedStaff) return;
        Alert.alert("Quitar materia", "¿Estás seguro de desvincular esta materia del docente?", [
            { text: "Cancelar", style: "cancel" },
            {
                text: "Quitar",
                style: "destructive",
                onPress: async () => {
                    try {
                        await unassignSubjectFromTeacher(selectedStaff.id, subjectId);
                        refreshStaffSubjects(selectedStaff.id);
                    } catch (e) {
                        Alert.alert("Error", "No se pudo quitar la materia.");
                    }
                }
            }
        ]);
    };

    const handleCreateStaff = async () => {
        if (!formData.name || !formData.email) {
            Alert.alert('Campos incompletos', 'Por favor ingresa nombre y email.');
            return;
        }
        setIsSubmitting(true);
        try {
            await createStaffMember({ school_id: user!.school_id, ...formData });
            Alert.alert('¡Éxito!', 'Personal registrado correctamente.');
            setIsCreateModalVisible(false);
            setFormData({ name: '', email: '', phone: '', role_id: 'docente' });
            loadStaff();
        } catch (error: any) {
            Alert.alert('Error', error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const filteredStaff = filter === 'all' ? staff : staff.filter(s => (s as any).role === filter);

    return (
        <View style={{ flex: 1, backgroundColor: '#F0F2F5' }}>
            {/* Header */}
            <View style={[styles.header, { backgroundColor: theme.primary }]}>
                <View style={styles.headerTop}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                        <ArrowLeft size={24} color="white" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Gestión de Personal</Text>
                    <TouchableOpacity onPress={loadStaff} style={styles.backBtn}>
                        <RefreshCcw size={20} color="white" />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Filtros */}
            <View style={styles.filterContainer}>
                {['all', 'docente', 'preceptor'].map((f) => (
                    <TouchableOpacity key={f} style={[styles.filterBtn, filter === f && { backgroundColor: theme.primary, borderColor: theme.primary }]} onPress={() => setFilter(f as any)}>
                        <Text style={[styles.filterText, filter === f && { color: 'white' }]}>
                            {f === 'all' ? `Todos (${staff.length})` : f.charAt(0).toUpperCase() + f.slice(1) + 's'}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            <ScrollView style={{ flex: 1 }} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={loadStaff} colors={[theme.primary]} />}>
                <View style={{ paddingHorizontal: 20, marginBottom: 20 }}>
                    <TouchableOpacity style={[styles.addButton, { backgroundColor: theme.primary }]} onPress={() => setIsCreateModalVisible(true)}>
                        <UserPlus size={20} color="white" /><Text style={styles.addButtonText}>Agregar Personal</Text>
                    </TouchableOpacity>
                </View>

                <View style={{ paddingHorizontal: 20, marginBottom: 30 }}>
                    {loading ? (
                        <ActivityIndicator size="large" color={theme.primary} style={{ marginTop: 50 }} />
                    ) : filteredStaff.map((item) => (
                        <TouchableOpacity key={item.id} style={styles.staffCard} onPress={() => handleOpenDetail(item)}>
                            <Image source={{ uri: `https://ui-avatars.com/api/?name=${item.name}&background=6366f1&color=fff` }} style={styles.staffAvatar} />
                            <View style={{ flex: 1 }}>
                                <Text style={styles.staffName}>{item.name}</Text>
                                <Text style={[styles.staffRole, { color: theme.primary }]}>{(item as any).role.toUpperCase()}</Text>
                                <Text style={styles.contactText}>{item.email}</Text>
                            </View>
                            <ChevronRight size={20} color="#9CA3AF" />
                        </TouchableOpacity>
                    ))}
                </View>
            </ScrollView>

            {/* MODAL 1: REGISTRO INICIAL (CON SOLUCIÓN DE TECLADO) */}
            <Modal visible={isCreateModalVisible} animationType="slide" transparent={true}>
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={styles.modalOverlay}
                >
                    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                        <View style={styles.modalContent}>
                            <View style={styles.modalHeader}>
                                <Text style={styles.modalTitle}>Nuevo Personal</Text>
                                <TouchableOpacity onPress={() => setIsCreateModalVisible(false)}><X size={24} color="#1F2937" /></TouchableOpacity>
                            </View>
                            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
                                <View style={styles.form}>
                                    <View style={styles.inputWrapper}><User size={18} color="#9CA3AF" style={styles.inputIcon} /><TextInput style={styles.input} placeholder="Nombre completo" onChangeText={(v) => setFormData({ ...formData, name: v })} /></View>
                                    <View style={styles.inputWrapper}><Mail size={18} color="#9CA3AF" style={styles.inputIcon} /><TextInput style={styles.input} placeholder="Email" keyboardType="email-address" autoCapitalize="none" onChangeText={(v) => setFormData({ ...formData, email: v })} /></View>
                                    <Text style={styles.sectionLabel}>Rol del personal</Text>
                                    <View style={styles.roleSelector}>
                                        <TouchableOpacity style={[styles.roleOption, formData.role_id === 'docente' && { backgroundColor: theme.primary }]} onPress={() => setFormData({ ...formData, role_id: 'docente' })}>
                                            <Text style={[styles.roleOptionText, formData.role_id === 'docente' && { color: 'white' }]}>Docente</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity style={[styles.roleOption, formData.role_id === 'preceptor' && { backgroundColor: theme.primary }]} onPress={() => setFormData({ ...formData, role_id: 'preceptor' })}>
                                            <Text style={[styles.roleOptionText, formData.role_id === 'preceptor' && { color: 'white' }]}>Preceptor</Text>
                                        </TouchableOpacity>
                                    </View>
                                    <TouchableOpacity style={[styles.saveButton, { backgroundColor: theme.primary }]} onPress={handleCreateStaff} disabled={isSubmitting}>
                                        {isSubmitting ? <ActivityIndicator color="white" /> : <Text style={styles.saveButtonText}>Guardar Personal</Text>}
                                    </TouchableOpacity>
                                </View>
                            </ScrollView>
                        </View>
                    </TouchableWithoutFeedback>
                </KeyboardAvoidingView>
            </Modal>

            {/* MODAL 2: GESTIÓN DE PERFIL (CON SOLUCIÓN DE TECLADO Y LÓGICA DE CLAVE) */}
            <Modal visible={isDetailModalVisible} animationType="fade" transparent={true}>
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={styles.modalOverlay}
                >
                    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                        <View style={[styles.modalContent, { minHeight: 600 }]}>
                            <View style={styles.modalHeader}>
                                <View>
                                    <Text style={styles.modalTitle}>{selectedStaff?.name}</Text>
                                    <Text style={{ color: theme.primary, fontWeight: '700' }}>{(selectedStaff as any)?.role.toUpperCase()}</Text>
                                </View>
                                <TouchableOpacity onPress={() => setIsDetailModalVisible(false)}><X size={24} color="#1F2937" /></TouchableOpacity>
                            </View>

                            <ScrollView showsVerticalScrollIndicator={false}>
                                <Text style={styles.sectionLabel}>Acceso al sistema</Text>
                                <View style={styles.inputWrapper}>
                                    <Key size={18} color="#9CA3AF" style={styles.inputIcon} />
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Definir contraseña inicial"
                                        secureTextEntry
                                        value={newPassword}
                                        onChangeText={setNewPassword}
                                    />
                                    <TouchableOpacity
                                        onPress={handleUpdatePassword}
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting ? (
                                            <ActivityIndicator size="small" color={theme.primary} />
                                        ) : (
                                            <Text style={{ color: theme.primary, fontWeight: 'bold' }}>Guardar</Text>
                                        )}
                                    </TouchableOpacity>
                                </View>

                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 25 }}>
                                    <Text style={styles.sectionLabel}>Materias Asignadas</Text>
                                    <TouchableOpacity style={styles.addSubjectIcon} onPress={handleOpenSubjectSelector}>
                                        <Plus size={18} color="white" />
                                    </TouchableOpacity>
                                </View>

                                <View style={styles.subjectsList}>
                                    {staffSubjects.length > 0 ? staffSubjects.map((sub, idx) => (
                                        <View key={idx} style={styles.subjectItem}>
                                            <View style={{ flex: 1 }}>
                                                <Text style={styles.subjectText}>{sub.name}</Text>
                                                <Text style={{ fontSize: 11, color: '#6366F1' }}>{sub.grade} - {sub.section}</Text>
                                            </View>
                                            <TouchableOpacity onPress={() => handleRemoveSubject(sub.id)}>
                                                <Trash2 size={18} color="#EF4444" />
                                            </TouchableOpacity>
                                        </View>
                                    )) : (
                                        <View style={styles.emptySubjects}><Text style={{ color: '#9CA3AF', fontStyle: 'italic' }}>Sin materias asignadas.</Text></View>
                                    )}
                                </View>

                                <TouchableOpacity style={[styles.saveButton, { backgroundColor: '#F3F4F6', marginTop: 40 }]} onPress={() => setIsDetailModalVisible(false)}>
                                    <Text style={{ color: '#4B5563', fontWeight: 'bold' }}>Cerrar Gestión</Text>
                                </TouchableOpacity>
                            </ScrollView>
                        </View>
                    </TouchableWithoutFeedback>
                </KeyboardAvoidingView>

                {/* SUB-MODAL: SELECTOR DE MATERIAS */}
                <Modal visible={isSubjectSelectorVisible} transparent animationType="fade">
                    <View style={styles.selectorOverlay}>
                        <View style={styles.selectorContent}>
                            <View style={styles.modalHeader}>
                                <Text style={styles.modalTitle}>Asignar Materia</Text>
                                <TouchableOpacity onPress={() => setIsSubjectSelectorVisible(false)}><X size={24} color="#000" /></TouchableOpacity>
                            </View>
                            <ScrollView>
                                {allAvailableSubjects.map((sub) => (
                                    <TouchableOpacity
                                        key={sub.id}
                                        style={styles.selectorItem}
                                        onPress={() => handleAssignSubject(sub.id)}
                                    >
                                        <Book size={18} color={theme.primary} style={{ marginRight: 10 }} />
                                        <Text style={styles.selectorText}>{sub.name} ({sub.grade})</Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>
                    </View>
                </Modal>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    header: { paddingTop: 60, paddingBottom: 20, paddingHorizontal: 20, borderBottomLeftRadius: 35, borderBottomRightRadius: 35 },
    headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    backBtn: { backgroundColor: 'rgba(255,255,255,0.2)', padding: 8, borderRadius: 12 },
    headerTitle: { color: 'white', fontSize: 20, fontWeight: 'bold' },
    filterContainer: { flexDirection: 'row', paddingHorizontal: 20, paddingVertical: 20, gap: 10 },
    filterBtn: { flex: 1, backgroundColor: 'white', paddingVertical: 12, borderRadius: 15, alignItems: 'center', borderWidth: 2, borderColor: 'transparent', elevation: 1 },
    filterText: { fontSize: 11, fontWeight: '700', color: '#6B7280' },
    addButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 15, borderRadius: 20, gap: 8, elevation: 4 },
    addButtonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
    staffCard: { backgroundColor: 'white', borderRadius: 25, padding: 20, marginBottom: 12, flexDirection: 'row', alignItems: 'center', elevation: 2 },
    staffAvatar: { width: 50, height: 50, borderRadius: 15, marginRight: 15 },
    staffName: { fontSize: 15, fontWeight: 'bold', color: '#1F2937' },
    staffRole: { fontSize: 11, fontWeight: '800', marginBottom: 2 },
    contactText: { fontSize: 12, color: '#6B7280' },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    modalContent: { backgroundColor: 'white', borderTopLeftRadius: 35, borderTopRightRadius: 35, padding: 30, maxHeight: '85%' },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 25 },
    modalTitle: { fontSize: 20, fontWeight: '900', color: '#1F2937' },
    form: { gap: 15 },
    inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F3F4F6', borderRadius: 15, paddingHorizontal: 15, marginBottom: 10 },
    inputIcon: { marginRight: 10 },
    input: { flex: 1, paddingVertical: 14, fontSize: 15, color: '#1F2937' },
    sectionLabel: { fontSize: 13, fontWeight: '800', color: '#4B5563', marginBottom: 10, textTransform: 'uppercase' },
    roleSelector: { flexDirection: 'row', gap: 10 },
    roleOption: { flex: 1, paddingVertical: 12, borderRadius: 12, alignItems: 'center', borderWidth: 2, borderColor: '#E5E7EB' },
    roleOptionText: { fontWeight: '700', color: '#6B7280' },
    saveButton: { paddingVertical: 16, borderRadius: 18, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 10 },
    saveButtonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
    subjectsList: { marginTop: 10, gap: 8 },
    subjectItem: { backgroundColor: '#EEF2FF', padding: 15, borderRadius: 15, borderLeftWidth: 5, borderLeftColor: '#6366F1', flexDirection: 'row', alignItems: 'center' },
    subjectText: { color: '#4338CA', fontWeight: '800', fontSize: 14 },
    addSubjectIcon: { backgroundColor: '#6366F1', padding: 8, borderRadius: 10 },
    selectorOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', padding: 20 },
    selectorContent: { backgroundColor: 'white', borderRadius: 25, padding: 25, maxHeight: '70%' },
    selectorItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
    selectorText: { fontSize: 15, fontWeight: '600', color: '#1F2937' },
    emptySubjects: { padding: 20, alignItems: 'center', backgroundColor: '#F9FAFB', borderRadius: 15, borderStyle: 'dashed', borderWidth: 1, borderColor: '#D1D5DB' }
});