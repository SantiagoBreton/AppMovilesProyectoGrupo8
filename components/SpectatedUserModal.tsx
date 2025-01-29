import React, { useEffect, useState } from 'react';
import { Modal, View, Text, TouchableOpacity, Image, FlatList, ScrollView, StyleSheet, ActivityIndicator, ImageBackground, TextInput, Pressable } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { Float } from 'react-native/Libraries/Types/CodegenTypes';
import EventDetailModal from './EventDetailModal';
import { getAllEventsFromUser } from '@/apiCalls/getAllEventsFromUser';
import ReviewModal from './RatingUserModal';
import { getAllUserRatings } from '@/apiCalls/getAllUserRatings';
import { StarRating } from './StarRating';
import { getUserProfileImage } from '@/apiCalls/getUserProfileImage';
import { getUserBannerImage } from '@/apiCalls/getUserBannerImage';
import ErrorModal from './ErrorModal';
import EventCard2 from './EventCard2';
import { categoryName } from '@/constants/CategoryColor';

interface CustomEvent {
    id: number;
    name: string;
    date: Date;
    latitude: Float;
    longitude: Float;
    description: string;
    maxParticipants: number;
    currentParticipants: number;
    time: string;
    category: any;
    userId: number;
};
interface User {
    id: number;
    name: string;
    email: string;
    rating: number;
    description: string;
};
interface SpectatedUserModalProps {
    isVisible: boolean;
    user: User | null;
    onClose: () => void;
}
interface Rating {
    id: number;
    userId: number;
    ritingUserId: number;
    comment: string;
    rating: number;
}

const SpectatedUserModal: React.FC<SpectatedUserModalProps> = ({
    isVisible,
    user,
    onClose,
}) => {

    const [isDetailsModalVisible, setIsDetailsModalVisible] = useState(false);
    const [eventDetails, setEventDetails] = useState<CustomEvent | null>(null);
    const [userEvents, setUserEvents] = useState<CustomEvent[]>([]);
    const [filteredEvents, setFilteredEvents] = useState(userEvents);
    const [isLoading, setIsLoading] = useState(true);
    const [isRevieModalVisible, setIsReviewModalVisible] = useState(false);
    
    const [userRating, setUserRating] = useState<Rating[]>([]);
    const [profileImage, setProfileImage] = useState<string | null>(null);
    const [bannerImage, setBannerImage] = useState<string | null>(null);
    const [errorModalVisible, setErrorModalVisible] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [categories, setCategories] = useState<string[]>(categoryName);
    const [selectedCategory, setSelectedCategory] = useState('Todo');
    const [isCategoryModalVisible, setIsCategoryModalVisible] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const fetchUserData = async () => {
            if (!user) return;
            setIsLoading(true);
            try {
                const eventResponse = await getAllEventsFromUser(user.id);
                if (eventResponse.error) {
                    console.error('Error fetching user events:', eventResponse.error);
                    setErrorMessage('Error al obtener los eventos del usuario');
                    setErrorModalVisible(true);
                } else {
                    setUserEvents(eventResponse.data);
                }
                const profileImage = await getUserProfileImage(user.id);
                const bannerImage = await getUserBannerImage(user.id);
                if (profileImage.data) {
                    setProfileImage(profileImage.data.imageUrl);
                }
                if (bannerImage.data) {
                    setBannerImage(bannerImage.data.imageUrl);
                }

                await refreshUserRatings();
            } catch (error) {
                setErrorMessage('Error al obtener los eventos del usuario');
                setErrorModalVisible(true);
            } finally {
                setTimeout(() => {
                    setIsLoading(false);
                }, 650);
            }
        };

        fetchUserData();
    }, [user]);

    useEffect(() => {
            const results = userEvents.filter(event =>
                event.name.toLowerCase().includes(searchQuery.toLowerCase())
            );
            setFilteredEvents(results);
        }, [searchQuery, userEvents]);

    const refreshUserRatings = async () => {
        if (!user) return;
        try {
            const ratingResponse = await getAllUserRatings(user.id);
            if (ratingResponse.data) {
                setUserRating(ratingResponse.data);

                const averageRating =
                    ratingResponse.data.length > 0
                        ? ratingResponse.data
                            .reduce((acc: number, rating: { rating: number }) => acc + (rating.rating || 0), 0) /
                        ratingResponse.data.length
                        : 0;

                user.rating = averageRating;

            }
        } catch (error) {
            console.error('Error refreshing user ratings:', error);
        }
    };



    const handleCategorySelection = (category: string) => {
        setSelectedCategory(category);
        setFilteredEvents(category === 'Todo' ? userEvents : userEvents.filter(event => event.category.name === category));
        setIsCategoryModalVisible(false);
    };

    if (!user) return null;

    return (
        <Modal visible={isVisible} animationType="slide">
            {isLoading ? (
                // Mini pantalla de carga
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#FF7F50" />
                    <Text style={styles.loadingText}>Cargando...</Text>
                </View>
            ) : (
                <ScrollView>
                    <View style={styles.container}>
                        <TouchableOpacity style={styles.closeButton2} onPress={() => { onClose() }}>
                            <FontAwesome5 name="times" size={24} color="black" />
                        </TouchableOpacity>
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
                        <TouchableOpacity onPress={() => { setIsReviewModalVisible(true) }}>
                            <View style={styles.starContainer}>
                                <Text style={styles.text}>Valoración:  </Text>
                                <StarRating rating={user.rating || 0} size={24} />
                                <Text style={styles.text}>{`(${isNaN(user.rating) ? 0 : user.rating.toFixed(1)})`}</Text>
                            </View>
                        </TouchableOpacity>
                        <View style={styles.section}>
                            <Text style={styles.label}>Nombre:</Text>
                            <Text style={styles.input}>{user.name}</Text>
                        </View>
                        <View style={styles.section}>
                            <Text style={styles.label}>Email:</Text>
                            <Text style={styles.input}>{user.email}</Text>
                        </View>
                        <View style={styles.section}>
                            <Text style={styles.label}>Descripción:</Text>
                            <Text style={styles.input}>{user.description}</Text>
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
                    </View>

                </ScrollView>
            )
            }
            <EventDetailModal
                visible={isDetailsModalVisible}
                eventDetails={eventDetails as CustomEvent | null}
                onClose={() => setIsDetailsModalVisible(false)}
            />

            <ReviewModal
                isVisible={isRevieModalVisible}
                user={user}
                refreshData={refreshUserRatings}
                onClose={() => { setIsReviewModalVisible(false); refreshUserRatings() }}
            />
            <ErrorModal
                visible={errorModalVisible}
                title="Error"
                message={errorMessage}
                onClose={() => setErrorModalVisible(false)}
            />
        </Modal >
    );
};

