import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useTheme } from '../../../hooks/useTheme';
import { CalendarCheck, AlertTriangle, CheckCircle2, Calendar } from 'lucide-react-native';

export default function StudentAsistencia() {
    const theme = useTheme();

    return (
        <View style={styles.container}>
            <View style={[styles.header, { backgroundColor: theme.primary }]}>
                <Text style={styles.headerTitle}>Mi Asistencia</Text>
                <Text style={styles.headerSub}>Resumen del ciclo lectivo actual</Text>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.summaryContainer}>
                    <View style={[styles.summaryCard, { backgroundColor: '#10B981' }]}>
                        <CheckCircle2 size={24} color="white" />
                        <Text style={styles.summaryNum}>92%</Text>
                        <Text style={styles.summaryLabel}>Presencia</Text>
                    </View>
                    <View style={[styles.summaryCard, { backgroundColor: '#F59E0B' }]}>
                        <AlertTriangle size={24} color="white" />
                        <Text style={styles.summaryNum}>5</Text>
                        <Text style={styles.summaryLabel}>Inasistencias</Text>
                    </View>
                </View>

                <Text style={styles.sectionTitle}>Registro de Faltas</Text>

                <View style={styles.historyCard}>
                    <View style={styles.historyItem}>
                        <View style={styles.dateBox}><Text style={styles.dateDay}>12</Text><Text style={styles.dateMonth}>ENE</Text></View>
                        <View style={{ flex: 1 }}><Text style={styles.historyType}>Inasistencia injustificada</Text><Text style={styles.historyReason}>Sin aviso previo</Text></View>
                        <View style={[styles.badge, { backgroundColor: '#FEE2E2' }]}><Text style={{ color: '#EF4444', fontSize: 10, fontWeight: 'bold' }}>PENDIENTE</Text></View>
                    </View>
                    <View style={[styles.historyItem, { borderBottomWidth: 0 }]}>
                        <View style={styles.dateBox}><Text style={styles.dateDay}>05</Text><Text style={styles.dateMonth}>ENE</Text></View>
                        <View style={{ flex: 1 }}><Text style={styles.historyType}>Inasistencia justificada</Text><Text style={styles.historyReason}>Certificado médico presentado</Text></View>
                        <View style={[styles.badge, { backgroundColor: '#D1FAE5' }]}><Text style={{ color: '#10B981', fontSize: 10, fontWeight: 'bold' }}>ACEPTADA</Text></View>
                    </View>
                </View>
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
    summaryContainer: { flexDirection: 'row', gap: 15, marginBottom: 25 },
    summaryCard: { flex: 1, borderRadius: 25, padding: 20, alignItems: 'center', elevation: 3 },
    summaryNum: { color: 'white', fontSize: 24, fontWeight: 'bold', marginTop: 8 },
    summaryLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 11, fontWeight: '700' },
    sectionTitle: { fontSize: 18, fontWeight: '800', color: '#1F2937', marginBottom: 15 },
    historyCard: { backgroundColor: 'white', borderRadius: 30, padding: 10, elevation: 2 },
    historyItem: { flexDirection: 'row', alignItems: 'center', padding: 15, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
    dateBox: { backgroundColor: '#F3F4F6', padding: 8, borderRadius: 12, alignItems: 'center', marginRight: 15, width: 50 },
    dateDay: { fontSize: 16, fontWeight: 'bold', color: '#1F2937' },
    dateMonth: { fontSize: 9, fontWeight: '800', color: '#6B7280' },
    historyType: { fontSize: 14, fontWeight: 'bold', color: '#1F2937' },
    historyReason: { fontSize: 12, color: '#6B7280', marginTop: 2 },
    badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 }
});