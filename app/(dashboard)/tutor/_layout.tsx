import React from 'react';
import { Tabs } from 'expo-router';
import { Home, Bell, Users, Settings } from 'lucide-react-native';
import { useTheme } from '../../../hooks/useTheme';

export default function TutorLayout() {
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
                    borderTopWidth: 0,
                    elevation: 15,
                    shadowColor: '#000',
                    shadowOpacity: 0.1,
                },
                tabBarLabelStyle: {
                    fontSize: 12,
                    fontWeight: '700',
                }
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Inicio',
                    tabBarIcon: ({ color }) => <Home size={24} color={color} />,
                }}
            />
            <Tabs.Screen
                name="notificaciones"
                options={{
                    title: 'Avisos',
                    tabBarIcon: ({ color }) => <Bell size={24} color={color} />,
                }}
            />
            <Tabs.Screen
                name="hijos"
                options={{
                    title: 'Mis Hijos',
                    tabBarIcon: ({ color }) => <Users size={24} color={color} />,
                }}
            />
            <Tabs.Screen
                name="ajustes"
                options={{
                    title: 'Ajustes',
                    tabBarIcon: ({ color }) => <Settings size={24} color={color} />,
                }}
            />
        </Tabs>
    );
}
