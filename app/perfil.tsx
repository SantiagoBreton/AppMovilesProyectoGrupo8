import React, { useEffect, useState } from 'react';
import {
    View, Text, TextInput, StyleSheet, Image, ScrollView, Button, FlatList,
    TouchableOpacity, ActivityIndicator,
    ImageBackground,
    Modal,
    Pressable
} from 'react-native';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { myEvents } from '@/apiCalls/myEvents';
import { useEventContext } from '@/context/eventContext';
import { getAllUserRatings } from '@/apiCalls/getAllUserRatings';
import { useAuthContext } from '@/context/userLoginContext';
import EventCard2 from '@/components/EventCard2';
import ReviewModal from '@/components/RatingUserModal';
import { getMyUserData } from '@/apiCalls/getMyUserData';
import { StarRating } from '@/components/StarRating';
import { getUserProfileImage } from '@/apiCalls/getUserProfileImage';
import { getUserBannerImage } from '@/apiCalls/getUserBannerImage';
import AdminProfileModal from '@/components/AdminProfileModal';
import { categoryName } from '@/constants/CategoryColor';
import LottieView from 'lottie-react-native';

interface User {
    id: number;
    name: string;
    email: string;
    rating: number;
    description: string;
}

export default function Perfil() {
    const [user, setUser] = useState<User | null>(null);
    const { trigger } = useEventContext();
    const myUserEvents = myEvents(trigger);
    const eventsToDisplay = myUserEvents.myEvents;
    const { logout } = useAuthContext();
    const [isLoading, setIsLoading] = useState(true);
    const [isReviewModalVisible, setIsReviewModalVisible] = useState(false);
    const [isAdminModalVisible, setIsAdminModalVisible] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredEvents, setFilteredEvents] = useState(eventsToDisplay);
    const [profileImage, setProfileImage] = useState<string | null>(null);
    const [bannerImage, setBannerImage] = useState<string | null>(null);
    const [userId, setUserId] = useState<number | null>(null);
    const [categories, setCategories] = useState<string[]>(categoryName);
    const [selectedCategory, setSelectedCategory] = useState('Todo');
    const [isCategoryModalVisible, setIsCategoryModalVisible] = useState(false);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const storedUserId = await AsyncStorage.getItem('userId');
                if (storedUserId) {
                    const userData = await getMyUserData();
                    if (userData) {
                        setUser(userData);
                    }
                }
            } catch (error) {
                console.error('Error fetching user data:', error);
            } finally {

            }
        };
        if (!isAdminModalVisible) {
            fetchUserData();
        }
    }, [isAdminModalVisible]);

    useEffect(() => {
        const fetchUserData = async () => {

            try {
                const storedUserId = await AsyncStorage.getItem('userId');
                if (storedUserId) {
                    setUserId(parseInt(storedUserId, 10));
                }

                // Fetch both images simultaneously
                const [bannerResult, profileResult] = await Promise.all([
                    getUserBannerImage(userId || 0),
                    getUserProfileImage(userId || 0),
                ]);

                // Set images if data exists
                if (bannerResult.data) {
                    setBannerImage(bannerResult.data.imageUrl);
                }
                if (profileResult.data) {
                    setProfileImage(profileResult.data.imageUrl);
                }

            } catch (error) {
                console.error("Error fetching images:", error);
            } finally {
                setIsLoading(false); // Stop loading when both images are set
            }
        };

        fetchUserData();

    }, [isAdminModalVisible, userId]);

    useEffect(() => {
        const results = eventsToDisplay.filter(event =>
            event.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
        setFilteredEvents(results);
    }, [searchQuery, eventsToDisplay]);

    const refreshUserRatings = async () => {
        if (!user) return;
        try {
            const ratingResponse = await getAllUserRatings(user.id);
            if (ratingResponse.data) {
                const averageRating =
                    ratingResponse.data.length > 0
                        ? ratingResponse.data.reduce((acc: any, rating: { rating: any; }) => acc + (rating.rating || 0), 0) /
                        ratingResponse.data.length
                        : 0;
                setUser({ ...user, rating: averageRating });
            }
        } catch (error) {
            console.error('Error refreshing user ratings:', error);
        }
    };

    const handleLogout = async () => {
        await AsyncStorage.removeItem("userId");
        logout();
    };

    const handleEditarPerfil = () => {
        setIsAdminModalVisible(true);
    };

    const handleCategorySelection = (category: string) => {
        setSelectedCategory(category);
        setFilteredEvents(category === 'Todo' ? eventsToDisplay : eventsToDisplay.filter(event => event.category.name === category));
        setIsCategoryModalVisible(false);
    };

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <LottieView
                    source={require('../assets/laoding/loadingAn.json')} // Replace with your Lottie JSON file
                    autoPlay
                    loop
                    style={styles.lottieAnimation}
                />
                <Text style={styles.loadingText}>Cargando...</Text>
            </View>
        );
    }

    return (
        <ScrollView>
            <View style={styles.container}>
                <View style={styles.bannerContainer}>
                    <ImageBackground
                        source={{ uri: bannerImage || 'https://www.gravatar.com/avatar/2c7d99fe281ecd3bcd65ab915bac6dd5?s=250' }}
                        style={styles.banner}
                    />
                    <View style={styles.profileContainer}>
                        <Image
                            source={{ uri: profileImage || 'https://www.gravatar.com/avatar/2c7d99fe281ecd3bcd65ab915bac6dd5?s=250' }}
                            style={styles.profileImage}
                        />
                    </View>
                </View>

                <View style={styles.userName}>
                    <Text style={styles.name}>{user?.name}</Text>
                </View>

                <TouchableOpacity onPress={() => setIsReviewModalVisible(true)}>
                    <View style={styles.starContainer}>
                        <Text style={styles.text}>Valoración:  </Text>
                        <StarRating rating={user?.rating || 0} size={24} />
                        <Text style={styles.text}>{`(${isNaN(user?.rating || 0) ? 0 : (user?.rating || 0).toFixed(1)})`}</Text>
                    </View>
                </TouchableOpacity>

                <View style={styles.section}>
                    <Text style={styles.label}>Nombre:</Text>
                    <Text style={styles.input}>{user?.name}</Text>
                </View>
                <View style={styles.section}>
                    <Text style={styles.label}>Email:</Text>
                    <Text style={styles.input}>{user?.email}</Text>
                </View>
                <View style={styles.section}>
                    <Text style={styles.label}>Descripción:</Text>
                    <Text style={styles.input}>{user?.description}</Text>
                </View>

                <View style={styles.buttonContainer}>
                    <TouchableOpacity
                        style={styles.closeSessionButton}
                        onPress={() => handleLogout()}
                    >
                        <Text style={styles.closeSessionButtonText}>Cerrar Sesión</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.editProfileButton}
                        onPress={() => handleEditarPerfil()}
                    >
                        <Text style={styles.editProfileButtonText}>Editar Perfil</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.section}>

                    <Text style={styles.sectionTitle}>Eventos Creados</Text>
                    <TextInput
                        style={styles.searchBar}
                        placeholder="Buscar eventos por nombre"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                    <TouchableOpacity
                        style={styles.filterButton}
                        onPress={() => setIsCategoryModalVisible(true)}
                    >
                        <Text style={styles.filterButtonText}>Categoría: {selectedCategory}</Text>
                    </TouchableOpacity>

                    {filteredEvents.length > 0 ? (
                        <FlatList
                            data={filteredEvents}
                            scrollEnabled={false}
                            renderItem={({ item }) => (
                                <EventCard2 event={item} />
                            )}
                            keyExtractor={(item) => item.id.toString()}
                            ListFooterComponent={
                                <Text style={styles.footerText}>
                                    {`Total de eventos: ${filteredEvents.length}`}
                                </Text>
                            }
                        />
                    ) : (
                        <Text style={styles.noEventsText}>No se han creado eventos aún.</Text>
                    )}

                    <Modal
                        visible={isCategoryModalVisible}
                        animationType="slide"
                        transparent={true}
                        onRequestClose={() => setIsCategoryModalVisible(false)}
                    >
                        <View style={styles.modalContainer}>
                            <View style={styles.modalContent}>
                                <Text style={styles.modalTitle}>Seleccionar Categoría</Text>
                                {categories.map((category) => (
                                    <TouchableOpacity
                                        key={category}
                                        style={styles.modalOption}
                                        onPress={() => handleCategorySelection(category)}
                                    >
                                        <Text style={styles.modalOptionText}>{category}</Text>
                                    </TouchableOpacity>
                                ))}
                                <Pressable
                                    style={styles.closeButton}
                                    onPress={() => setIsCategoryModalVisible(false)}
                                >
                                    <Text style={styles.closeButtonText}>Cerrar</Text>
                                </Pressable>
                            </View>
                        </View>
                    </Modal>
                </View>
                <AdminProfileModal
                    isVisible={isAdminModalVisible}
                    adminProfileDetails={user?.id ? { id: user.id, name: user.name, email: user.email, description: user.description } : null}
                    onClose={() => setIsAdminModalVisible(false)} />

                <ReviewModal
                    isVisible={isReviewModalVisible}
                    user={user}
                    refreshData={refreshUserRatings}
                    onClose={() => { setIsReviewModalVisible(false); refreshUserRatings(); }}
                />
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F4F4F4',
        paddingHorizontal: 16,
        paddingVertical: 35,
    },
    bannerContainer: {
        alignItems: 'center',
        marginTop: 0,
    },
    banner: {
        width: '100%',
        height: 180,
        justifyContent: 'flex-end',
    },
    profileContainer: {
        alignItems: 'center',
        marginTop: -50,
    },
    profileImage: {
        width: 100,
        height: 100,
        borderRadius: 50,
        borderWidth: 2,
        borderColor: '#F4F4F4',
    },
    userName: {
        alignItems: 'center',
        marginTop: 10,
        marginBottom: 20,
    },
    name: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
    },
    section: {
        backgroundColor: '#FFFFFF',
        padding: 16,
        marginVertical: 8,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#FF7F50', // Using the same orange color from the tab
        marginBottom: 16,
        textAlign: 'center',
    },
    label: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#FF7F50', // Using the same orange color from the tab
        marginBottom: 4,
    },
    input: {
        fontSize: 16,
        color: '#555',
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginVertical: 16,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: '#333',
    },
    starContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginVertical: 8,
    },
    text: {
        fontSize: 16,
        color: '#333',
    },
    searchBar: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        paddingHorizontal: 12,
        paddingVertical: 8,
        fontSize: 16,
        borderColor: '#DDD',
        borderWidth: 1,
        marginBottom: 16,
    },
    footerText: {
        marginTop: 16,
        textAlign: 'center',
        fontSize: 14,
        color: '#666',
    },
    noEventsText: {
        textAlign: 'center',
        fontSize: 16,
        color: '#999',
        marginTop: 16,
    },
    filterButton: {
        backgroundColor: '#007AFF',
        borderRadius: 12,
        padding: 10,
        alignItems: 'center',
        marginBottom: 16,
    },
    filterButtonText: {
        color: '#FFFFFF',
        fontWeight: 'bold',
        fontSize: 16,
    },
    modalContent: {
        backgroundColor: '#FFFFFF',
        padding: 20,
        borderRadius: 12,
        width: '80%',
        alignItems: 'center',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 20,
        color: '#007AFF',
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalOption: {
        paddingVertical: 10,
        width: '100%',
        alignItems: 'center',
    },
    modalOptionText: {
        fontSize: 16,
        color: '#333',
    },
    closeButton: {
        marginTop: 20,
        padding: 10,
        backgroundColor: '#FF3B30',
        borderRadius: 12,
    },
    closeButtonText: {
        color: '#FFFFFF',
        fontWeight: 'bold',
        fontSize: 16,
    },
    closeSessionButton: {
        backgroundColor: '#dc2626',
        borderRadius: 10,
        padding: 10,
    },
    closeSessionButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
        textTransform: 'uppercase',
        textAlign: 'center',
    },
    editProfileButton: {
        backgroundColor: '#007AFF',
        borderRadius: 10,
        padding: 10,
    },
    editProfileButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
        textTransform: 'uppercase',
        textAlign: 'center',
    },
    lottieAnimation: {
        width: 120,
        height: 120,
    },
});