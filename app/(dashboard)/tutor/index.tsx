import React from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { useAuthStore } from '../../../store/useAuthStore';
import { useTheme } from '../../../hooks/useTheme';
import { Bell, AlertCircle, Calendar } from 'lucide-react-native';

export default function TutorDashboard() {
    const theme = useTheme();
    const user = useAuthStore((state) => state.user);

    return (
        <ScrollView style={{ flex: 1, backgroundColor: '#F0F2F5' }}>
            {/* 1. Header Estilo Premium */}
            <View style={[styles.header, { backgroundColor: theme.primary }]}>
                <View style={styles.headerTop}>
                    <View style={styles.profileBox}>
                        <Image
                            source={{ uri: 'https://i.pravatar.cc/150?img=32' }}
                            style={styles.avatar}
                        />
                        <View>
                            <Text style={styles.welcomeText}>
                                Flia. {user?.name.split(' ')[1] || 'Gomez'}
                            </Text>
                            <Text style={styles.subText}>Tres Hijos</Text>
                        </View>
                    </View>
                    <TouchableOpacity style={styles.notifBtn}>
                        <Bell size={22} color="white" />
                    </TouchableOpacity>
                </View>
            </View>

            {/* 2. Sección Ausencias (Tarjetas horizontales) */}
            <View style={{ padding: 20 }}>
                <Text style={styles.sectionTitle}>Ausencias</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <View style={[styles.statusCard, { backgroundColor: '#6366F1' }]}>
                        <Image
                            source={{ uri: 'https://i.pravatar.cc/150?img=12' }}
                            style={styles.miniAvatar}
                        />
                        <Text style={styles.statusNumber}>1</Text>
                        <View style={styles.statusLabel}>
                            <Text style={styles.statusLabelText}>Juan Gómez</Text>
                        </View>
                    </View>

                    <View style={[styles.statusCard, { backgroundColor: '#EC4899' }]}>
                        <Image
                            source={{ uri: 'https://i.pravatar.cc/150?img=5' }}
                            style={styles.miniAvatar}
                        />
                        <Text style={styles.statusNumber}>0</Text>
                        <View style={styles.statusLabel}>
                            <Text style={styles.statusLabelText}>Sofia Gómez</Text>
                        </View>
                    </View>
                </ScrollView>
            </View>

            {/* 3. Sección Sanciones (Lista corregida) */}
            <View style={{ paddingHorizontal: 20, marginBottom: 30 }}>
                <Text style={styles.sectionTitle}>Sanciones (2)</Text>
                <View style={styles.listCard}>
                    <View style={styles.listItem}>
                        <View style={[styles.iconBox, { backgroundColor: '#FEE2E2' }]}>
                            <AlertCircle size={20} color="#EF4444" />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.itemTitle}>Llamado de atención</Text>
                            <Text style={styles.itemSub}>Uso de celular en clase</Text>
                        </View>
                        <Text style={styles.itemDate}>16 Sep</Text>
                    </View>
                </View>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    header: {
        paddingTop: 60,
        paddingBottom: 30,
        paddingHorizontal: 20, // Corregido de px
        borderBottomLeftRadius: 35,
        borderBottomRightRadius: 35
    },
    headerTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    profileBox: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    avatar: {
        width: 50,
        height: 50,
        borderRadius: 15,
        marginRight: 12,
        borderWidth: 2, // Corregido de borderSize
        borderColor: 'white'
    },
    welcomeText: {
        color: 'white',
        fontSize: 20,
        fontWeight: 'bold'
    },
    subText: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: 14
    },
    notifBtn: {
        backgroundColor: 'rgba(255,255,255,0.2)',
        padding: 10,
        borderRadius: 15
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1F2937',
        marginBottom: 15
    },
    statusCard: {
        width: 140,
        height: 160,
        borderRadius: 25,
        padding: 15,
        marginRight: 15,
        alignItems: 'center',
        justifyContent: 'space-between'
    },
    miniAvatar: {
        width: 45,
        height: 45,
        borderRadius: 15,
        borderWidth: 2, // Corregido de borderSize
        borderColor: 'white'
    },
    statusNumber: {
        fontSize: 32,
        fontWeight: 'bold',
        color: 'white'
    },
    statusLabel: {
        backgroundColor: 'rgba(255,255,255,0.9)',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 10
    },
    statusLabelText: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#1F2937'
    },
    listCard: {
        backgroundColor: 'white',
        borderRadius: 25,
        padding: 15,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2
    },
    listItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10 // Corregido de mb
    },
    iconBox: {
        padding: 10, // Corregido de p
        borderRadius: 15,
        marginRight: 15
    },
    itemTitle: {
        fontWeight: 'bold',
        color: '#1F2937'
    },
    itemSub: {
        color: '#6B7280',
        fontSize: 12
    },
    itemDate: {
        color: '#9CA3AF',
        fontSize: 12
    }
});