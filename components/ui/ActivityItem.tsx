import React from 'react';
import { View, Text } from 'react-native';
import { LucideIcon } from 'lucide-react-native';

interface ActivityItemProps {
    title: string;
    subtitle: string;
    icon: LucideIcon;
    iconColor: string;
    iconBgColor?: string;
}

export const ActivityItem: React.FC<ActivityItemProps> = ({
    title,
    subtitle,
    icon: Icon,
    iconColor,
    iconBgColor = 'bg-gray-100'
}) => {
    return (
        <View className="flex-row items-center p-3 mb-2 bg-white rounded-lg border border-gray-50">
            <View className={`h-10 w-10 rounded-full items-center justify-center mr-3 ${iconBgColor}`}>
                <Icon size={20} color={iconColor} />
            </View>
            <View className="flex-1">
                <Text className="text-gray-900 font-medium text-base">{title}</Text>
                <Text className="text-gray-500 text-sm">{subtitle}</Text>
            </View>
        </View>
    );
};
