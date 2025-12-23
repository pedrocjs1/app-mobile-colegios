import React from 'react';
import { Stack } from 'expo-router';

export default function DashboardLayout() {
    return (
        <Stack screenOptions={{ headerShown: false, animation: 'fade' }}>
            <Stack.Screen name="rector" />
            <Stack.Screen name="teacher" />

            {/* Sincronizado con la ruta real tutor/index.tsx */}
            <Stack.Screen name="tutor/index" />

            <Stack.Screen name="ajustes" />
            <Stack.Screen name="avisos" />
            <Stack.Screen name="hijos" />
        </Stack>
    );
}