import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, Image, ActionSheetIOS, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTheme } from '../../../hooks/useTheme';
import { ArrowLeft, Calendar, FileText, Camera, X } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';

export default function ChildDetailScreen() {
    const { id } = useLocalSearchParams();
    const theme = useTheme();
    const router = useRouter();
    const [image, setImage] = useState<string | null>(null);

    const [cameraPermission, requestCameraPermission] = ImagePicker.useCameraPermissions();
    const [mediaLibraryPermission, requestMediaLibraryPermission] = ImagePicker.useMediaLibraryPermissions();

    // Mock data
    const childName = id === '1' ? 'Juan Gomez' : id === '2' ? 'Sofia Gomez' : 'Mateo Perez';
    const attendanceHistory = [
        { id: 1, date: '21/10/2023', status: 'Ausente', subject: 'Matemática', type: 'Unexcused' },
        { id: 2, date: '15/10/2023', status: 'Tarde', subject: 'Historia', type: 'Late' },
        { id: 3, date: '01/10/2023', status: 'Ausente', subject: 'Educación Física', type: 'Excused' },
    ];

    const pickImage = async (useCamera: boolean) => {
        try {
            let result;
            if (useCamera) {
                if (!cameraPermission?.granted) {
                    const permission = await requestCameraPermission();
                    if (!permission.granted) {
                        Alert.alert('Permiso denegado', 'Se requiere acceso a la cámara.');
                        return;
                    }
                }
                result = await ImagePicker.launchCameraAsync({
                    mediaTypes: ImagePicker.MediaTypeOptions.Images,
                    allowsEditing: true,
                    aspect: [4, 3],
                    quality: 0.5,
                });
            } else {
                if (!mediaLibraryPermission?.granted) {
                    const permission = await requestMediaLibraryPermission();
                    if (!permission.granted) {
                        Alert.alert('Permiso denegado', 'Se requiere acceso a la galería.');
                        return;
                    }
                }
                result = await ImagePicker.launchImageLibraryAsync({
                    mediaTypes: ImagePicker.MediaTypeOptions.Images,
                    allowsEditing: true,
                    aspect: [4, 3],
                    quality: 0.5,
                });
            }

            if (!result.canceled) {
                setImage(result.assets[0].uri);
            }
        } catch (error) {
            Alert.alert('Error', 'No se pudo cargar la imagen.');
        }
    };

    const handleUploadJustification = () => {
        Alert.alert(
            'Seleccionar Imagen',
            'Elija una opción para subir la justificación médica',
            [
                { text: 'Tomar Foto', onPress: () => pickImage(true) },
                { text: 'Elegir de Galería', onPress: () => pickImage(false) },
                { text: 'Cancelar', style: 'cancel' }
            ]
        );
    };

    const submitJustification = () => {
        console.log('Uploading image:', image);
        Alert.alert('Éxito', 'Justificación cargada localmente');
        setImage(null); // Reset after upload
    };

    return (
        <View className="flex-1 bg-gray-50">
            {/* Header */}
            <View style={{ backgroundColor: theme.primary }} className="pt-12 pb-6 px-6 shadow-sm">
                <View className="flex-row items-center">
                    <TouchableOpacity onPress={() => router.back()} className="mr-4 bg-white/20 p-2 rounded-full">
                        <ArrowLeft size={24} color="#FFF" />
                    </TouchableOpacity>
                    <Text className="text-white text-xl font-bold">{childName}</Text>
                </View>
            </View>

            <ScrollView className="flex-1 px-6 pt-6">
                <Text className="text-gray-900 font-bold text-lg mb-4">Historial de Asistencias</Text>

                {attendanceHistory.map((record) => (
                    <View key={record.id} className="bg-white p-4 rounded-xl mb-3 shadow-sm flex-row items-center border border-gray-100">
                        <View className={`h-10 w-10 rounded-full items-center justify-center mr-3 ${record.type === 'Unexcused' ? 'bg-red-100' : record.type === 'Late' ? 'bg-yellow-100' : 'bg-blue-100'
                            }`}>
                            <Calendar size={20} color={
                                record.type === 'Unexcused' ? '#EF4444' : record.type === 'Late' ? '#F59E0B' : '#3B82F6'
                            } />
                        </View>
                        <View className="flex-1">
                            <Text className="text-gray-900 font-semibold">{record.subject}</Text>
                            <Text className="text-gray-500 text-sm">{record.date} - {record.status}</Text>
                        </View>
                        <View className={`px-2 py-1 rounded-md ${record.type === 'Unexcused' ? 'bg-red-50' : 'bg-green-50'
                            }`}>
                            <Text className={`text-xs font-medium ${record.type === 'Unexcused' ? 'text-red-700' : 'text-green-700'
                                }`}>{record.type}</Text>
                        </View>
                    </View>
                ))}

                <View className="mt-6 mb-10">
                    {image ? (
                        <View className="mb-4 items-center">
                            <View className="relative">
                                <Image source={{ uri: image }} className="w-40 h-40 rounded-xl" />
                                <TouchableOpacity
                                    onPress={() => setImage(null)}
                                    className="absolute -top-2 -right-2 bg-red-500 rounded-full p-1"
                                >
                                    <X size={16} color="white" />
                                </TouchableOpacity>
                            </View>
                            <Text className="text-gray-500 text-sm mt-2">Imagen seleccionada</Text>

                            <TouchableOpacity
                                onPress={submitJustification}
                                style={{ backgroundColor: theme.primary }}
                                className="mt-4 w-full p-4 rounded-xl flex-row items-center justify-center shadow-sm"
                            >
                                <FileText size={20} color="#FFF" className="mr-2" />
                                <Text className="text-white font-bold text-lg ml-2">Confirmar Carga</Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <TouchableOpacity
                            onPress={handleUploadJustification}
                            style={{ backgroundColor: theme.primary }}
                            className="p-4 rounded-xl flex-row items-center justify-center shadow-sm"
                        >
                            <Camera size={20} color="#FFF" className="mr-2" />
                            <Text className="text-white font-bold text-lg ml-2">Subir Justificación</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </ScrollView>
        </View>
    );
}
