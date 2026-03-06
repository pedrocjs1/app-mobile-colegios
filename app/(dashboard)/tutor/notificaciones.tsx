import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, RefreshControl } from 'react-native';
import { useAuthStore } from '../../../store/useAuthStore';
import { useTheme } from '../../../hooks/useTheme';
import { Bell, MessageSquare, AlertTriangle, Heart, Info, CheckCircle, Mail, MailOpen } from 'lucide-react-native';
import * as db from '../../../services/databaseService';

export default function TutorNotificaciones() {
    const theme = useTheme();
    const user = useAuthStore((state) => state.user);

    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [notifications, setNotifications] = useState<any[]>([]);
    const [attentionCalls, setAttentionCalls] = useState<any[]>([]);

    const loadData = async () => {
        if (!user?.id) return;
        try {
            const [notifsData, callsData] = await Promise.all([
                db.getNotifications(user.id),
                db.getAttentionCallsByTutor(user.id)
            ]);
            setNotifications(notifsData);
            setAttentionCalls(callsData);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => { loadData(); }, []);
    const onRefresh = () => { setRefreshing(true); loadData(); };

    const handleMarkRead = async (notifId: string) => {
        try {
            await db.markNotificationRead(notifId);
            loadData();
        } catch (e) {
            console.error(e);
        }
    };

    const handleAcknowledge = async (callId: string) => {
        try {
            await db.updateAttentionCallStatus(callId, 'acknowledged');
            loadData();
        } catch (e) {
            console.error(e);
        }
    };

    const getNotifIcon = (type: string) => {
        switch (type) {
            case 'attention_call': return <MessageSquare size={20} color="#6366F1" />;
            case 'warning': return <AlertTriangle size={20} color="#F59E0B" />;
            case 'urgent': return <AlertTriangle size={20} color="#EF4444" />;
            case 'health': return <Heart size={20} color="#EF4444" />;
            default: return <Info size={20} color="#3B82F6" />;
        }
    };

    const getNotifBg = (type: string) => {
        switch (type) {
            case 'attention_call': return '#EEF2FF';
            case 'warning': return '#FEF3C7';
            case 'urgent': return '#FEE2E2';
            case 'health': return '#FEE2E2';
            default: return '#DBEAFE';
        }
    };

    const getCallTypeLabel = (type: string) => {
        switch (type) {
            case 'academic': return 'Académico';
            case 'behavior': return 'Conducta';
            case 'health': return 'Salud';
            default: return 'General';
        }
    };

    const getCallTypeColor = (type: string) => {
        switch (type) {
            case 'academic': return '#3B82F6';
            case 'behavior': return '#F59E0B';
            case 'health': return '#EF4444';
            default: return '#6366F1';
        }
    };

    return (
        <View style={styles.container}>
            <View style={[styles.header, { backgroundColor: theme.primary }]}>
                <Text style={styles.headerTitle}>Avisos y Citaciones</Text>
                <Text style={styles.headerSub}>Comunicaciones de la institución</Text>
            </View>

            <ScrollView
                contentContainerStyle={styles.content}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[theme.primary]} />}
            >
                {loading ? (
                    <ActivityIndicator size="large" color={theme.primary} style={{ marginTop: 40 }} />
                ) : (
                    <>
                        {/* Citaciones */}
                        {attentionCalls.length > 0 && (
                            <>
                                <Text style={styles.sectionTitle}>Citaciones del Docente</Text>
                                {attentionCalls.map((call) => (
                                    <View key={call.id} style={styles.callCard}>
                                        <View style={[styles.typeIndicator, { backgroundColor: getCallTypeColor(call.type) }]} />
                                        <View style={{ flex: 1 }}>
                                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                                <Text style={styles.callTypeLabel}>{getCallTypeLabel(call.type)}</Text>
                                                <View style={[styles.statusBadge, {
                                                    backgroundColor: call.status === 'pending' ? '#FEF3C7' :
                                                        call.status === 'acknowledged' ? '#DBEAFE' : '#D1FAE5'
                                                }]}>
                                                    <Text style={{
                                                        color: call.status === 'pending' ? '#F59E0B' :
                                                            call.status === 'acknowledged' ? '#3B82F6' : '#10B981',
                                                        fontSize: 9, fontWeight: 'bold'
                                                    }}>
                                                        {call.status === 'pending' ? 'PENDIENTE' :
                                                            call.status === 'acknowledged' ? 'VISTO' : 'RESUELTO'}
                                                    </Text>
                                                </View>
                                            </View>
                                            <Text style={styles.callReason}>{call.reason}</Text>
                                            {call.scheduled_date && (
                                                <Text style={styles.callDate}>Citado para: {call.scheduled_date}</Text>
                                            )}
                                        </View>
                                        {call.status === 'pending' && (
                                            <TouchableOpacity
                                                style={styles.ackBtn}
                                                onPress={() => handleAcknowledge(call.id)}
                                            >
                                                <CheckCircle size={20} color="#10B981" />
                                            </TouchableOpacity>
                                        )}
                                    </View>
                                ))}
                            </>
                        )}

                        {/* Notificaciones */}
                        <Text style={styles.sectionTitle}>Notificaciones</Text>
                        {notifications.length === 0 ? (
                            <View style={styles.emptyCard}>
                                <Bell size={40} color="#D1D5DB" />
                                <Text style={styles.emptyText}>No hay notificaciones</Text>
                            </View>
                        ) : (
                            notifications.map((notif) => (
                                <TouchableOpacity
                                    key={notif.id}
                                    style={[styles.notifCard, !notif.is_read && styles.unreadCard]}
                                    onPress={() => !notif.is_read && handleMarkRead(notif.id)}
                                >
                                    <View style={[styles.notifIcon, { backgroundColor: getNotifBg(notif.type) }]}>
                                        {getNotifIcon(notif.type)}
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Text style={[styles.notifTitle, !notif.is_read && { fontWeight: '900' }]}>
                                            {notif.title}
                                        </Text>
                                        <Text style={styles.notifMessage} numberOfLines={2}>{notif.message}</Text>
                                        <Text style={styles.notifTime}>
                                            {notif.created_at ? new Date(notif.created_at).toLocaleDateString() : ''}
                                        </Text>
                                    </View>
                                    {!notif.is_read ? (
                                        <Mail size={16} color={theme.primary} />
                                    ) : (
                                        <MailOpen size={16} color="#D1D5DB" />
                                    )}
                                </TouchableOpacity>
                            ))
                        )}
                    </>
                )}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F0F2F5' },
    header: { paddingTop: 60, paddingBottom: 30, paddingHorizontal: 25, borderBottomLeftRadius: 40, borderBottomRightRadius: 40 },
    headerTitle: { color: 'white', fontSize: 24, fontWeight: '900' },
    headerSub: { color: 'rgba(255,255,255,0.8)', fontSize: 14, marginTop: 4 },
    content: { padding: 20, paddingBottom: 120 },
    sectionTitle: { fontSize: 16, fontWeight: '800', color: '#1F2937', marginBottom: 15, marginTop: 10 },
    callCard: { backgroundColor: 'white', borderRadius: 20, padding: 18, flexDirection: 'row', alignItems: 'center', marginBottom: 12, elevation: 2 },
    typeIndicator: { width: 4, height: 45, borderRadius: 2, marginRight: 15 },
    callTypeLabel: { fontSize: 14, fontWeight: 'bold', color: '#1F2937' },
    callReason: { fontSize: 13, color: '#6B7280', marginTop: 4 },
    callDate: { fontSize: 11, color: '#9CA3AF', marginTop: 4 },
    statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
    ackBtn: { padding: 10, backgroundColor: '#F0FDF4', borderRadius: 12 },
    notifCard: { backgroundColor: 'white', borderRadius: 20, padding: 15, flexDirection: 'row', alignItems: 'center', marginBottom: 10, elevation: 1 },
    unreadCard: { borderLeftWidth: 3, borderLeftColor: '#6366F1', elevation: 3 },
    notifIcon: { padding: 10, borderRadius: 12, marginRight: 12 },
    notifTitle: { fontSize: 14, fontWeight: '700', color: '#1F2937' },
    notifMessage: { fontSize: 12, color: '#6B7280', marginTop: 2 },
    notifTime: { fontSize: 10, color: '#D1D5DB', marginTop: 4 },
    emptyCard: { backgroundColor: 'white', borderRadius: 20, padding: 30, alignItems: 'center', elevation: 1, gap: 10 },
    emptyText: { color: '#6B7280', fontSize: 14 },
});
