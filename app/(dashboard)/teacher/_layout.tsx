import React from 'react';
import { Tabs } from 'expo-router';
import { Home, Users, Bell, User } from 'lucide-react-native';
import { useTheme } from '../../../hooks/useTheme';

/**
 * Layout de pestañas exclusivo para el Docente.
 * Mantiene la estética de Violet Wave con navegación independiente.
 */
export default function TeacherLayout() {
    const theme = useTheme();

    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: theme.primary,
                tabBarInactiveTintColor: '#94A3B8',
                tabBarStyle: {
                    height: 85,
                    paddingBottom: 25,
                    paddingTop: 10,
                    backgroundColor: '#FFFFFF',
                    borderTopLeftRadius: 30,
                    borderTopRightRadius: 30,
                    position: 'absolute', // Esto hace que flote sobre el contenido
                    borderTopWidth: 0,
                    elevation: 20,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: -4 },
                    shadowOpacity: 0.1,
                    shadowRadius: 10,
                },
                tabBarLabelStyle: {
                    fontSize: 12,
                    fontWeight: '700',
                }
            }}
        >
            {/* 1. Dashboard Principal */}
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Inicio',
                    tabBarIcon: ({ color }) => <Home size={24} color={color} />,
                }}
            />

            {/* NOTA PARA EL FUTURO:
               Cuando crees los archivos 'alumnos.tsx', 'avisos.tsx' o 'perfil.tsx'
               en esta misma carpeta, Expo Router los reconocerá automáticamente.
               
               Si quieres ocultar una pestaña que no tiene archivo todavía, 
               simplemente no la declares aquí.
            */}

            {/* Ejemplo de cómo declarar una pestaña adicional cuando el archivo exista:
            <Tabs.Screen
                name="alumnos"
                options={{
                    title: 'Mis Alumnos',
                    tabBarIcon: ({ color }) => <Users size={24} color={color} />,
                }}
            /> 
            */}
        </Tabs>
    );
}