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
import { Radio } from '../../components/ui/Radio';

export default function LoginScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);

    const loginWithEmail = useAuthStore((state) => state.loginWithEmail);
    const isLoading = useAuthStore((state) => state.isLoading);
    const error = useAuthStore((state) => state.error);
    const clearError = useAuthStore((state) => state.clearError);
    const user = useAuthStore((state) => state.user);
    const router = useRouter();

    useEffect(() => {
        if (user) {
            console.log("✅ Redirigiendo usuario con rol:", user.role);
            const userRole = user.role as string;

            if (userRole === 'rector') {
                router.replace('/rector');
            } else if (userRole === 'docente') {
                router.replace('/teacher');
            } else if (userRole === 'tutor') {
                router.replace('/tutor');
            } else if (userRole === 'student') {
                router.replace('/student'); // 🚀 Va a la carpeta dashboard/student
            }
        }
    }, [user]);

    useEffect(() => {
        const loadRememberedEmail = async () => {
            const savedEmail = await AsyncStorage.getItem('rememberedEmail');
            if (savedEmail) {
                setEmail(savedEmail);
                setRememberMe(true);
            }
        };
        loadRememberedEmail();
    }, []);

    const handleLogin = async () => {
        clearError();
        if (password.length < 6) {
            useAuthStore.setState({ error: 'Contraseña demasiado corta' });
            return;
        }
        if (rememberMe) {
            await AsyncStorage.setItem('rememberedEmail', email.trim().toLowerCase());
        } else {
            await AsyncStorage.removeItem('rememberedEmail');
        }
        await loginWithEmail(email.trim().toLowerCase(), password);
    };

    return (
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
            <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
                <View style={styles.container}>
                    <View style={styles.topDecoration} />
                    <View style={styles.content}>
                        <View style={styles.logoContainer}>
                            <View style={styles.logoCircle}>
                                <GraduationCap size={50} color="white" />
                            </View>
                        </View>
                        <Text style={styles.title}>EduConnect</Text>
                        <View style={styles.formContainer}>
                            <Text style={styles.formTitle}>Iniciar Sesión</Text>
                            {error && (
                                <View style={styles.errorContainer}>
                                    <AlertCircle size={20} color="#EF4444" />
                                    <Text style={styles.errorText}>{error}</Text>
                                </View>
                            )}
                            <View style={styles.inputContainer}>
                                <Mail size={20} color="#6B7280" />
                                <TextInput style={styles.input} placeholder="Email" value={email} onChangeText={setEmail} autoCapitalize="none" />
                            </View>
                            <View style={styles.inputContainer}>
                                <Lock size={20} color="#6B7280" />
                                <TextInput style={styles.input} placeholder="Contraseña" value={password} onChangeText={setPassword} secureTextEntry={!showPassword} />
                                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                                    <Text style={{ color: '#6366F1', fontWeight: '600' }}>{showPassword ? 'Ocultar' : 'Mostrar'}</Text>
                                </TouchableOpacity>
                            </View>
                            <TouchableOpacity style={styles.rememberContainer} onPress={() => setRememberMe(!rememberMe)}>
                                <Radio checked={rememberMe} onPress={() => setRememberMe(!rememberMe)} />
                                <Text style={styles.rememberText}>Recordarme</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.loginButton, isLoading && styles.loginButtonDisabled]} onPress={handleLogin} disabled={isLoading}>
                                {isLoading ? <ActivityIndicator color="white" /> : <Text style={styles.loginButtonText}>Ingresar</Text>}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    scrollContent: { flexGrow: 1 },
    container: { flex: 1, backgroundColor: '#F9FAFB', minHeight: '100%' },
    topDecoration: { position: 'absolute', top: -100, width: 600, height: 400, borderRadius: 200, backgroundColor: '#6366F1', opacity: 0.1 },
    content: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 30 },
    logoContainer: { marginBottom: 20 },
    logoCircle: { width: 100, height: 100, borderRadius: 35, backgroundColor: '#6366F1', alignItems: 'center', justifyContent: 'center', elevation: 10 },
    title: { fontSize: 32, fontWeight: '900', color: '#1F2937', marginBottom: 20 },
    formContainer: { width: '100%', backgroundColor: 'white', borderRadius: 35, padding: 25, elevation: 5 },
    formTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
    inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F9FAFB', borderRadius: 20, marginBottom: 15, paddingHorizontal: 15, borderWidth: 2, borderColor: '#E5E7EB' },
    input: { flex: 1, paddingVertical: 15, marginLeft: 10 },
    loginButton: { backgroundColor: '#6366F1', paddingVertical: 16, borderRadius: 20, alignItems: 'center', marginTop: 10 },
    loginButtonDisabled: { backgroundColor: '#9CA3AF' },
    loginButtonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
    rememberContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
    rememberText: { marginLeft: 10, color: '#374151' },
    errorContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FEE2E2', padding: 12, borderRadius: 15, marginBottom: 15 },
    errorText: { color: '#DC2626', marginLeft: 8, fontWeight: '600' }
});