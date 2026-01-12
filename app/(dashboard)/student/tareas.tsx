
import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../../../hooks/useTheme';
import { ClipboardList, BookOpen, CheckCircle, Clock, ChevronRight } from 'lucide-react-native';

export default function StudentTareas() {
    const theme = useTheme();

    return (
        <View style={styles.container}>
            <View style={[styles.header, { backgroundColor: theme.primary }]}>
                <Text style={styles.headerTitle}>Mis Tareas</Text>
                <Text style={styles.headerSub}>Gestioná tus entregas académicas</Text>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <Text style={styles.sectionTitle}>Pendientes de entrega</Text>

                {/* Tarea de ejemplo 1 */}
                <TouchableOpacity style={styles.taskCard}>
                    <View style={[styles.iconBox, { backgroundColor: '#EEF2FF' }]}>
                        <BookOpen size={22} color="#6366F1" />
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.taskTitle}>Ensayo sobre la Revolución</Text>
                        <Text style={styles.taskSubject}>Historia • 4to Año</Text>
                        <View style={styles.deadlineRow}>
                            <Clock size={12} color="#EF4444" />
                            <Text style={styles.deadlineText}>Vence en 2 días</Text>
                        </View>
                    </View>
                    <ChevronRight size={20} color="#9CA3AF" />
                </TouchableOpacity>

                <Text style={styles.sectionTitle}>Completadas recientemente</Text>

                {/* Tarea completada de ejemplo */}
                <TouchableOpacity style={[styles.taskCard, { opacity: 0.7 }]}>
                    <View style={[styles.iconBox, { backgroundColor: '#D1FAE5' }]}>
                        <CheckCircle size={22} color="#10B981" />
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.taskTitle}>Ejercicios de Álgebra</Text>
                        <Text style={styles.taskSubject}>Matemáticas • 4to Año</Text>
                        <Text style={[styles.statusText, { color: '#10B981' }]}>Entregado el 10/01</Text>
                    </View>
                </TouchableOpacity>
            </ScrollView>
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
    deadlineRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 6 },
    deadlineText: { fontSize: 11, color: '#EF4444', fontWeight: '700' },
    statusText: { fontSize: 11, fontWeight: '700', marginTop: 6 }
});