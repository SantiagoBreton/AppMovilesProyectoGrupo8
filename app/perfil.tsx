import React, { useEffect, useState } from 'react';
import {
    View, Text, TextInput, StyleSheet, Image, ScrollView, Button, FlatList,
    TouchableOpacity, ActivityIndicator,
    ImageBackground
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
import ImageUploader from '@/components/ImageUploader';
import { getUserProfileImage } from '@/apiCalls/getUserProfileImage';
import { getUserBannerImage } from '@/apiCalls/getUserBannerImage';

interface User {
    id: number;
    name: string;
    email: string;
    rating: number;
}

export default function Perfil() {
    const [user, setUser] = useState<User | null>(null); 
    const { trigger } = useEventContext();
    const myUserEvents = myEvents(trigger);
    const eventsToDisplay = myUserEvents.myEvents;
    const { logout } = useAuthContext();
    const [isLoading, setIsLoading] = useState(true);
    const [isReviewModalVisible, setIsReviewModalVisible] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredEvents, setFilteredEvents] = useState(eventsToDisplay);
    const [isImageModalVisible, setIsImageModalVisible] = useState(false);
    const [profileImage, setProfileImage] = useState<string | null>(null);
    const [bannerImage, setBannerImage] = useState<string | null>(null);

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
                setIsLoading(false);
            }
        };

        fetchUserData();
    }, []);
    useEffect(() => {
        const getUserImage = async () => {
            const result = await getUserProfileImage();
            if (result.data) {
                setProfileImage(result.data.imageUrl);
            }
        }
        const getUserBanner = async () => {
            const result = await getUserBannerImage();
            if (result.data) {
                setBannerImage(result.data.imageUrl);
            }
        }
        getUserImage();
        getUserBanner();
    }, [isImageModalVisible]);

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

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#007AFF" />
                <Text style={styles.loadingText}>Cargando...</Text>
            </View>
        );
    }

    return (
        <ScrollView style={styles.container}>

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

            <View style={styles.buttonContainer}>
                <Button title="Cerrar Sesión" onPress={handleLogout} color="#007AFF" />
                <Button title="Subir Imagen" onPress={() => { setIsImageModalVisible(true) }} color="#34C759" />
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Eventos Creados</Text>
                <TextInput
                    style={styles.searchBar}
                    placeholder="Buscar eventos por nombre"
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
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
            </View>

            <ReviewModal
                isVisible={isReviewModalVisible}
                user={user}
                refreshData={refreshUserRatings}
                onClose={() => { setIsReviewModalVisible(false); refreshUserRatings(); }}
            />
            <ImageUploader isVisible={isImageModalVisible} onClose={() => setIsImageModalVisible(false)} />

        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F4F4F4',
        paddingHorizontal: 16,
    },
    bannerContainer: {
        alignItems: 'center',
        marginTop: 10,
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
        color: '#007AFF',
        marginBottom: 16,
        textAlign: 'center',
    },
    label: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#007AFF',
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
        backgroundColor: '#F4F4F4',
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
});