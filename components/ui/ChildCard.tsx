import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';

interface ChildCardProps {
    name: string;
    absences: number;
    avatarUrl?: string;
}

export const ChildCard: React.FC<ChildCardProps & { onPress?: () => void }> = ({ name, absences, avatarUrl, onPress }) => {
    return (
        <TouchableOpacity
            onPress={onPress}
            activeOpacity={0.7}
            className="bg-white rounded-xl p-4 m-2 shadow-sm border border-gray-100 items-center w-[45%]"
        >
            <View className="h-16 w-16 rounded-full bg-gray-200 overflow-hidden mb-3">
                {avatarUrl ? (
                    <Image
                        source={{ uri: avatarUrl }}
                        className="h-full w-full"
                        resizeMode="cover"
                    />
                ) : (
                    <View className="h-full w-full items-center justify-center bg-gray-300">
                        <Text className="text-2xl text-gray-500">{name.charAt(0)}</Text>
                    </View>
                )}
            </View>
            <Text className="text-gray-900 font-semibold text-base mb-1 text-center">{name}</Text>
            <Text className="text-gray-500 text-sm">{absences} Absences</Text>
        </TouchableOpacity>
    );
};
