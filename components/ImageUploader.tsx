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
    ActivityIndicator,
    Animated
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';

import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { Ionicons } from '@expo/vector-icons';
import { uploadUserProfileImage } from '@/apiCalls/uploadUserProfileImage';
import { getUserProfileImage } from '@/apiCalls/getUserProfileImage';
import { uploadUserBannerImage } from '@/apiCalls/uploadUserBannerImage';
import AsyncStorage from '@react-native-async-storage/async-storage';



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
    const [activeTab, setActiveTab] = useState(0); // 0 = Profile Image, 1 = Banner
    const tabUnderline = new Animated.Value(0); // Animation for the underline

    useEffect(() => {
        loadImages();
        const fetchImage = async () => {
            setUserId(parseInt(await AsyncStorage.getItem('userId') || '0'));
            const result = await getUserProfileImage(userId || 0);
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



    const handleTabSwitch = (index: number) => {
        setActiveTab(index);
        Animated.timing(tabUnderline, {
            toValue: index,
            duration: 300,
            useNativeDriver: false,
        }).start();
    };
    const renderImageItem = (item: any, isProfile: boolean) => {
        const filename = item.split('/').pop();
        const handleUpload = isProfile ? uploadProfileImage : uploadBanner;
        return (
            <View style={styles.imageRow}>
                <Image style={styles.image} source={{ uri: item }} />
                <Text style={styles.imageText}>{filename}</Text>
                <Ionicons.Button
                    name="cloud-upload"
                    backgroundColor="transparent"
                    color="#4CAF50"
                    size={22}
                    onPress={() => handleUpload(item)}
                />
                <Ionicons.Button
                    name="trash"
                    backgroundColor="transparent"
                    color="#FF5252"
                    size={22}
                    onPress={() => deleteImage(item)}
                />
            </View>
        );
    }


    return (
        <Modal visible={isVisible} transparent={false} animationType="slide">
            
            <SafeAreaView style={styles.safeArea}>
                {/* Header with Tabs */}
                <View style={styles.header}>
                    <TouchableOpacity style={styles.tab} onPress={() => handleTabSwitch(0)}>
                        <Text style={[styles.tabText, activeTab === 0 && styles.activeTabText]}>
                            Profile Images
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.tab} onPress={() => handleTabSwitch(1)}>
                        <Text style={[styles.tabText, activeTab === 1 && styles.activeTabText]}>
                            Banners
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Animated underline */}
                <Animated.View
                    style={[
                        styles.tabUnderline,
                        {
                            left: tabUnderline.interpolate({
                                inputRange: [0, 1],
                                outputRange: ['5%', '55%'], // Adjust based on tab widths
                            }),
                        },
                    ]}
                />

                {/* Content */}
                
                <View style={styles.content}>
                    {activeTab === 0 ? (
                        <>
                            <Text style={styles.title}>Upload Your Profile Image</Text>
                            <Button title="Select Image" onPress={() => selectImage(true)} color="#4CAF50" />
                            <FlatList
                                data={images}
                                renderItem={({ item }) => renderImageItem(item, true)}
                                keyExtractor={(item, index) => index.toString()}
                            />
                        </>
                    ) : (
                        <>
                            <Text style={styles.title}>Upload Your Banner</Text>
                            <Button title="Select Banner" onPress={() => selectImage(true)} color="#4CAF50" />
                            <FlatList
                                data={images}
                                renderItem={({ item }) => renderImageItem(item, false)}
                                keyExtractor={(item, index) => index.toString()}
                            />
                        </>
                    )}
                </View>

                {/* Loader */}
                {uploading && (
                    <View style={styles.loadingOverlay}>
                        <ActivityIndicator color="#fff" animating size="large" />
                    </View>
                )}

                {/* Close Button */}
                <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                    <Text style={{ color: '#FFF', fontSize: 16, fontWeight: 'bold' }}>Close</Text>
                </TouchableOpacity>

            </SafeAreaView>
        </Modal>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#F8F9FA',
        paddingHorizontal: 20,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
        marginBottom: 10,
    },
    tab: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: 10,
    },
    tabText: {
        fontSize: 18,
        color: '#757575',
    },
    activeTabText: {
        color: '#000',
        fontWeight: '600',
    },
    tabUnderline: {
        position: 'absolute',
        bottom: 0, // Ensure it's at the bottom of the tabs, not the screen
        width: '40%',
        height: 3,
        backgroundColor: '#4CAF50',
    },
    
    content: {
        flex: 1,
    },
    title: {
        fontSize: 20,
        textAlign: 'center',
        marginBottom: 10,
        color: '#333',
    },
    imageRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 5,
        padding: 10,
        backgroundColor: '#FFF',
        borderRadius: 10,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 2,
    },
    image: {
        width: 80,
        height: 80,
        borderRadius: 10,
    },
    imageText: {
        flex: 1,
        marginLeft: 10,
        fontSize: 16,
        color: '#333',
    },
    loadingOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.6)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    closeButton: {
        position: 'absolute',
        bottom: 20, // Positioned 20 pixels from the bottom
        alignSelf: 'center', // Centers the button horizontally
        backgroundColor: '#00000090', // Semi-transparent black background
        paddingVertical: 10, // Adjust the vertical padding for a rectangle
        paddingHorizontal: 20, // Adjust the horizontal padding for width
        borderRadius: 10, // Subtle rounding for a rectangular shape
        zIndex: 10, // Ensures the button stays on top
    },

});

export default ImageUploader;