const styles = StyleSheet.create({
    starContainer: {
        backgroundColor: '#ffffff',
        padding: 16,
        marginVertical: 12,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 4,
        flexDirection: 'row',
        alignItems: 'center',
    },
    text: {
        marginLeft: 10,
        fontSize: 16,
        color: '#333',
    },
    closeButton2: {
        position: 'absolute',
        right: 16,
        padding: 8,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1,
        overflow: 'hidden',
    },
    container: {
        flex: 1,
        backgroundColor: '#F9F9F9',
        paddingHorizontal: 16,
        paddingVertical: 10,
    },
    section: {
        backgroundColor: '#fff',
        padding: 16,
        marginVertical: 12,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 4,
    },
    label: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#FF7F50',
        marginBottom: 4,
    },
    input: {
        fontSize: 16,
        color: '#333',
        marginBottom: 8,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#FF7F50',
        marginBottom: 16,
        textAlign: 'center',
    },
    eventHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        flexWrap: 'wrap',
        marginBottom: 8,
    },
    eventCard: {
        backgroundColor: '#fef6f2',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderLeftWidth: 4,
        borderLeftColor: '#FF7F50',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
        elevation: 3,
    },
    eventName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#FF7F50',
        flex: 1,
        marginRight: 8,
    },
    eventDate: {
        fontSize: 14,
        color: '#666',
        fontStyle: 'italic',
        flexShrink: 0,
        marginTop: 5,
        marginLeft: 8,
        textAlign: 'right',
        width: '100%',
        paddingTop: 5,
    },
    eventDescription: {
        fontSize: 14,
        color: '#333',
        marginBottom: 8,
    },
    detailButtonContainer: {
        alignSelf: 'flex-end',
        marginTop: 8,
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
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        backgroundColor: '#FFFFFF',
        padding: 20,
        borderRadius: 12,
        width: '80%',
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
    modalOption: {
        paddingVertical: 10,
        width: '100%',
        alignItems: 'center',
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
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 20,
        color: '#007AFF',
    },
});

export default SpectatedUserModal;