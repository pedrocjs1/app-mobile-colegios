import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, Image, StyleSheet, Dimensions } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTheme } from '../../../hooks/useTheme';
import { ArrowLeft, Calendar, FileText, Camera, X, CheckCircle2 } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';

export default function ChildDetailScreen() {
    const { id } = useLocalSearchParams();
    const theme = useTheme();
    const router = useRouter();
    const [image, setImage] = useState<string | null>(null);

    const childName = id === '1' ? 'Juan Gomez' : id === '2' ? 'Sofia Gomez' : 'Mateo Perez';

    const attendanceHistory = [
        { id: 1, date: '21/10', status: 'Ausente', subject: 'Matemática', type: 'Injustificada', color: '#EF4444' },
        { id: 2, date: '15/10', status: 'Tarde', subject: 'Historia', type: 'Tarde', color: '#F59E0B' },
        { id: 3, date: '01/10', status: 'Ausente', subject: 'Educación Física', type: 'Justificada', color: '#3B82F6' },
    ];

    return (
        <View style={styles.container}>
            {/* Header Azul Redondeado */}
            <View style={[styles.blueHeader, { backgroundColor: theme.primary }]}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <ArrowLeft size={24} color="#FFF" />
                </TouchableOpacity>
                <Text style={styles.headerName}>{childName}</Text>
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                <Text style={styles.sectionTitle}>Historial de Asistencias</Text>

                {attendanceHistory.map((record) => (
                    <View key={record.id} style={styles.attendanceCard}>
                        <View style={[styles.statusLine, { backgroundColor: record.color }]} />
                        <View style={styles.cardInfo}>
                            <Text style={styles.subjectText}>{record.subject}</Text>
                            <Text style={styles.dateText}>{record.date} • {record.status}</Text>
                        </View>
                        <View style={[styles.badge, { backgroundColor: record.color + '15' }]}>
                            <Text style={[styles.badgeText, { color: record.color }]}>{record.type}</Text>
                        </View>
                    </View>
                ))}

                {/* Subir Justificación */}
                <View style={styles.uploadSection}>
                    <Text style={styles.sectionTitle}>Justificación Médica</Text>
                    {image ? (
                        <View style={styles.previewContainer}>
                            <Image source={{ uri: image }} style={styles.previewImage} />
                            <TouchableOpacity onPress={() => setImage(null)} style={styles.removeBtn}>
                                <X size={20} color="white" />
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.mainBtn, { backgroundColor: theme.primary, marginTop: 15 }]}
                                onPress={() => Alert.alert("Enviado", "La justificación está siendo procesada.")}
                            >
                                <CheckCircle2 size={20} color="white" />
                                <Text style={styles.btnText}>Confirmar Envío</Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <TouchableOpacity
                            style={styles.uploadBox}
                            onPress={() => Alert.alert("Cámara", "Iniciando selector...")}
                        >
                            <Camera size={32} color={theme.primary} />
                            <Text style={[styles.uploadText, { color: theme.primary }]}>Subir Certificado</Text>
                        </TouchableOpacity>
                    )}
                </View>
                <View style={{ height: 100 }} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F9FAFB' },
    blueHeader: {
        paddingTop: 60,
        paddingBottom: 40, // Corregido de pb
        paddingHorizontal: 25, // Corregido de px
        borderBottomLeftRadius: 40,
        borderBottomRightRadius: 40,
        flexDirection: 'row',
        alignItems: 'center',
        height: 140
    },
    backBtn: { backgroundColor: 'rgba(255,255,255,0.2)', padding: 10, borderRadius: 15, marginRight: 15 },
    headerName: { fontSize: 22, fontWeight: 'bold', color: 'white' },
    content: { flex: 1, padding: 25, marginTop: -20 },
    sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#1F2937', marginBottom: 15 },
    attendanceCard: { backgroundColor: 'white', borderRadius: 20, padding: 15, flexDirection: 'row', alignItems: 'center', marginBottom: 12, elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5 },
    statusLine: { width: 4, height: 40, borderRadius: 2, marginRight: 15 },
    cardInfo: { flex: 1 },
    subjectText: { fontSize: 16, fontWeight: 'bold', color: '#1F2937' },
    dateText: { fontSize: 13, color: '#6B7280', marginTop: 2 },
    badge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
    badgeText: { fontSize: 11, fontWeight: 'bold' },
    uploadSection: { marginTop: 20 },
    uploadBox: { borderStyle: 'dashed', borderWidth: 2, borderColor: '#D1D5DB', borderRadius: 25, height: 150, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.02)' },
    uploadText: { marginTop: 10, fontWeight: 'bold' },
    previewContainer: { alignItems: 'center' },
    previewImage: { width: '100%', height: 200, borderRadius: 20 },
    removeBtn: {
        position: 'absolute',
        top: 10,
        right: 10,
        backgroundColor: '#EF4444',
        padding: 8, // Corregido de p
        borderRadius: 50
    },
    mainBtn: {
        flexDirection: 'row',
        width: '100%',
        padding: 18, // Corregido de p
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center'
    },
    btnText: { color: 'white', fontWeight: 'bold', fontSize: 16, marginLeft: 10 }
});