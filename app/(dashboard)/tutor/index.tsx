import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity, StyleSheet, ActivityIndicator, RefreshControl } from 'react-native';
import { useAuthStore } from '../../../store/useAuthStore';
import { useTheme } from '../../../hooks/useTheme';
import { useRouter } from 'expo-router';
import { Bell, Users, ChevronRight } from 'lucide-react-native';
import * as db from '../../../services/databaseService';

export default function TutorDashboard() {
    const theme = useTheme();
    const { user } = useAuthStore();
    const router = useRouter();

    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [children, setChildren] = useState<any[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);

    const loadData = async () => {
        if (!user?.id) return;
        try {
            const [childrenData, unread] = await Promise.all([
                db.getTutorChildren(user.id),
                db.getUnreadNotificationCount(user.id)
            ]);
            setChildren(childrenData);
            setUnreadCount(unread);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => { loadData(); }, []);
    const onRefresh = () => { setRefreshing(true); loadData(); };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={theme.primary} />
                <Text style={styles.loadingText}>Cargando panel familiar...</Text>
            </View>
        );
    }

    return (
        <ScrollView
            style={{ flex: 1, backgroundColor: '#F0F2F5' }}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[theme.primary]} />}
        >
            {/* Header */}
            <View style={[styles.header, { backgroundColor: theme.primary }]}>
                <View style={styles.headerTop}>
                    <View style={styles.profileBox}>
                        <Image
                            source={{ uri: user?.avatar_url || `https://ui-avatars.com/api/?name=${user?.name}&background=fff&color=${theme.primary.replace('#', '')}&bold=true` }}
                            style={styles.avatar}
                        />
                        <View>
                            <Text style={styles.welcomeText}>{user?.name || 'Tutor'}</Text>
                            <Text style={styles.subText}>Panel de Familia</Text>
                        </View>
                    </View>
                    <TouchableOpacity
                        style={styles.notifBtn}
                        onPress={() => router.push('/(dashboard)/tutor/notificaciones')}
                    >
                        <Bell size={22} color="white" />
                        {unreadCount > 0 && (
                            <View style={styles.badge}>
                                <Text style={styles.badgeText}>{unreadCount}</Text>
                            </View>
                        )}
                    </TouchableOpacity>
                </View>
            </View>

            {/* Hijos */}
            <View style={{ padding: 20 }}>
                <Text style={styles.sectionTitle}>Mis Hijos</Text>

                {children.length === 0 ? (
                    <View style={styles.emptyCard}>
                        <Users size={40} color="#D1D5DB" />
                        <Text style={styles.emptyText}>No hay alumnos vinculados</Text>
                    </View>
                ) : (
                    children.map((child) => (
                        <TouchableOpacity
                            key={child.id}
                            style={styles.childCard}
                            onPress={() => router.push(`/(dashboard)/hijos/${child.id}`)}
                        >
                            <Image
                                source={{ uri: child.avatar_url || `https://ui-avatars.com/api/?name=${child.first_name}+${child.last_name}&background=6366f1&color=fff` }}
                                style={styles.childAvatar}
                            />
                            <View style={{ flex: 1 }}>
                                <Text style={styles.childName}>{child.first_name} {child.last_name}</Text>
                                <Text style={styles.childGrade}>{child.grade} - Sección {child.section}</Text>
                            </View>
                            <ChevronRight size={20} color="#9CA3AF" />
                        </TouchableOpacity>
                    ))
                )}

                {/* Acciones Rápidas */}
                <Text style={[styles.sectionTitle, { marginTop: 25 }]}>Acciones Rápidas</Text>
                <View style={{ flexDirection: 'row', gap: 15 }}>
                    <TouchableOpacity
                        style={[styles.actionCard, { backgroundColor: '#6366F1' }]}
                        onPress={() => router.push('/(dashboard)/tutor/notificaciones')}
                    >
                        <Bell size={28} color="white" />
                        <Text style={styles.actionText}>Avisos{'\n'}y Citaciones</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.actionCard, { backgroundColor: '#10B981' }]}
                        onPress={() => router.push('/(dashboard)/tutor/hijos')}
                    >
                        <Users size={28} color="white" />
                        <Text style={styles.actionText}>Ver{'\n'}Hijos</Text>
                    </TouchableOpacity>
                </View>
            </View>
            <View style={{ height: 100 }} />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F0F2F5' },
    loadingText: { marginTop: 15, fontSize: 16, color: '#6B7280' },
    header: { paddingTop: 60, paddingBottom: 30, paddingHorizontal: 20, borderBottomLeftRadius: 35, borderBottomRightRadius: 35 },
    headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    profileBox: { flexDirection: 'row', alignItems: 'center' },
    avatar: { width: 50, height: 50, borderRadius: 15, marginRight: 12, borderWidth: 2, borderColor: 'white' },
    welcomeText: { color: 'white', fontSize: 20, fontWeight: 'bold' },
    subText: { color: 'rgba(255,255,255,0.8)', fontSize: 14 },
    notifBtn: { backgroundColor: 'rgba(255,255,255,0.2)', padding: 10, borderRadius: 15 },
    badge: { position: 'absolute', top: -5, right: -5, backgroundColor: '#EF4444', borderRadius: 10, minWidth: 18, height: 18, alignItems: 'center', justifyContent: 'center' },
    badgeText: { color: 'white', fontSize: 10, fontWeight: 'bold' },
    sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#1F2937', marginBottom: 15 },
    childCard: { backgroundColor: 'white', borderRadius: 20, padding: 18, flexDirection: 'row', alignItems: 'center', marginBottom: 12, elevation: 2 },
    childAvatar: { width: 45, height: 45, borderRadius: 15, marginRight: 15 },
    childName: { fontSize: 16, fontWeight: 'bold', color: '#1F2937' },
    childGrade: { fontSize: 12, color: '#6B7280', marginTop: 2 },
    emptyCard: { backgroundColor: 'white', borderRadius: 20, padding: 30, alignItems: 'center', elevation: 1, gap: 10 },
    emptyText: { color: '#6B7280', fontSize: 14 },
    actionCard: { flex: 1, borderRadius: 25, padding: 20, alignItems: 'center', justifyContent: 'center', elevation: 3, minHeight: 120 },
    actionText: { color: 'white', fontSize: 13, fontWeight: 'bold', textAlign: 'center', marginTop: 10 },
});
