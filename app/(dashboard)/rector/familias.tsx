import React from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { useAuthStore } from '../../../store/useAuthStore';
import { useTheme } from '../../../hooks/useTheme';
import { useRouter } from 'expo-router';
import { ArrowLeft, UserPlus, Users, Mail } from 'lucide-react-native';
import { mockDB } from '../../../services/mockDatabase';

export default function FamiliasScreen() {
    const theme = useTheme();
    const user = useAuthStore((state) => state.user);
    const router = useRouter();

    // Get families data
    const families = user?.school_id ? mockDB.getFamilies(user.school_id) : [];

    return (
        <View style={{ flex: 1, backgroundColor: '#F0F2F5' }}>
            {/* Header */}
            <View style={[styles.header, { backgroundColor: theme.primary }]}>
                <View style={styles.headerTop}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                        <ArrowLeft size={24} color="white" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Registro de Familias</Text>
                    <View style={{ width: 40 }} />
                </View>
            </View>

            <ScrollView style={{ flex: 1 }}>
                {/* Add Family Button */}
                <View style={{ paddingHorizontal: 20, paddingTop: 20, marginBottom: 20 }}>
                    <TouchableOpacity style={styles.addButton}>
                        <UserPlus size={20} color="white" />
                        <Text style={styles.addButtonText}>Registrar Nueva Familia</Text>
                    </TouchableOpacity>
                </View>

                {/* Summary Stats */}
                <View style={styles.statsContainer}>
                    <View style={[styles.statCard, { backgroundColor: '#6366F1' }]}>
                        <Users size={24} color="white" />
                        <Text style={styles.statNumber}>{families.length}</Text>
                        <Text style={styles.statLabel}>Familias</Text>
                    </View>

                    <View style={[styles.statCard, { backgroundColor: '#EC4899' }]}>
                        <UserPlus size={24} color="white" />
                        <Text style={styles.statNumber}>
                            {families.reduce((acc, f) => acc + f.students.length, 0)}
                        </Text>
                        <Text style={styles.statLabel}>Vínculos</Text>
                    </View>
                </View>

                {/* Families List */}
                <View style={{ paddingHorizontal: 20, marginBottom: 30 }}>
                    <Text style={styles.sectionTitle}>Familias Registradas</Text>

                    {families.map((family) => (
                        <View key={family.id} style={styles.familyCard}>
                            {/* Tutor Info */}
                            <View style={styles.tutorSection}>
                                <View style={styles.tutorIcon}>
                                    <Users size={20} color="#6366F1" />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.tutorName}>{family.tutor_name}</Text>
                                    <View style={styles.emailRow}>
                                        <Mail size={12} color="#6B7280" />
                                        <Text style={styles.emailText}>{family.tutor_email}</Text>
                                    </View>
                                </View>
                            </View>

                            {/* Divider */}
                            <View style={styles.divider} />

                            {/* Students */}
                            <View style={styles.studentsSection}>
                                <Text style={styles.studentsTitle}>
                                    Hijos vinculados ({family.students.length})
                                </Text>

                                {family.students.map((student) => (
                                    <View key={student.id} style={styles.studentRow}>
                                        <Image
                                            source={{ uri: student.avatar_url || 'https://i.pravatar.cc/150?img=1' }}
                                            style={styles.studentAvatar}
                                        />
                                        <View style={{ flex: 1 }}>
                                            <Text style={styles.studentName}>
                                                {student.first_name} {student.last_name}
                                            </Text>
                                            <Text style={styles.studentGrade}>
                                                {student.grade} - Sección {student.section}
                                            </Text>
                                        </View>
                                        <View style={styles.activeBadge}>
                                            <Text style={styles.activeText}>Activo</Text>
                                        </View>
                                    </View>
                                ))}
                            </View>
                        </View>
                    ))}

                    {families.length === 0 && (
                        <View style={styles.emptyState}>
                            <Users size={48} color="#D1D5DB" />
                            <Text style={styles.emptyTitle}>No hay familias registradas</Text>
                            <Text style={styles.emptyText}>
                                Comienza agregando la primera familia
                            </Text>
                        </View>
                    )}
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    header: {
        paddingTop: 60,
        paddingBottom: 20,
        paddingHorizontal: 20,
        borderBottomLeftRadius: 35,
        borderBottomRightRadius: 35,
    },
    headerTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    backBtn: {
        backgroundColor: 'rgba(255,255,255,0.2)',
        padding: 8,
        borderRadius: 12,
    },
    headerTitle: {
        color: 'white',
        fontSize: 20,
        fontWeight: 'bold',
    },
    addButton: {
        backgroundColor: '#EC4899',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 15,
        borderRadius: 20,
        gap: 8,
    },
    addButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    statsContainer: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        marginBottom: 20,
        gap: 15,
    },
    statCard: {
        flex: 1,
        borderRadius: 20,
        padding: 20,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 3,
    },
    statNumber: {
        fontSize: 28,
        fontWeight: 'bold',
        color: 'white',
        marginTop: 8,
    },
    statLabel: {
        fontSize: 12,
        color: 'rgba(255,255,255,0.9)',
        marginTop: 4,
        fontWeight: '600',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1F2937',
        marginBottom: 15,
    },
    familyCard: {
        backgroundColor: 'white',
        borderRadius: 25,
        padding: 20,
        marginBottom: 15,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
    tutorSection: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    tutorIcon: {
        backgroundColor: '#EEF2FF',
        padding: 12,
        borderRadius: 15,
        marginRight: 15,
    },
    tutorName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1F2937',
        marginBottom: 4,
    },
    emailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    emailText: {
        fontSize: 12,
        color: '#6B7280',
    },
    divider: {
        height: 1,
        backgroundColor: '#E5E7EB',
        marginVertical: 15,
    },
    studentsSection: {
        gap: 12,
    },
    studentsTitle: {
        fontSize: 13,
        fontWeight: '600',
        color: '#6B7280',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginBottom: 8,
    },
    studentRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F9FAFB',
        padding: 12,
        borderRadius: 15,
    },
    studentAvatar: {
        width: 40,
        height: 40,
        borderRadius: 12,
        marginRight: 12,
        borderWidth: 2,
        borderColor: 'white',
    },
    studentName: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#1F2937',
    },
    studentGrade: {
        fontSize: 12,
        color: '#6B7280',
        marginTop: 2,
    },
    activeBadge: {
        backgroundColor: '#D1FAE5',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 10,
    },
    activeText: {
        fontSize: 11,
        fontWeight: 'bold',
        color: '#059669',
    },
    emptyState: {
        backgroundColor: 'white',
        borderRadius: 25,
        padding: 50,
        alignItems: 'center',
    },
    emptyTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1F2937',
        marginTop: 15,
    },
    emptyText: {
        fontSize: 14,
        color: '#9CA3AF',
        marginTop: 5,
        textAlign: 'center',
    },
});
