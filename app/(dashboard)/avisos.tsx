import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { Calendar, Megaphone, Info, ChevronRight, Bell } from 'lucide-react-native';

export default function AvisosScreen() {
    const theme = useTheme();

    // Mock de datos (Mañana esto vendrá de tu base de datos)
    const avisos = [
        {
            id: 1,
            titulo: 'Reunión de Padres',
            descripcion: 'Se convoca a los padres de 4to grado para tratar temas del viaje de fin de año.',
            fecha: '26 Dic',
            tipo: 'evento',
            icon: Calendar,
            color: '#6366F1' // Indigo
        },
        {
            id: 2,
            titulo: 'Acto de Fin de Año',
            descripcion: 'Los esperamos el próximo viernes a las 10:00hs en el salón principal.',
            fecha: '22 Dic',
            tipo: 'importante',
            icon: Megaphone,
            color: '#F59E0B' // Naranja
        },
        {
            id: 3,
            titulo: 'Comunicado General',
            descripcion: 'Recordamos que el uso del uniforme completo es obligatorio a partir de mañana.',
            fecha: '20 Dic',
            tipo: 'info',
            icon: Info,
            color: '#10B981' // Verde
        },
        {
            id: 4,
            titulo: 'Entrega de Informes',
            descripcion: 'Ya se encuentran disponibles los informes del tercer trimestre en secretaría.',
            fecha: '18 Dic',
            tipo: 'info',
            icon: Bell,
            color: theme.primary // Tu color principal
        }
    ];

    return (
        <View style={styles.container}>
            {/* Header consistente con "Mis Hijos" */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Avisos</Text>
                <Text style={styles.headerSubtitle}>Novedades del colegio</Text>
            </View>

            <ScrollView
                style={styles.scroll}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {avisos.map((aviso) => (
                    <TouchableOpacity key={aviso.id} style={styles.card}>
                        {/* Contenedor del Icono con fondo suave */}
                        <View style={[styles.iconContainer, { backgroundColor: aviso.color + '15' }]}>
                            <aviso.icon size={24} color={aviso.color} />
                        </View>

                        {/* Contenido del Aviso */}
                        <View style={styles.textContainer}>
                            <View style={styles.topRow}>
                                <Text style={styles.cardTitle}>{aviso.titulo}</Text>
                                <Text style={styles.cardDate}>{aviso.fecha}</Text>
                            </View>
                            <Text numberOfLines={2} style={styles.cardDescription}>
                                {aviso.descripcion}
                            </Text>
                        </View>

                        {/* Indicador lateral */}
                        <View style={styles.chevronContainer}>
                            <ChevronRight size={18} color="#9CA3AF" />
                        </View>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB', // Fondo gris muy claro
    },
    header: {
        paddingTop: 60,
        paddingBottom: 25,
        paddingHorizontal: 25,
        backgroundColor: 'white',
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    headerTitle: {
        fontSize: 30,
        fontWeight: 'bold',
        color: '#111827',
    },
    headerSubtitle: {
        fontSize: 14,
        color: '#6B7280',
        marginTop: 4,
    },
    scroll: {
        flex: 1,
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 100, // Espacio para que el último aviso no quede bajo los Tabs
    },
    card: {
        backgroundColor: 'white',
        borderRadius: 25,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
        // Sombras nativas
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 3,
        borderWidth: 1,
        borderColor: '#F3F4F6',
    },
    iconContainer: {
        width: 52,
        height: 52,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 15,
    },
    textContainer: {
        flex: 1,
    },
    topRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 4,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1F2937',
        flex: 1,
        marginRight: 8,
    },
    cardDate: {
        fontSize: 12,
        color: '#9CA3AF',
        fontWeight: '600',
    },
    cardDescription: {
        fontSize: 14,
        color: '#6B7280',
        lineHeight: 20,
    },
    chevronContainer: {
        marginLeft: 10,
        backgroundColor: '#F9FAFB',
        padding: 6,
        borderRadius: 10,
    }
});