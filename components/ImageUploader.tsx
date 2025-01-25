import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Modal,
    Button,
    TextInput,
    FlatList,
    Image,
    SafeAreaView,
    ActivityIndicator
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';

import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { Ionicons } from '@expo/vector-icons';
import { uploadUserProfileImage } from '@/apiCalls/uploadUserProfileImage';
import { getUserProfileImage } from '@/apiCalls/getUserProfileImage';
import { uploadUserBannerImage } from '@/apiCalls/uploadUserBannerImage';



interface ImageUploaderProps {
    isVisible: boolean;
    onClose: () => void;
}

const imgDir = FileSystem.documentDirectory + 'images/';

const ensureDirExists = async () => {
    const dirInfo = await FileSystem.getInfoAsync(imgDir);
    if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(imgDir, { intermediates: true });
    }
};



const ImageUploader: React.FC<ImageUploaderProps> = ({
    isVisible,
    onClose,
}) => {

    const [uploading, setUploading] = useState(false);
    const [images, setImages] = useState<any[]>([]);
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [userId, setUserId] = useState<number | null>(null);
    useEffect(() => {
        loadImages();
        const fetchImage = async () => {
            const result = await getUserProfileImage();
            if (result.data) {
                setImageUrl(result.data.imageUrl);
            }
        };

        fetchImage();
    }, []);

    const loadImages = async () => {
        await ensureDirExists();
        const files = await FileSystem.readDirectoryAsync(imgDir);
        if (files.length > 0) {
            setImages(files.map((f) => imgDir + f));
        }
    };

    const selectImage = async (useLibrary: boolean) => {
        let result;
        const options: ImagePicker.ImagePickerOptions = {
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.75
        };

        if (useLibrary) {
            result = await ImagePicker.launchImageLibraryAsync(options);
        } else {
            await ImagePicker.requestCameraPermissionsAsync();
            result = await ImagePicker.launchCameraAsync(options);
        }

        // Save image if not cancelled
        if (!result.canceled) {
            saveImage(result.assets[0].uri);
        }
    };

    const saveImage = async (uri: string) => {
        await ensureDirExists();
        const filename = new Date().getTime() + '.jpeg';
        const dest = imgDir + filename;
        await FileSystem.copyAsync({ from: uri, to: dest });
        setImages([...images, dest]);
    };

    // Upload image to server
    const uploadProfileImage = async (uri: string) => {
        setUploading(true);
        console.log('Uploading image:', uri);

        const success = await uploadUserProfileImage(uri);
        if (success) {
            console.log('Image uploaded successfully');
        } else {
            console.error('Failed to upload image');
        }

        setUploading(false);
    };
    const uploadBanner = async (uri: string) => {
        setUploading(true);
        console.log('Uploading image:', uri);

        const success = await uploadUserBannerImage(uri);
        if (success) {
            console.log('Image uploaded successfully');
        } else {
            console.error('Failed to upload image');
        }

        setUploading(false);
    };

    // Delete image from file system
    const deleteImage = async (uri: string) => {
        await FileSystem.deleteAsync(uri);
        setImages(images.filter((i) => i !== uri));
    };

    const renderProfileImage = ({ item }: { item: any }) => {
        const filename = item.split('/').pop();
        return (
            <View style={{ flexDirection: 'row', margin: 1, alignItems: 'center', gap: 5 }}>
                <Image style={{ width: 80, height: 80 }} source={{ uri: item }} />
                <Text style={{ flex: 1 }}>{filename}</Text>
                <Ionicons.Button name="cloud-upload" onPress={() => uploadProfileImage(item)} />
                <Ionicons.Button name="trash" onPress={() => deleteImage(item)} />
            </View>
        );
    };
    const renderBanner = ({ item }: { item: any }) => {
        const filename = item.split('/').pop();
        return (
            <View style={{ flexDirection: 'row', margin: 1, alignItems: 'center', gap: 5 }}>
                <Image style={{ width: 80, height: 80 }} source={{ uri: item }} />
                <Text style={{ flex: 1 }}>{filename}</Text>
                <Ionicons.Button name="cloud-upload" onPress={() => uploadBanner(item)} />
                <Ionicons.Button name="trash" onPress={() => deleteImage(item)} />
            </View>
        );
    };


    return (
        <Modal visible={isVisible} transparent={false} animationType="fade">
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.buttonContainer}>
                    <Button title="Photo Library" onPress={() => selectImage(true)} color="#FF6F61" />
                    <Button title="Capture Image" onPress={() => selectImage(false)} color="#FF6F61" />
                </View>

                <Text style={styles.title}>My Profile Images</Text>
                <FlatList data={images} renderItem={renderProfileImage} />

                {uploading && (
                    <View style={styles.loadingOverlay}>
                        <ActivityIndicator color="#fff" animating size="large" />
                    </View>
                )}
            </SafeAreaView>
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.buttonContainer}>
                    <Button title="Photo Library" onPress={() => selectImage(true)} color="#FF6F61" />
                    <Button title="Capture Image" onPress={() => selectImage(false)} color="#FF6F61" />
                </View>
                <Text style={styles.title}>My Banners</Text>
                <FlatList data={images} renderItem={renderBanner} />

                {uploading && (
                    <View style={styles.loadingOverlay}>
                        <ActivityIndicator color="#fff" animating size="large" />
                    </View>
                )}
            </SafeAreaView>

            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                <FontAwesome name="times" size={24} color="#FFF" />
            </TouchableOpacity>

        </Modal>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#FFF',  // Solid white background for the modal
        padding: 20,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        marginVertical: 20,
    },
    title: {
        textAlign: 'center',
        fontSize: 22,
        fontWeight: '500',
        color: '#333',  // Darker text for better contrast
        marginBottom: 20,
    },
    loadingOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: '#00000090',  // Semi-transparent black overlay for loading
        alignItems: 'center',
        justifyContent: 'center',
    },
    closeButton: {
        position: 'absolute',
        top: 20,
        right: 20,
        backgroundColor: 'rgba(0,0,0,0.3)',
        borderRadius: 50,
        padding: 10,
    },
});

export default ImageUploader;
