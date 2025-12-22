import React from 'react';
import { Tabs } from 'expo-router';
import { Home, Users, Bell } from 'lucide-react-native';
import { useTheme } from '../../hooks/useTheme';

export default function DashboardLayout() {
    const theme = useTheme();
    return (
        <Tabs screenOptions={{
            headerShown: false,
            tabBarActiveTintColor: theme.primary,
            tabBarInactiveTintColor: '#94A3B8',
            tabBarStyle: { height: 70, paddingBottom: 12, paddingTop: 8, backgroundColor: '#FFFFFF', borderTopWidth: 1, borderTopColor: '#F3F4F6' }
        }}>
            <Tabs.Screen name="tutor/index" options={{ title: 'Inicio', tabBarIcon: ({ color }) => <Home size={26} color={color} /> }} />
            <Tabs.Screen name="hijos/index" options={{ title: 'Hijos', tabBarIcon: ({ color }) => <Users size={26} color={color} /> }} />
            <Tabs.Screen name="avisos" options={{ title: 'Avisos', tabBarIcon: ({ color }) => <Bell size={26} color={color} /> }} />
        </Tabs>
    );
}