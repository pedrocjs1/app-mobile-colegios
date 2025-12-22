import React from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity } from 'react-native';
import { useAuthStore } from '../../store/useAuthStore';
import { useTheme } from '../../hooks/useTheme';
import { ChevronRight } from 'lucide-react-native';
import { useRouter } from 'expo-router';

export default function HijosScreen() {
    const theme = useTheme();
    const router = useRouter();
    const user = useAuthStore((state) => state.user);
    const isGomez = user?.name.includes('Gomez');

    const children = isGomez ? [
        { id: 1, name: 'Juan Gomez', grade: '4to Grado A', avatar: 'https://i.pravatar.cc/150?img=12' },
        { id: 2, name: 'Sofia Gomez', grade: '2do Grado B', avatar: 'https://i.pravatar.cc/150?img=5' }
    ] : [
        { id: 3, name: 'Mateo Perez', grade: '1er Grado A', avatar: 'https://i.pravatar.cc/150?img=3' }
    ];

    return (
        <View style={{ flex: 1, backgroundColor: '#F9FAFB' }}>
            <View style={{ backgroundColor: 'white', paddingTop: 60, paddingBottom: 20, paddingHorizontal: 25, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' }}>
                <Text style={{ fontSize: 28, fontWeight: 'bold', color: '#111827' }}>Mis Hijos</Text>
            </View>

            <ScrollView style={{ padding: 20 }}>
                {children.map(child => (
                    <TouchableOpacity
                        key={child.id}
                        onPress={() => router.push(`/(dashboard)/hijos/${child.id}`)}
                        style={{ backgroundColor: 'white', borderRadius: 25, padding: 15, marginBottom: 15, flexDirection: 'row', alignItems: 'center', elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5 }}
                    >
                        <Image source={{ uri: child.avatar }} style={{ width: 60, height: 60, borderRadius: 20, marginRight: 15 }} />
                        <View style={{ flex: 1 }}>
                            <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#1F2937' }}>{child.name}</Text>
                            <Text style={{ color: '#6B7280', fontSize: 14 }}>{child.grade}</Text>
                        </View>
                        <View style={{ backgroundColor: '#F3F4F6', padding: 8, borderRadius: 12 }}>
                            <ChevronRight size={20} color="#9CA3AF" />
                        </View>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </View>
    );
}