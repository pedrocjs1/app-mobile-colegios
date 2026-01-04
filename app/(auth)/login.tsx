import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    TextInput,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    ScrollView
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuthStore } from '../../store/useAuthStore';
import { useRouter } from 'expo-router';
import { GraduationCap, Mail, Lock, AlertCircle } from 'lucide-react-native';

export default function LoginScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const loginWithEmail = useAuthStore((state) => state.loginWithEmail);
    const isLoading = useAuthStore((state) => state.isLoading);
    const error = useAuthStore((state) => state.error);
    const clearError = useAuthStore((state) => state.clearError);
    const router = useRouter();
    const user = useAuthStore((state) => state.user);

    /**
     * Lógica de navegación basada en roles.
     * Se activa automáticamente cuando el estado 'user' cambia en el Store.
     */
    // Dentro de login.tsx, cambia el useEffect por este:
    useEffect(() => {
        if (user) {
            console.log("✅ Usuario logueado con rol:", user.role); // LOG DE GUERRA

            const userRole = user.role as string;

            if (userRole === 'rector') {
                router.replace('/rector'); // Sin (dashboard)
            } else if (userRole === 'docente') {
                router.replace('/teacher'); // Sin (dashboard)
            } else if (userRole === 'tutor') {
                router.replace('/tutor'); // Sin (dashboard)
            }
        }
    }, [user]);

    const handleLogin = async () => {
        if (password.length < 6) {
            alert('La contraseña es muy corta');
            return;
        }
        if (!email || !password) return;

        clearError();
        // Limpiamos espacios y convertimos a minúsculas para evitar errores de tipeo
        const success = await loginWithEmail(email.trim().toLowerCase(), password);

        if (!success) {
            // El error se maneja automáticamente a través del Store y se muestra en la UI
            console.log("Login fallido");
        }
    };
    console.log("Render login!", { email, password, isLoading });
    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={{ flex: 1 }}
        >
            <ScrollView
                style={{ flex: 1 }}
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled"
            >
                <View style={styles.container}>
                    <View style={styles.topDecoration} />

                    <View style={styles.content}>
                        {/* Logo Premium */}
                        <View style={styles.logoContainer}>
                            <View style={styles.logoCircle}>
                                <GraduationCap size={50} color="white" />
                            </View>
                        </View>

                        <Text style={styles.title}>EduConnect</Text>
                        <Text style={styles.subtitle}>Gestión académica marca blanca</Text>

                        {/* Login Form */}
                        <View style={styles.formContainer}>
                            <Text style={styles.formTitle}>Iniciar Sesión</Text>

                            {/* Error Message */}
                            {error && (
                                <View style={styles.errorContainer}>
                                    <AlertCircle size={20} color="#EF4444" />
                                    <Text style={styles.errorText}>{error}</Text>
                                </View>
                            )}

                            {/* Email Input */}
                            <View style={styles.inputContainer}>
                                <View style={styles.inputIcon}>
                                    <Mail size={20} color="#6B7280" />
                                </View>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Email"
                                    placeholderTextColor="#9CA3AF"
                                    value={email}
                                    onChangeText={setEmail}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    autoCorrect={false}
                                    editable={!isLoading}
                                />
                            </View>

                            {/* Password Input */}
                            <View style={styles.inputContainer}>
                                <View style={styles.inputIcon}>
                                    <Lock size={20} color="#6B7280" />
                                </View>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Contraseña"
                                    placeholderTextColor="#9CA3AF"
                                    value={password}
                                    onChangeText={setPassword}
                                    secureTextEntry={!showPassword}
                                    autoCapitalize="none"
                                    autoCorrect={false}
                                    editable={!isLoading}
                                />
                                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                                    <Text style={{ color: '#6366F1', fontWeight: '600' }}>
                                        {showPassword ? 'Ocultar' : 'Mostrar'}
                                    </Text>
                                </TouchableOpacity>
                            </View>

                            <TouchableOpacity
                                style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 15 }}
                                onPress={() => setRememberMe(!rememberMe)}
                            >
                                <View
                                    style={{
                                        width: 20,
                                        height: 20,
                                        borderRadius: 6,
                                        borderWidth: 2,
                                        borderColor: '#6366F1',
                                        backgroundColor: rememberMe ? '#6366F1' : 'transparent',
                                        marginRight: 10
                                    }}
                                />
                                <Text style={{ color: '#374151', fontSize: 14 }}>
                                    Recordarme
                                </Text>
                            </TouchableOpacity>

                            {/* Login Button */}
                            <TouchableOpacity
                                style={[styles.loginButton, (isLoading || !email || !password) && styles.loginButtonDisabled]}
                                onPress={handleLogin}
                                disabled={isLoading || !email || !password}
                                activeOpacity={0.8}
                            >
                                {isLoading ? (
                                    <ActivityIndicator color="white" />
                                ) : (
                                    <Text style={styles.loginButtonText}>Ingresar</Text>
                                )}
                            </TouchableOpacity>

                            {/* Demo Credentials Helper */}
                            <View style={styles.demoContainer}>
                                <Text style={styles.demoTitle}>Prueba de Roles (Violet Wave):</Text>
                                <Text style={styles.demoText}>
                                    📧 rodriguez@sanmartin.edu.ar (Rector){'\n'}
                                    📧 pedrovega4680@gmail.com (Docente){'\n'}
                                    📧 gomez@example.com (Tutor)
                                </Text>
                            </View>
                        </View>
                    </View>

                    <Text style={styles.footerText}>Violet Wave EDU v2.1.0</Text>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    scrollContent: { flexGrow: 1 },
    container: { flex: 1, backgroundColor: '#F9FAFB', alignItems: 'center', minHeight: '100%' },
    topDecoration: { position: 'absolute', top: -100, width: 600, height: 400, borderRadius: 200, backgroundColor: '#6366F1', opacity: 0.1 },
    content: { flex: 1, width: '100%', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 30, paddingTop: 60 },
    logoContainer: { marginBottom: 20 },
    logoCircle: { width: 100, height: 100, borderRadius: 35, backgroundColor: '#6366F1', alignItems: 'center', justifyContent: 'center', elevation: 10 },
    title: { fontSize: 32, fontWeight: '900', color: '#1F2937', letterSpacing: -1 },
    subtitle: { fontSize: 16, color: '#6B7280', marginBottom: 40, textAlign: 'center' },
    formContainer: { width: '100%', backgroundColor: 'white', borderRadius: 35, padding: 25, elevation: 5 },
    formTitle: { fontSize: 20, fontWeight: 'bold', color: '#1F2937', marginBottom: 20, textAlign: 'center' },
    errorContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FEE2E2', padding: 12, borderRadius: 15, marginBottom: 15, gap: 8 },
    errorText: { flex: 1, color: '#DC2626', fontSize: 13, fontWeight: '600' },
    inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F9FAFB', borderRadius: 20, marginBottom: 15, paddingHorizontal: 15, borderWidth: 2, borderColor: '#E5E7EB' },
    inputIcon: { marginRight: 10 },
    input: { flex: 1, paddingVertical: 15, fontSize: 16, color: '#1F2937' },
    loginButton: { backgroundColor: '#6366F1', paddingVertical: 16, borderRadius: 20, alignItems: 'center', marginTop: 10, elevation: 5 },
    loginButtonDisabled: { backgroundColor: '#9CA3AF' },
    loginButtonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
    demoContainer: { marginTop: 20, padding: 15, backgroundColor: '#EEF2FF', borderRadius: 15, borderLeftWidth: 4, borderLeftColor: '#6366F1' },
    demoTitle: { fontSize: 11, fontWeight: 'bold', color: '#4338CA', marginBottom: 5, textTransform: 'uppercase' },
    demoText: { fontSize: 11, color: '#4338CA', lineHeight: 16 },
    footerText: { marginTop: 20, marginBottom: 30, color: '#9CA3AF', fontSize: 12, fontWeight: '600' },
});