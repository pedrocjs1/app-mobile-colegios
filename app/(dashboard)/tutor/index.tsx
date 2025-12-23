import React from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useAuthStore } from '../../../store/useAuthStore';
import { useTheme } from '../../../hooks/useTheme';
import { Bell, AlertCircle, LogOut } from 'lucide-react-native';
import { useRouter } from 'expo-router';

export default function TutorDashboard() {
    const theme = useTheme();
    const { user, logout } = useAuthStore();
    const router = useRouter();

    const handleLogout = () => {
        Alert.alert("Cerrar Sesión", "¿Deseas salir de la cuenta de tutor?", [
            { text: "Cancelar", style: "cancel" },
            {
                text: "Salir",
                style: "destructive",
                onPress: async () => {
                    await logout();
                    router.replace('/login');
                }
            }
        ]);
    };

    return (
        <ScrollView style={{ flex: 1, backgroundColor: '#F0F2F5' }}>
            {/* Header con Botón de Salida */}
            <View style={[styles.header, { backgroundColor: theme.primary }]}>
                <View style={styles.headerTop}>
                    <View style={styles.profileBox}>
                        <Image
                            source={{ uri: user?.avatar_url || 'https://i.pravatar.cc/150?img=32' }}
                            style={styles.avatar}
                        />
                        <View>
                            <Text style={styles.welcomeText}>
                                Flia. {user?.name.split(' ')[1] || 'Pedro'}
                            </Text>
                            <Text style={styles.subText}>Panel de Familia</Text>
                        </View>
                    </View>

                    <View style={{ flexDirection: 'row', gap: 10 }}>
                        <TouchableOpacity style={styles.notifBtn} onPress={handleLogout}>
                            <LogOut size={22} color="white" />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.notifBtn}>
                            <Bell size={22} color="white" />
                        </TouchableOpacity>
                    </View>
                </View>
            </View>

            <View style={{ padding: 20 }}>
                <Text style={styles.sectionTitle}>Estado de los Alumnos</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <View style={[styles.statusCard, { backgroundColor: '#6366F1' }]}>
                        <Image source={{ uri: 'https://i.pravatar.cc/150?img=12' }} style={styles.miniAvatar} />
                        <Text style={styles.statusNumber}>1</Text>
                        <View style={styles.statusLabel}><Text style={styles.statusLabelText}>Juan Gómez</Text></View>
                    </View>
                </ScrollView>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    header: { paddingTop: 60, paddingBottom: 30, paddingHorizontal: 20, borderBottomLeftRadius: 35, borderBottomRightRadius: 35 },
    headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    profileBox: { flexDirection: 'row', alignItems: 'center' },
    avatar: { width: 50, height: 50, borderRadius: 15, marginRight: 12, borderWidth: 2, borderColor: 'white' },
    welcomeText: { color: 'white', fontSize: 20, fontWeight: 'bold' },
    subText: { color: 'rgba(255,255,255,0.8)', fontSize: 14 },
    notifBtn: { backgroundColor: 'rgba(255,255,255,0.2)', padding: 10, borderRadius: 15 },
    sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#1F2937', marginBottom: 15 },
    statusCard: { width: 140, height: 160, borderRadius: 25, padding: 15, marginRight: 15, alignItems: 'center', justifyContent: 'space-between' },
    miniAvatar: { width: 45, height: 45, borderRadius: 15, borderWidth: 2, borderColor: 'white' },
    statusNumber: { fontSize: 32, fontWeight: 'bold', color: 'white' },
    statusLabel: { backgroundColor: 'rgba(255,255,255,0.9)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
    statusLabelText: { fontSize: 12, fontWeight: 'bold', color: '#1F2937' }
});