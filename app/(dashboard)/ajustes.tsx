import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView } from 'react-native';
import { useAuthStore } from '../../store/useAuthStore';
import { useTheme } from '../../hooks/useTheme';
import { User, Bell, Shield, LogOut, ChevronRight } from 'lucide-react-native';

export default function AjustesScreen() {
    const { user, logout } = useAuthStore();
    const theme = useTheme();

    const SettingItem = ({ icon: Icon, title, color }: any) => (
        <TouchableOpacity style={styles.item}>
            <View style={[styles.iconBox, { backgroundColor: color + '15' }]}>
                <Icon size={20} color={color} />
            </View>
            <Text style={styles.itemText}>{title}</Text>
            <ChevronRight size={18} color="#9CA3AF" />
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            {/* Header Corregido */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Mi Perfil</Text>
            </View>

            <ScrollView contentContainerStyle={{ padding: 25 }}>
                {/* Tarjeta de Perfil */}
                <View style={styles.profileCard}>
                    <Image
                        source={{ uri: 'https://i.pravatar.cc/150?img=32' }}
                        style={styles.avatar}
                    />
                    <View>
                        <Text style={styles.userName}>{user?.name}</Text>
                        <Text style={styles.userEmail}>{user?.email}</Text>
                    </View>
                </View>

                {/* Sección de Opciones */}
                <View style={styles.section}>
                    <Text style={styles.sectionLabel}>Cuenta</Text>
                    <SettingItem icon={User} title="Datos Personales" color={theme.primary} />
                    <SettingItem icon={Bell} title="Notificaciones" color="#F59E0B" />
                    <SettingItem icon={Shield} title="Privacidad y Seguridad" color="#10B981" />
                </View>

                {/* Botón de Cerrar Sesión */}
                <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
                    <LogOut size={20} color="#EF4444" />
                    <Text style={styles.logoutText}>Cerrar Sesión</Text>
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB'
    },
    header: {
        paddingTop: 60,
        paddingBottom: 20,
        paddingHorizontal: 25, // ✅ Corregido: de 'px' a 'paddingHorizontal'
        backgroundColor: 'white',
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6'
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#111827'
    },
    profileCard: {
        backgroundColor: 'white',
        borderRadius: 25,
        padding: 20,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 30,
        elevation: 2,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 10
    },
    avatar: {
        width: 60,
        height: 60,
        borderRadius: 20,
        marginRight: 15
    },
    userName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1F2937'
    },
    userEmail: {
        color: '#6B7280',
        fontSize: 14
    },
    section: {
        marginBottom: 30
    },
    sectionLabel: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#9CA3AF',
        textTransform: 'uppercase',
        marginBottom: 15,
        letterSpacing: 1
    },
    item: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'white',
        padding: 15,
        borderRadius: 20,
        marginBottom: 10
    },
    iconBox: {
        padding: 10,
        borderRadius: 12,
        marginRight: 15
    },
    itemText: {
        flex: 1,
        fontSize: 16,
        color: '#1F2937',
        fontWeight: '500'
    },
    logoutBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 18,
        backgroundColor: '#FEE2E2',
        borderRadius: 20
    },
    logoutText: {
        color: '#EF4444',
        fontWeight: 'bold',
        fontSize: 16,
        marginLeft: 10
    }
});