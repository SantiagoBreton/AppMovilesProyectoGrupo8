import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, FlatList, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform, Button, ScrollView, Image } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { Float } from 'react-native/Libraries/Types/CodegenTypes';
import { getEventByName } from '@/apiCalls/getEventByName';
import { getUserByName } from '@/apiCalls/getUserByName';
import SpectatedUserModal from '@/components/SpectatedUserModal';
import EventCard2 from '@/components/EventCard2';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getUserProfileImage } from '@/apiCalls/getUserProfileImage';
import { StarRating } from '@/components/StarRating';
import ErrorModal from '@/components/ErrorModal';
import { set } from 'lodash';


export default function Busqueda() {
    const [query, setQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [filteredEvents, setFilteredEvents] = useState<CustomEvent[]>([]);
    const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
    const [isSpectatedUserVisible, setIsSpectatedUserVisible] = useState(false);
    const [seeUser, setSeeUser] = useState<User | null>(null);
    const [userId, setUserId] = useState<number | null>(null);
    const [userImages, setUserImages] = useState<{ [key: number]: string }>({});
    const [isErrorModalVisible, setIsErrorModalVisible] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        const fetchUserId = async () => {
            try {
                const storedUserId = await AsyncStorage.getItem('userId');
                if (storedUserId) {
                    setUserId(parseInt(storedUserId, 10)); // Convierte el ID de string a número
                }
            } catch (error) {
                console.error('Error fetching userId:', error);
            }
        };

        fetchUserId();
    }, []);

    interface CustomEvent {
        id: number;
        name: string;
        date: Date;
        latitude: Float;
        longitude: Float;
        description: string;
        maxParticipants: number;
        currentParticipants: number;
        userId: number;
        time: string;
        category: any;
    };

    interface User {
        id: number;
        name: string;
        email: string;
        description: string;
        rating: Float;
    };

    const handleEventSearch = async () => {
        setIsSearching(true);
        try {
            if (query.length === 0) {
                setFilteredEvents([]);
                return;
            }
            const currentUserId = await AsyncStorage.getItem('userId');
            if (currentUserId) {
                const filteredResults = await getEventByName(parseInt(currentUserId), query);
                setFilteredEvents(filteredResults.data);
            } else {
                setErrorMessage('No se pudo obtener el ID del usuario');
                setIsErrorModalVisible(true);
            }
        } catch (error) {
            setErrorMessage('Error al buscar eventos');
            setIsErrorModalVisible(true);
        } finally {
            setIsSearching(false);
        }
    }

    const handleUserSearch = async () => {
        setIsSearching(true);
        try {
            if (query.length === 0) {
                setFilteredUsers([]);
                return;
            }
            const filteredResults = await getUserByName(query);
            setFilteredUsers(filteredResults.data);
            // Fetch profile images for all users
            filteredResults.data.forEach(async (user: User) => {
                const profileImage = await getUserProfileImage(user.id);
                //console.log('Profile image:', profileImage);    
                setUserImages((prevImages) => ({
                    ...prevImages,
                    [user.id]: profileImage.data.imageUrl, // Store only the URL from the response
                }));

            });
            console.log('User images:', userImages);
        } catch (error) {
            setErrorMessage('Error al buscar usuarios');
            setIsErrorModalVisible(true);
        } finally {
            setIsSearching(false);
        }
    };

    const handleSeeUser = (user: User) => {
        setSeeUser(user)
        setIsSpectatedUserVisible(true);
    }

    const renderEventResult = ({ item }: { item: CustomEvent }) => (
        <EventCard2
            event={item} />
    );

    const renderUserResult = ({ item }: { item: User }) =>
    (
        <TouchableOpacity onPress={() => handleSeeUser(item)}>
            <View style={styles.resultCard}>
                <View style={styles.iconContainer}>
                    {/* Display user profile image */}
                    {userImages[item.id] ? (
                        <Image source={{ uri: userImages[item.id] }} style={styles.userProfileImage} />
                    ) : (
                        <FontAwesome5 name="user" size={30} color="#FF7F50" />
                    )}

                </View>
                <View style={styles.userInfo}>
                    <Text style={styles.resultTitle}>{item.name}</Text>
                    <Text style={styles.resultType}>{item.email}</Text>
                </View>

                <StarRating rating={item.rating || 0} size={16} />
                <Text style={styles.text}>{`(${isNaN(item.rating) ? 0 : item.rating.toFixed(1)})`}</Text>
            </View>
        </TouchableOpacity>)



    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={styles.container2}
        >
            <Text style={styles.header2}>Buscar Eventos o Usuarios</Text>
            <View style={styles.searchContainer}>
                <TextInput
                    style={styles.input2}
                    placeholder="Escribe el nombre del evento o usuario..."
                    placeholderTextColor="#A9A9A9"
                    value={query}
                    onChangeText={setQuery}
                    onSubmitEditing={() => {
                        handleEventSearch();
                        handleUserSearch();
                    }}
                />
                <TouchableOpacity
                    style={styles.searchButton}
                    onPress={() => {
                        setIsSearching(true);
                        handleEventSearch();
                        handleUserSearch();
                        setIsSearching(false);
                    }}
                >
                    <FontAwesome5 name="search" size={20} color="#FFFFFF" />
                </TouchableOpacity>
            </View>

            {isSearching ? (
                <Text style={styles.loadingText}>Buscando...</Text>
            ) : (
                <ScrollView>
                    {/* Events Section */}
                    <Text style={styles.sectionHeader}>Eventos</Text>
                    <FlatList
                        data={filteredEvents}
                        renderItem={renderEventResult}
                        keyExtractor={(item) => item.id.toString()}
                        ListEmptyComponent={<Text style={styles.noResultsText}>No se encontraron eventos.</Text>}
                        scrollEnabled={false}
                    />

                    {/* Users Section */}
                    <Text style={styles.sectionHeader}>Usuarios</Text>
                    <FlatList
                        data={filteredUsers}
                        renderItem={renderUserResult}
                        keyExtractor={(item) => item.id.toString()}
                        ListEmptyComponent={<Text style={styles.noResultsText}>No se encontraron usuarios.</Text>}
                        scrollEnabled={false}
                    />
                </ScrollView>
            )}


            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>

                <SpectatedUserModal
                    isVisible={isSpectatedUserVisible}
                    user={seeUser}
                    onClose={() => setIsSpectatedUserVisible(false)}
                />
            </View>
            <ErrorModal
                visible={isErrorModalVisible}
                title="error"
                message={errorMessage}
                onClose={() => setIsErrorModalVisible(false)}
            />
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#FF7F50',
        marginBottom: 10,
        textAlign: 'center',
    },
    sectionHeader: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#FF7F50',
        marginTop: 10,
        marginBottom: 5,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    searchButton: {
        marginLeft: 10,
        backgroundColor: '#FF7F50',
        borderRadius: 25,
        padding: 12,
    },
    loadingText: {
        textAlign: 'center',
        fontSize: 16,
        color: '#808080',
        marginTop: 20,
    },
    noResultsText: {
        textAlign: 'center',
        fontSize: 16,
        color: '#808080',
        marginTop: 20,
    },
    resultCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginVertical: 8,
        marginHorizontal: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 5,
    },
    resultIcon: {
        marginRight: 16,
    },
    resultTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 4,
    },
    resultType: {
        fontSize: 14,
        color: '#666',
    },
    buttonContainer: {
        marginLeft: 16,
    },
    actionButtons: {
        marginTop: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    detailButton: {
        marginTop: 10,
        flexDirection: 'row',
        width: '100%', // Make the button container take full width of the card
        justifyContent: 'center', // Center the button within the container
    },
    container2: {
        marginTop: 30,
        flex: 1,
        backgroundColor: '#ffffff',
        padding: 16,
    },
    header2: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#FF7F50',
        textAlign: 'center',
        marginBottom: 20,
    },
    input2: {
        flex: 1,
        height: 50,
        borderWidth: 1,
        borderColor: '#FF7F50',
        borderRadius: 25,
        paddingHorizontal: 16,
        fontSize: 16,
        backgroundColor: '#ffffff',
    },
    userProfileImage: {
        width: 50,
        height: 50,
        borderRadius: 20,
    },
    userInfo: {
        flex: 1,
    },
    closeButton: {
        marginTop: 10,
        alignSelf: 'center',
        paddingVertical: 11.6,
        paddingHorizontal: 20,
        backgroundColor: '#FF7F50',
        borderRadius: 25,
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10, // Reducido el espacio
    },
    iconContainer: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#FFEBE5',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    cardContent: {
        flex: 1,
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
    logoutContainer: {
        marginVertical: 16,
        alignItems: 'center',
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#FF7F50',
        marginBottom: 16,
        textAlign: 'center',
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
    },
    eventDate: {
        fontSize: 14,
        color: '#666',
        fontStyle: 'italic',
        flexShrink: 0, // Prevents the date from shrinking
        marginTop: 5, // Adds a small gap between the name and the date if it moves to the next line
        marginLeft: 8, // Moves the date a bit more to the left (closer to the name)
        textAlign: 'right', // Aligns the date to the left if it wraps
        width: '100%', // Ensures it takes up the full width on the next line
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
    subscribeButton: {
        flex: 1,
        marginRight: 10, // Separación entre botones
        backgroundColor: 'green',
        borderRadius: 25,
    },
    separatedButton: {
        flex: 1,
        marginLeft: 10, // Separación entre botones
        backgroundColor: 'red',
        borderRadius: 25,
    },
    text: {
        marginLeft: 10,
        fontSize: 14,
        color: '#333',
    },
});