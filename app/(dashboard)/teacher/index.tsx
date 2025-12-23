import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useAuthStore } from '../../../store/useAuthStore';
import { useTheme } from '../../../hooks/useTheme';
import {
    Bell, ShieldAlert, FilePlus, CalendarDays,
    Send, ChevronRight, BookMarked, LogOut
} from 'lucide-react-native';

export default function TeacherDashboard() {
    const theme = useTheme();
    const { user, logout } = useAuthStore();

    const handleLogout = () => {
        Alert.alert(
            "Cerrar Sesión",
            "¿Estás seguro de que quieres salir, Profe?",
            [
                { text: "Cancelar", style: "cancel" },
                {
                    text: "Salir",
                    style: "destructive",
                    onPress: async () => {
                        // Al ejecutar logout(), el RootLayout se encarga de enviarte al Login automáticamente.
                        await logout();
                    }
                }
            ]
        );
    };

    const quickActions = [
        { id: 1, label: 'Llamado Atención', icon: ShieldAlert, color: '#EF4444' },
        { id: 2, label: 'Nueva Tarea', icon: FilePlus, color: '#8B5CF6' },
        { id: 3, label: 'Citar Tutor', icon: Send, color: '#10B981' },
        { id: 4, label: 'Avisar Falta', icon: CalendarDays, color: '#F59E0B' },
    ];

    return (
        <View style={{ flex: 1, backgroundColor: '#F0F2F5' }}>
            {/* Header Premium con Botón de Salida */}
            <View style={[styles.header, { backgroundColor: theme.primary }]}>
                <View style={styles.headerContent}>
                    <View>
                        <Text style={styles.welcomeText}>¡Hola, Profe!</Text>
                        <Text style={styles.userName}>{user?.name || 'Docente'}</Text>
                    </View>
                    <View style={{ flexDirection: 'row', gap: 10 }}>
                        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
                            <LogOut size={22} color="white" />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.notificationBtn}>
                            <Bell size={22} color="white" />
                            <View style={styles.badge} />
                        </TouchableOpacity>
                    </View>
                </View>
            </View>

            <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 100 }}>
                {/* El resto de tu código de UI permanece igual... */}
                <View style={styles.sectionContainer}>
                    <Text style={styles.sectionTitle}>Acciones Rápidas</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        {quickActions.map((action) => (
                            <TouchableOpacity key={action.id} style={styles.actionCard}>
                                <View style={[styles.iconCircle, { backgroundColor: action.color + '20' }]}>
                                    <action.icon size={24} color={action.color} />
                                </View>
                                <Text style={styles.actionLabel}>{action.label}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>

                {/* Mis Materias */}
                <View style={styles.sectionContainer}>
                    <Text style={styles.sectionTitle}>Mis Materias y Cursos</Text>
                    <TouchableOpacity style={styles.subjectCard}>
                        <View style={[styles.subjectIndicator, { backgroundColor: theme.primary }]} />
                        <View style={styles.subjectInfo}>
                            <Text style={styles.subjectName}>Matemáticas 1</Text>
                            <Text style={styles.subjectDetail}>1er Grado "A" • 24 Alumnos</Text>
                            <View style={styles.tagContainer}>
                                <View style={styles.tag}>
                                    <Text style={styles.tagText}>Lun y Mie • 08:00hs</Text>
                                </View>
                            </View>
                        </View>
                        <ChevronRight size={20} color="#9CA3AF" />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.subjectCard}>
                        <View style={[styles.subjectIndicator, { backgroundColor: '#8B5CF6' }]} />
                        <View style={styles.subjectInfo}>
                            <Text style={styles.subjectName}>Artes Plásticas</Text>
                            <Text style={styles.subjectDetail}>3er Grado "A" • 18 Alumnos</Text>
                            <View style={styles.tagContainer}>
                                <View style={[styles.tag, { backgroundColor: '#EDE9FE' }]}>
                                    <Text style={[styles.tagText, { color: '#8B5CF6' }]}>Viernes • 10:30hs</Text>
                                </View>
                            </View>
                        </View>
                        <ChevronRight size={20} color="#9CA3AF" />
                    </TouchableOpacity>
                </View>

                <View style={styles.sectionContainer}>
                    <Text style={styles.sectionTitle}>Tareas por Corregir</Text>
                    <View style={styles.taskCard}>
                        <BookMarked size={20} color={theme.primary} />
                        <Text style={styles.taskText}>Evaluación: Suma y Resta (1er A)</Text>
                        <View style={styles.pendingBadge}>
                            <Text style={styles.pendingCount}>12/24</Text>
                        </View>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    header: { paddingTop: 60, paddingBottom: 40, paddingHorizontal: 25, borderBottomLeftRadius: 40, borderBottomRightRadius: 40 },
    headerContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    welcomeText: { color: 'rgba(255,255,255,0.8)', fontSize: 16, fontWeight: '600' },
    userName: { color: 'white', fontSize: 24, fontWeight: '900' },
    notificationBtn: { backgroundColor: 'rgba(255,255,255,0.2)', padding: 10, borderRadius: 15 },
    logoutBtn: { backgroundColor: 'rgba(255,255,255,0.2)', padding: 10, borderRadius: 15 },
    badge: { position: 'absolute', top: 10, right: 10, width: 10, height: 10, backgroundColor: '#EF4444', borderRadius: 5, borderWidth: 2, borderColor: 'white' },
    sectionContainer: { marginTop: 25, paddingHorizontal: 20 },
    sectionTitle: { fontSize: 18, fontWeight: '800', color: '#1F2937', marginBottom: 15 },
    actionCard: { backgroundColor: 'white', width: 100, padding: 15, borderRadius: 25, alignItems: 'center', marginRight: 12, elevation: 2 },
    iconCircle: { width: 50, height: 50, borderRadius: 18, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
    actionLabel: { fontSize: 10, fontWeight: '800', textAlign: 'center', color: '#4B5563' },
    subjectCard: { backgroundColor: 'white', borderRadius: 25, padding: 20, marginBottom: 15, flexDirection: 'row', alignItems: 'center', elevation: 2 },
    subjectIndicator: { width: 5, height: 40, borderRadius: 3, marginRight: 15 },
    subjectInfo: { flex: 1 },
    subjectName: { fontSize: 17, fontWeight: 'bold', color: '#1F2937' },
    subjectDetail: { fontSize: 12, color: '#6B7280', marginTop: 2 },
    tagContainer: { flexDirection: 'row', marginTop: 8 },
    tag: { backgroundColor: '#F3F4F6', paddingVertical: 4, paddingHorizontal: 10, borderRadius: 8 },
    tagText: { fontSize: 10, color: '#4B5563', fontWeight: '700' },
    taskCard: { backgroundColor: 'white', borderRadius: 20, padding: 18, flexDirection: 'row', alignItems: 'center', gap: 12, elevation: 1 },
    taskText: { flex: 1, fontSize: 14, color: '#374151', fontWeight: '600' },
    pendingBadge: { backgroundColor: '#F3F4F6', padding: 6, borderRadius: 10 },
    pendingCount: { fontSize: 11, fontWeight: 'bold', color: '#6B7280' }
});