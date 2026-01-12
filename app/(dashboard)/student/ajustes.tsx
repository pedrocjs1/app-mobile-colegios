import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert } from 'react-native';
import { useAuthStore } from '../../../store/useAuthStore';
import { useTheme } from '../../../hooks/useTheme';
import { useRouter } from 'expo-router';
import { User, Bell, Shield, LogOut, ChevronRight, HelpCircle } from 'lucide-react-native';

export default function StudentAjustes() {
    const theme = useTheme();
    const user = useAuthStore((state) => state.user);
    const logout = useAuthStore((state) => state.logout);
    const router = useRouter();

    const handleLogout = () => {
        Alert.alert("Cerrar Sesión", "¿Estás seguro?", [
            { text: "Cancelar", style: "cancel" },
            {
                text: "Salir", style: "destructive", onPress: async () => {
                    await logout();
                    router.replace('/(auth)/login');
                }
            }
        ]);
    };

    return (
        <View style={styles.container}>
            <View style={[styles.header, { backgroundColor: theme.primary }]}>
                <Text style={styles.headerTitle}>Mi Perfil</Text>
            </View>
            <View style={styles.profileSection}>
                <Image source={{ uri: `https://ui-avatars.com/api/?name=${user?.name}&background=6366f1&color=fff&size=128` }} style={styles.avatar} />
                <Text style={styles.userName}>{user?.name}</Text>
                <Text style={styles.userEmail}>{user?.email}</Text>
            </View>
            <View style={styles.menuContainer}>
                <TouchableOpacity style={styles.menuItem}>
                    <View style={styles.iconWrapper}><Bell size={20} color="#4B5563" /></View>
                    <Text style={styles.menuLabel}>Notificaciones</Text>
                    <ChevronRight size={18} color="#D1D5DB" />
                </TouchableOpacity>
                <TouchableOpacity onPress={handleLogout} style={[styles.menuItem, { marginTop: 20 }]}>
                    <View style={[styles.iconWrapper, { backgroundColor: '#FEE2E2' }]}><LogOut size={20} color="#EF4444" /></View>
                    <Text style={[styles.menuLabel, { color: '#EF4444' }]}>Cerrar Sesión</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F0F2F5' },
    header: { paddingTop: 60, paddingBottom: 20, paddingHorizontal: 25 },
    headerTitle: { color: 'white', fontSize: 24, fontWeight: '900' },
    profileSection: { alignItems: 'center', marginTop: 20, marginBottom: 30 },
    avatar: { width: 100, height: 100, borderRadius: 35, borderWidth: 4, borderColor: 'white' },
    userName: { fontSize: 20, fontWeight: 'bold', color: '#1F2937', marginTop: 15 },
    userEmail: { fontSize: 14, color: '#6B7280', marginTop: 4 },
    menuContainer: { paddingHorizontal: 20 },
    menuItem: { backgroundColor: 'white', flexDirection: 'row', alignItems: 'center', padding: 18, borderRadius: 20, marginBottom: 10, elevation: 1 },
    iconWrapper: { backgroundColor: '#F3F4F6', padding: 10, borderRadius: 12, marginRight: 15 },
    menuLabel: { flex: 1, fontSize: 15, fontWeight: '700', color: '#374151' }
});