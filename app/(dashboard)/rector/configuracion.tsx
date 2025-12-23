import React, { useState, useEffect } from 'react';
import {
    View, Text, ScrollView, TouchableOpacity, StyleSheet,
    Alert, ActivityIndicator, Image
} from 'react-native';
import { useAuthStore } from '../../../store/useAuthStore';
import { useTheme } from '../../../hooks/useTheme';
import { useRouter } from 'expo-router';
import {
    Building2, Mail, Phone, MapPin, Palette,
    LogOut, ShieldCheck
} from 'lucide-react-native';
import { getInstitution } from '../../../services/databaseService';

export default function ConfiguracionScreen() {
    const theme = useTheme();
    const { user, logout } = useAuthStore();
    const router = useRouter();

    const [institution, setInstitution] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadData() {
            if (user?.school_id) {
                try {
                    const data = await getInstitution(user.school_id);
                    setInstitution(data);
                } catch (error) {
                    console.error("Error al cargar institución:", error);
                }
            }
            setLoading(false);
        }
        loadData();
    }, [user?.school_id]);

    const handleLogout = () => {
        Alert.alert(
            "Cerrar Sesión",
            "¿Estás seguro de que quieres salir de Violet Wave?",
            [
                { text: "Cancelar", style: "cancel" },
                {
                    text: "Salir",
                    style: "destructive",
                    onPress: async () => {
                        // El RootLayout detectará el cambio de estado y redirigirá solo.
                        await logout();
                    }
                }
            ]
        );
    };

    if (loading) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color={theme.primary} />
            </View>
        );
    }

    return (
        <View style={{ flex: 1, backgroundColor: '#F0F2F5' }}>
            <View style={[styles.header, { backgroundColor: theme.primary }]}>
                <Text style={styles.headerTitle}>Configuración</Text>
            </View>

            <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
                {/* MI PERFIL */}
                <View style={styles.section}>
                    <Text style={styles.sectionLabel}>Mi Perfil</Text>
                    <View style={styles.profileCard}>
                        <Image
                            source={{ uri: user?.avatar_url || `https://ui-avatars.com/api/?name=${user?.name}&background=6366f1&color=fff` }}
                            style={styles.avatar}
                        />
                        <View style={{ flex: 1 }}>
                            <Text style={styles.profileName}>{user?.name || 'Usuario'}</Text>
                            <View style={styles.roleBadge}>
                                <ShieldCheck size={12} color={theme.primary} />
                                <Text style={[styles.roleText, { color: theme.primary }]}>RECTORÍA</Text>
                            </View>
                            <Text style={styles.profileEmail}>{user?.email}</Text>
                        </View>
                    </View>
                </View>

                {/* INFO INSTITUCIONAL */}
                <View style={styles.section}>
                    <Text style={styles.sectionLabel}>Información Institucional</Text>
                    <View style={styles.card}>
                        <View style={styles.item}>
                            <Building2 size={20} color="#94A3B8" style={styles.icon} />
                            <View>
                                <Text style={styles.itemLabel}>Nombre</Text>
                                <Text style={styles.itemValue}>{institution?.name || 'No disponible'}</Text>
                            </View>
                        </View>
                        <View style={styles.item}>
                            <MapPin size={20} color="#94A3B8" style={styles.icon} />
                            <View>
                                <Text style={styles.itemLabel}>Dirección</Text>
                                <Text style={styles.itemValue}>{institution?.address || 'No disponible'}</Text>
                            </View>
                        </View>
                        <View style={[styles.item, { borderBottomWidth: 0 }]}>
                            <Phone size={20} color="#94A3B8" style={styles.icon} />
                            <View>
                                <Text style={styles.itemLabel}>Teléfono</Text>
                                <Text style={styles.itemValue}>{institution?.phone || 'No disponible'}</Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* BOTÓN CERRAR SESIÓN */}
                <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                    <LogOut size={20} color="#EF4444" />
                    <Text style={styles.logoutText}>Cerrar Sesión</Text>
                </TouchableOpacity>

                <Text style={styles.versionText}>Violet Wave EDU v2.1.0</Text>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: { paddingTop: 60, paddingBottom: 25, paddingHorizontal: 25, borderBottomLeftRadius: 35, borderBottomRightRadius: 35 },
    headerTitle: { color: 'white', fontSize: 22, fontWeight: '900' },
    section: { marginTop: 25, paddingHorizontal: 20 },
    sectionLabel: { fontSize: 11, fontWeight: '800', color: '#64748B', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1 },
    card: { backgroundColor: 'white', borderRadius: 25, padding: 15, elevation: 2 },
    profileCard: { backgroundColor: 'white', borderRadius: 25, padding: 20, flexDirection: 'row', alignItems: 'center', elevation: 3 },
    avatar: { width: 70, height: 70, borderRadius: 25, marginRight: 20 },
    profileName: { fontSize: 18, fontWeight: '900', color: '#1E293B' },
    roleBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F1F5F9', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10, alignSelf: 'flex-start', marginVertical: 4, gap: 5 },
    roleText: { fontSize: 10, fontWeight: '900' },
    profileEmail: { fontSize: 13, color: '#64748B' },
    item: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
    icon: { marginRight: 15 },
    itemLabel: { fontSize: 11, color: '#94A3B8', fontWeight: '700' },
    itemValue: { fontSize: 14, color: '#1E293B', fontWeight: '600' },
    logoutButton: { marginHorizontal: 20, marginTop: 40, backgroundColor: '#FEE2E2', paddingVertical: 18, borderRadius: 20, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10 },
    logoutText: { color: '#EF4444', fontWeight: '900', fontSize: 16 },
    versionText: { textAlign: 'center', marginTop: 30, color: '#CBD5E1', fontSize: 12, fontWeight: '600' }
});