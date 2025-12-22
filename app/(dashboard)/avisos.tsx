import React from 'react';
import { View, Text } from 'react-native';
import { useTheme } from '../../hooks/useTheme';

export default function AvisosScreen() {
    const theme = useTheme();
    return (
        <View className="flex-1 items-center justify-center bg-gray-50">
            <Text className="text-xl font-bold text-gray-800">Avisos</Text>
            <Text className="text-gray-500 mt-2">Próximamente</Text>
        </View>
    );
}
