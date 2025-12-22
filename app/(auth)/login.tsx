import React from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, Image } from 'react-native';
import { useAuthStore } from '../../store/useAuthStore';
import { useRouter } from 'expo-router';

export default function LoginScreen() {
    const login = useAuthStore((state) => state.login);
    const router = useRouter();

    const handleDemoLogin = (schoolId: string, schoolName: string) => {
        login({
            id: 'demo-user-1',
            name: schoolId === 'school_A' ? 'Flia. Gomez' : 'Flia. Perez',
            email: 'demo@example.com',
            role: 'tutor',
            school_id: schoolId,
            avatar_url: 'https://i.pravatar.cc/150?img=11',
        });
        // Navigation should ideally be handled by a layout listener or manually if needed
        // router.replace('/(dashboard)/tutor'); 
    };

    return (
        <SafeAreaView className="flex-1 bg-white">
            <View className="flex-1 justify-center items-center px-6">
                <View className="h-32 w-32 bg-gray-100 rounded-2xl mb-8 items-center justify-center">
                    <Text className="text-gray-400 font-bold">LOGO</Text>
                </View>

                <Text className="text-2xl font-bold text-gray-900 mb-2">Welcome Back</Text>
                <Text className="text-gray-500 mb-12 text-center">Sign in to access your child's academic dashboard</Text>

                <View className="w-full space-y-4">
                    <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={() => handleDemoLogin('school_A', 'Academy Alpha')}
                        className="w-full bg-[#FF2D55] p-4 rounded-xl items-center shadow-sm"
                    >
                        <Text className="text-white font-bold text-lg">Demo: Academy Alpha</Text>
                        <Text className="text-white/80 text-sm">Role: Tutor (Flia. Gomez)</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={() => handleDemoLogin('school_B', 'Greenwood High')}
                        className="w-full bg-[#34C759] p-4 rounded-xl items-center shadow-sm mt-4"
                    >
                        <Text className="text-white font-bold text-lg">Demo: Greenwood High</Text>
                        <Text className="text-white/80 text-sm">Role: Tutor (Flia. Perez)</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
}
