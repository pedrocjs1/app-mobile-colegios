import React, { useState, useEffect } from 'react';
import {
    View, Text, ScrollView, TouchableOpacity, StyleSheet,
    ActivityIndicator, RefreshControl, Modal, TextInput, Alert,
    KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard
} from 'react-native';
import { useAuthStore } from '../../../store/useAuthStore';
import { useTheme } from '../../../hooks/useTheme';
import { useRouter } from 'expo-router';
import {
    ArrowLeft, UserPlus, Users, Mail, RefreshCcw, X,
    Key, Plus, Trash2, User, ChevronRight, GraduationCap,
    BookOpen, Layers
} from 'lucide-react-native';
import {
    getFamilies,
    createFamilyMember,
    unlinkStudentFromFamily,
    createAndLinkStudent
} from '../../../services/databaseService';
import { registerStaffAuth } from '../../../services/authService';
import { Family } from '../../../services/mockDatabase';

// Definición de grados para el selector
const GRADOS_PRIMARIA = ['1°', '2°', '3°', '4°', '5°', '6°'];

export default function FamiliasScreen() {
    const theme = useTheme();
    const user = useAuthStore((state) => state.user);
    const router = useRouter();

    const [families, setFamilies] = useState<Family[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
    const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
    const [isNewStudentModalVisible, setIsNewStudentModalVisible] = useState(false);

    const [tutorForm, setTutorForm] = useState({ name: '', email: '' });
    const [studentForm, setStudentForm] = useState({
        first_name: '',
        last_name: '',
        grade: '',
        section: '',
        email: '',
        password: ''
    });
    const [selectedFamily, setSelectedFamily] = useState<Family | null>(null);
    const [newPassword, setNewPassword] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const loadFamilies = async () => {
        if (!user?.school_id) return;
        try {
            const data = await getFamilies(user.school_id);
            setFamilies(data);
        } catch (error) {
            console.error("Error cargando familias:", error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => { loadFamilies(); }, [user?.school_id]);

    const handleCreateTutor = async () => {
        if (!tutorForm.name || !tutorForm.email) return Alert.alert("Error", "Completa los datos.");
        setIsSubmitting(true);
        try {
            await createFamilyMember({ school_id: user!.school_id, ...tutorForm });
            setIsCreateModalVisible(false);
            setTutorForm({ name: '', email: '' });
            await loadFamilies();
            Alert.alert("¡Éxito!", "Familia creada correctamente.");
        } catch (e: any) {
            Alert.alert("Error", "No se pudo crear la familia.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCreateStudent = async () => {
        if (!selectedFamily?.tutor_id) return Alert.alert("Error", "Familia no identificada.");
        if (!studentForm.first_name || !studentForm.grade || !studentForm.email || !studentForm.password) {
            return Alert.alert("Error", "Completa todos los campos (Nombre, Grado, Email y Contraseña).");
        }

        setIsSubmitting(true);
        try {
            const dataToSend = {
                school_id: user!.school_id,
                tutor_id: selectedFamily.tutor_id,
                ...studentForm
            };

            await createAndLinkStudent(dataToSend);

            setIsNewStudentModalVisible(false);
            setStudentForm({ first_name: '', last_name: '', grade: '', section: '', email: '', password: '' });

            await loadFamilies();
            Alert.alert("¡Hijo Registrado!", "El alumno ha sido creado y vinculado.");
        } catch (e: any) {
            console.error("❌ Error en handleCreateStudent:", e);
            Alert.alert("Error al registrar", e.message || "Error desconocido");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleUpdatePassword = async () => {
        if (!selectedFamily || !newPassword) return Alert.alert("Aviso", "Ingresa una contraseña.");
        if (newPassword.length < 6) return Alert.alert("Aviso", "Mínimo 6 caracteres.");

        setIsSubmitting(true);
        try {
            const result = await registerStaffAuth(selectedFamily.tutor_email, newPassword, selectedFamily.tutor_id);
            if (result.success) {
                Alert.alert("Éxito", "Acceso configurado para el tutor.");
                setNewPassword('');
                loadFamilies();
            } else {
                Alert.alert("Error de Registro", result.error || "No se pudo crear el acceso.");
            }
        } catch (error: any) {
            Alert.alert("Error", error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleUnlink = async (studentId: string) => {
        Alert.alert("Quitar Vínculo", "¿Desvincular alumno?", [
            { text: "No" },
            {
                text: "Sí", style: "destructive", onPress: async () => {
                    await unlinkStudentFromFamily(selectedFamily!.tutor_id, studentId);
                    setIsDetailModalVisible(false);
                    loadFamilies();
                }
            }
        ]);
    };

    return (
        <View style={{ flex: 1, backgroundColor: '#F0F2F5' }}>
            <View style={[styles.header, { backgroundColor: theme.primary }]}>
                <View style={styles.headerTop}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}><ArrowLeft size={24} color="white" /></TouchableOpacity>
                    <Text style={styles.headerTitle}>Gestión de Familias</Text>
                    <TouchableOpacity onPress={loadFamilies} style={styles.backBtn}><RefreshCcw size={20} color="white" /></TouchableOpacity>
                </View>
            </View>

            <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={loadFamilies} />}>
                <View style={{ padding: 20 }}>
                    <TouchableOpacity style={styles.addButton} onPress={() => setIsCreateModalVisible(true)}>
                        <UserPlus size={20} color="white" /><Text style={styles.addButtonText}>Nueva Familia</Text>
                    </TouchableOpacity>

                    <View style={styles.statsContainer}>
                        <View style={[styles.statCard, { backgroundColor: '#6366F1' }]}><Users size={24} color="white" /><Text style={styles.statNumber}>{families.length}</Text><Text style={styles.statLabel}>Familias</Text></View>
                        <View style={[styles.statCard, { backgroundColor: '#EC4899' }]}><GraduationCap size={24} color="white" /><Text style={styles.statNumber}>{families.reduce((acc, f) => acc + (f.students?.length || 0), 0)}</Text><Text style={styles.statLabel}>Alumnos</Text></View>
                    </View>

                    <Text style={styles.sectionTitle}>Lista de Familias</Text>
                    {loading ? <ActivityIndicator size="large" color={theme.primary} /> : families.map((f) => (
                        <TouchableOpacity key={f.id} style={styles.familyCard} onPress={() => { setSelectedFamily(f); setIsDetailModalVisible(true); }}>
                            <View style={styles.tutorSection}>
                                <View style={styles.tutorIcon}><Users size={20} color="#6366F1" /></View>
                                <View style={{ flex: 1 }}><Text style={styles.tutorName}>{f.tutor_name}</Text><Text style={styles.emailText}>{f.tutor_email}</Text></View>
                                <ChevronRight size={20} color="#9CA3AF" />
                            </View>
                            <View style={styles.divider} />
                            <Text style={styles.studentsCountText}>{f.students?.length || 0} HIJOS VINCULADOS</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </ScrollView>

            {/* MODAL 1: REGISTRAR TUTOR */}
            <Modal visible={isCreateModalVisible} animationType="slide" transparent>
                <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.modalOverlay}>
                    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                        <View style={styles.modalContent}>
                            <View style={styles.modalHeader}><Text style={styles.modalTitle}>Nueva Familia</Text><TouchableOpacity onPress={() => setIsCreateModalVisible(false)}><X size={24} color="#000" /></TouchableOpacity></View>
                            <View style={styles.form}>
                                <View style={styles.inputWrapper}>
                                    <User size={18} color="#9CA3AF" style={{ marginRight: 10 }} />
                                    <TextInput style={styles.input} placeholder="Nombre Responsable" placeholderTextColor="#9CA3AF" onChangeText={(v) => setTutorForm({ ...tutorForm, name: v })} />
                                </View>
                                <View style={styles.inputWrapper}>
                                    <Mail size={18} color="#9CA3AF" style={{ marginRight: 10 }} />
                                    <TextInput style={styles.input} placeholder="Email de contacto" placeholderTextColor="#9CA3AF" autoCapitalize="none" keyboardType="email-address" onChangeText={(v) => setTutorForm({ ...tutorForm, email: v })} />
                                </View>
                                <TouchableOpacity style={[styles.saveButton, { backgroundColor: theme.primary }]} onPress={handleCreateTutor} disabled={isSubmitting}>
                                    {isSubmitting ? <ActivityIndicator color="white" /> : <Text style={styles.saveButtonText}>Guardar Familia</Text>}
                                </TouchableOpacity>
                            </View>
                        </View>
                    </TouchableWithoutFeedback>
                </KeyboardAvoidingView>
            </Modal>

            {/* MODAL 2: DETALLES DE FAMILIA */}
            <Modal visible={isDetailModalVisible} animationType="fade" transparent>
                <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { maxHeight: '90%' }]}>
                        <View style={styles.modalHeader}>
                            <View><Text style={styles.modalTitle}>{selectedFamily?.tutor_name}</Text></View>
                            <TouchableOpacity onPress={() => setIsDetailModalVisible(false)}><X size={24} color="#000" /></TouchableOpacity>
                        </View>
                        <ScrollView showsVerticalScrollIndicator={false}>
                            <Text style={styles.sectionLabel}>Credenciales Tutor</Text>
                            <View style={styles.inputWrapper}>
                                <Key size={18} color="#9CA3AF" style={{ marginRight: 10 }} />
                                <TextInput style={styles.input} placeholder="Nueva contraseña" placeholderTextColor="#9CA3AF" secureTextEntry value={newPassword} onChangeText={setNewPassword} />
                                <TouchableOpacity onPress={handleUpdatePassword} disabled={isSubmitting}>
                                    {isSubmitting ? <ActivityIndicator size="small" color={theme.primary} /> : <Text style={{ color: theme.primary, fontWeight: 'bold' }}>Guardar</Text>}
                                </TouchableOpacity>
                            </View>

                            <View style={styles.studentListHeader}>
                                <Text style={styles.sectionLabel}>Hijos Vinculados</Text>
                                <TouchableOpacity
                                    style={styles.addBtnSmall}
                                    onPress={() => {
                                        setIsDetailModalVisible(false);
                                        setTimeout(() => setIsNewStudentModalVisible(true), 300);
                                    }}
                                >
                                    <Plus size={16} color="white" /><Text style={{ color: 'white', fontWeight: 'bold', fontSize: 12 }}>Nuevo Hijo</Text>
                                </TouchableOpacity>
                            </View>

                            {selectedFamily?.students?.map(s => (
                                <View key={s.id} style={styles.studentRow}>
                                    <View style={{ flex: 1 }}><Text style={{ fontWeight: 'bold' }}>{s.first_name} {s.last_name}</Text><Text style={{ fontSize: 11, color: '#6B7280' }}>{s.grade} - {s.section}</Text></View>
                                    <TouchableOpacity onPress={() => handleUnlink(s.id)}><Trash2 size={18} color="#EF4444" /></TouchableOpacity>
                                </View>
                            ))}
                        </ScrollView>
                    </View>
                </KeyboardAvoidingView>
            </Modal>

            {/* MODAL 3: REGISTRAR HIJO (BLINDADO CON SELECCIÓN FIJA) */}
            <Modal visible={isNewStudentModalVisible} animationType="slide" transparent>
                <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.modalOverlay}>
                    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                        <View style={styles.modalContent}>
                            <View style={styles.modalHeader}>
                                <Text style={styles.modalTitle}>Datos del Alumno</Text>
                                <TouchableOpacity onPress={() => setIsNewStudentModalVisible(false)}><X size={24} color="#000" /></TouchableOpacity>
                            </View>

                            <View style={styles.form}>
                                {/* NOMBRES */}
                                <View style={styles.inputWrapper}>
                                    <User size={18} color="#9CA3AF" style={{ marginRight: 10 }} />
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Nombres"
                                        placeholderTextColor="#9CA3AF"
                                        onChangeText={(v) => setStudentForm({ ...studentForm, first_name: v })}
                                    />
                                </View>

                                {/* APELLIDOS */}
                                <View style={styles.inputWrapper}>
                                    <User size={18} color="#9CA3AF" style={{ marginRight: 10 }} />
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Apellidos"
                                        placeholderTextColor="#9CA3AF"
                                        onChangeText={(v) => setStudentForm({ ...studentForm, last_name: v })}
                                    />
                                </View>

                                {/* GRADO Y SECCIÓN (SELECTIVOS) */}
                                <View style={{ flexDirection: 'row', gap: 10 }}>
                                    {/* SELECTOR DE GRADO */}
                                    <View style={[styles.inputWrapper, { flex: 1.5, paddingVertical: 10 }]}>
                                        <BookOpen size={18} color="#9CA3AF" style={{ marginRight: 10 }} />
                                        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                            {GRADOS_PRIMARIA.map((g) => (
                                                <TouchableOpacity
                                                    key={g}
                                                    onPress={() => setStudentForm({ ...studentForm, grade: `${g} Grado` })}
                                                    style={{
                                                        paddingHorizontal: 10,
                                                        paddingVertical: 5,
                                                        backgroundColor: studentForm.grade === `${g} Grado` ? theme.primary : '#E5E7EB',
                                                        borderRadius: 8,
                                                        marginRight: 5
                                                    }}
                                                >
                                                    <Text style={{ fontSize: 11, fontWeight: 'bold', color: studentForm.grade === `${g} Grado` ? 'white' : '#4B5563' }}>{g}</Text>
                                                </TouchableOpacity>
                                            ))}
                                        </ScrollView>
                                    </View>

                                    {/* SELECTOR DE SECCIÓN (A o B) */}
                                    <View style={[styles.inputWrapper, { flex: 1, paddingVertical: 10 }]}>
                                        <Layers size={18} color="#9CA3AF" style={{ marginRight: 10 }} />
                                        <View style={{ flexDirection: 'row', gap: 5 }}>
                                            {['A', 'B'].map((s) => (
                                                <TouchableOpacity
                                                    key={s}
                                                    onPress={() => setStudentForm({ ...studentForm, section: s })}
                                                    style={{
                                                        width: 35,
                                                        height: 35,
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        backgroundColor: studentForm.section === s ? '#6366F1' : '#E5E7EB',
                                                        borderRadius: 8,
                                                    }}
                                                >
                                                    <Text style={{ fontWeight: 'bold', color: studentForm.section === s ? 'white' : '#4B5563' }}>{s}</Text>
                                                </TouchableOpacity>
                                            ))}
                                        </View>
                                    </View>
                                </View>

                                {/* EMAIL Y CONTRASEÑA */}
                                <View style={styles.inputWrapper}>
                                    <Mail size={18} color="#9CA3AF" style={{ marginRight: 10 }} />
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Email institucional"
                                        placeholderTextColor="#9CA3AF"
                                        autoCapitalize="none"
                                        onChangeText={(v) => setStudentForm({ ...studentForm, email: v })}
                                    />
                                </View>

                                <View style={styles.inputWrapper}>
                                    <Key size={18} color="#9CA3AF" style={{ marginRight: 10 }} />
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Contraseña inicial"
                                        placeholderTextColor="#9CA3AF"
                                        secureTextEntry
                                        onChangeText={(v) => setStudentForm({ ...studentForm, password: v })}
                                    />
                                </View>

                                <TouchableOpacity
                                    style={[styles.saveButton, { backgroundColor: '#EC4899' }]}
                                    onPress={handleCreateStudent}
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? <ActivityIndicator color="white" /> : <Text style={styles.saveButtonText}>Crear y Vincular Hijo</Text>}
                                </TouchableOpacity>
                            </View>
                        </View>
                    </TouchableWithoutFeedback>
                </KeyboardAvoidingView>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    header: { paddingTop: 60, paddingBottom: 20, paddingHorizontal: 20, borderBottomLeftRadius: 35, borderBottomRightRadius: 35 },
    headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    backBtn: { backgroundColor: 'rgba(255,255,255,0.2)', padding: 8, borderRadius: 12 },
    headerTitle: { color: 'white', fontSize: 20, fontWeight: 'bold' },
    addButton: { backgroundColor: '#EC4899', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 15, borderRadius: 20, gap: 8, elevation: 4, marginBottom: 20 },
    addButtonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
    statsContainer: { flexDirection: 'row', marginBottom: 20, gap: 15 },
    statCard: { flex: 1, borderRadius: 20, padding: 20, alignItems: 'center', elevation: 3 },
    statNumber: { fontSize: 28, fontWeight: 'bold', color: 'white', marginTop: 8 },
    statLabel: { fontSize: 12, color: 'rgba(255,255,255,0.9)', marginTop: 4, fontWeight: '600' },
    sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#1F2937', marginBottom: 15 },
    familyCard: { backgroundColor: 'white', borderRadius: 25, padding: 20, marginBottom: 12, elevation: 2 },
    tutorSection: { flexDirection: 'row', alignItems: 'center' },
    tutorIcon: { backgroundColor: '#EEF2FF', padding: 12, borderRadius: 15, marginRight: 15 },
    tutorName: { fontSize: 16, fontWeight: 'bold', color: '#1F2937' },
    emailText: { fontSize: 12, color: '#6B7280' },
    divider: { height: 1, backgroundColor: '#E5E7EB', marginVertical: 12 },
    studentsCountText: { fontSize: 10, color: '#6366F1', fontWeight: '900', textTransform: 'uppercase' },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    modalContent: { backgroundColor: 'white', borderTopLeftRadius: 35, borderTopRightRadius: 35, padding: 30, paddingBottom: Platform.OS === 'ios' ? 45 : 30 },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 25 },
    modalTitle: { fontSize: 20, fontWeight: '900', color: '#1F2937' },
    form: { gap: 12 },
    inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F3F4F6', borderRadius: 15, paddingHorizontal: 15 },
    input: { flex: 1, paddingVertical: 14, fontSize: 15, color: '#1F2937' },
    saveButton: { paddingVertical: 16, borderRadius: 18, alignItems: 'center', marginTop: 10 },
    saveButtonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
    sectionLabel: { fontSize: 11, fontWeight: '900', color: '#4B5563', marginBottom: 10, textTransform: 'uppercase', marginTop: 20 },
    studentListHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
    addBtnSmall: { backgroundColor: '#6366F1', flexDirection: 'row', padding: 8, paddingHorizontal: 12, borderRadius: 10, gap: 5, alignItems: 'center' },
    studentRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F9FAFB', padding: 12, borderRadius: 15, marginBottom: 8 }
});