import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Dimensions } from 'react-native';
import { useAuthStore } from '../../store/useAuthStore';
import { useRouter } from 'expo-router';
import { GraduationCap, ArrowRight } from 'lucide-react-native';

const { width } = Dimensions.get('window');

export default function LoginScreen() {
    const login = useAuthStore((state) => state.login);
    const router = useRouter();

    const handleDemoLogin = (schoolId: string, schoolName: string) => {
        login({
            id: 'demo-user-1',
            name: schoolId === 'school_A' ? 'Flia. Gomez' : 'Flia. Perez',
            email: 'demo@example.com',
            role: 'tutor',
            school_id: schoolId,
            avatar_url: 'https://i.pravatar.cc/150?img=32',
        });
        // Navegación inmediata al dashboard
        router.replace('/(dashboard)/tutor');
    };

    return (
        <View style={styles.container}>
            <View style={styles.topDecoration} />

            <View style={styles.content}>
                {/* Logo Placeholder - Estilo Moderno */}
                <View style={styles.logoContainer}>
                    <View style={styles.logoCircle}>
                        <GraduationCap size={50} color="white" />
                    </View>
                </View>

                <Text style={styles.title}>EduConnect</Text>
                <Text style={styles.subtitle}>Gestión académica para familias</Text>

                <View style={styles.cardContainer}>
                    <Text style={styles.sectionTitle}>Acceso de demostración</Text>

                    {/* Botón Demo A */}
                    <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={() => handleDemoLogin('school_A', 'Academy Alpha')}
                        style={[styles.loginButton, { borderColor: '#6366F1' }]}
                    >
                        <View style={styles.buttonContent}>
                            <View style={[styles.miniIcon, { backgroundColor: '#6366F1' }]} />
                            <View style={{ flex: 1 }}>
                                <Text style={styles.buttonText}>Academy Alpha</Text>
                                <Text style={styles.buttonSubText}>Flia. Gomez</Text>
                            </View>
                            <ArrowRight size={20} color="#6366F1" />
                        </View>
                    </TouchableOpacity>

                    {/* Botón Demo B */}
                    <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={() => handleDemoLogin('school_B', 'Greenwood High')}
                        style={[styles.loginButton, { borderColor: '#10B981' }]}
                    >
                        <View style={styles.buttonContent}>
                            <View style={[styles.miniIcon, { backgroundColor: '#10B981' }]} />
                            <View style={{ flex: 1 }}>
                                <Text style={styles.buttonText}>Greenwood High</Text>
                                <Text style={styles.buttonSubText}>Flia. Perez</Text>
                            </View>
                            <ArrowRight size={20} color="#10B981" />
                        </View>
                    </TouchableOpacity>
                </View>
            </View>

            <Text style={styles.footerText}>Violet Wave v1.0.0</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB',
        alignItems: 'center',
    },
    topDecoration: {
        position: 'absolute',
        top: -100,
        width: width * 1.5,
        height: 400,
        borderRadius: 200,
        backgroundColor: '#6366F1',
        opacity: 0.1,
    },
    content: {
        flex: 1,
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 30,
    },
    logoContainer: {
        marginBottom: 20,
    },
    logoCircle: {
        width: 100,
        height: 100,
        borderRadius: 35,
        backgroundColor: '#6366F1',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#6366F1',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 10,
    },
    title: {
        fontSize: 32,
        fontWeight: '900',
        color: '#1F2937',
        letterSpacing: -1,
    },
    subtitle: {
        fontSize: 16,
        color: '#6B7280',
        marginBottom: 40,
        textAlign: 'center',
    },
    cardContainer: {
        width: '100%',
        backgroundColor: 'white',
        borderRadius: 35,
        padding: 25,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 15,
        elevation: 5,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#9CA3AF',
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 20,
        textAlign: 'center',
    },
    loginButton: {
        width: '100%',
        backgroundColor: 'white',
        borderWidth: 2,
        borderRadius: 20,
        padding: 15,
        marginBottom: 15,
    },
    buttonContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    miniIcon: {
        width: 10,
        height: 10,
        borderRadius: 5,
        marginRight: 15,
    },
    buttonText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1F2937',
    },
    buttonSubText: {
        fontSize: 13,
        color: '#6B7280',
    },
    footerText: {
        marginBottom: 30,
        color: '#9CA3AF',
        fontSize: 12,
        fontWeight: '600',
    },
});