import React from 'react';
import { Tabs } from 'expo-router';
import { Home, Users, Bell, Settings } from 'lucide-react-native';
import { useTheme } from '../../hooks/useTheme';

export default function DashboardLayout() {
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
                    borderTopWidth: 1,
                    borderTopColor: '#F3F4F6',
                    elevation: 10,
                    shadowColor: '#000',
                    shadowOpacity: 0.05,
                    shadowRadius: 10,
                },
                tabBarLabelStyle: {
                    fontSize: 12,
                    fontWeight: '600',
                }
            }}
        >
            <Tabs.Screen
                name="tutor/index"
                options={{
                    title: 'Inicio',
                    tabBarIcon: ({ color }) => <Home size={24} color={color} />,
                }}
            />
            <Tabs.Screen
                name="hijos"
                options={{
                    title: 'Hijos',
                    tabBarIcon: ({ color }) => <Users size={24} color={color} />,
                }}
            />
            <Tabs.Screen
                name="avisos"
                options={{
                    title: 'Avisos',
                    tabBarIcon: ({ color }) => <Bell size={24} color={color} />,
                }}
            />
            <Tabs.Screen
                name="ajustes"
                options={{
                    title: 'Perfil',
                    tabBarIcon: ({ color }) => <Settings size={24} color={color} />,
                }}
            />
            {/* ESTA OPCIÓN OCULTA EL TAB DE DETALLE DE HIJOS */}
            <Tabs.Screen
                name="hijos/[id]"
                options={{
                    href: null, // <--- Esto hace que NO aparezca en la barra
                }}
            />
        </Tabs>
    );
}