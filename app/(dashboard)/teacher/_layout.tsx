import React from 'react';
import { Tabs } from 'expo-router';
import { Home, Users, MessageSquare, User } from 'lucide-react-native';
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
                    position: 'absolute',
                    elevation: 15,
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
            {/* Pantalla Principal del Docente */}
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Inicio',
                    tabBarIcon: ({ color }) => <Home size={24} color={color} />,
                }}
            />

            {/* NOTA DE VIOLET WAVE: 
                Hemos ocultado las pestañas 'alumnos', 'mensajes' y 'perfil' 
                porque aún no existen sus archivos .tsx. 
                Esto limpia los errores de "extraneous route" en tu consola.
            */}
        </Tabs>
    );
}