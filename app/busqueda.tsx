import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    FlatList,
    StyleSheet,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    Modal,
    Alert,
    Button,
    ScrollView,
    Image,
    TouchableWithoutFeedback,
    Dimensions
} from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import MapView, { Circle, Marker } from 'react-native-maps';
import { Float } from 'react-native/Libraries/Types/CodegenTypes';
import * as Location from 'expo-location';
import { getEventByName } from '@/apiCalls/getEventByName';
import { getUserByName } from '@/apiCalls/getUserByName';
import { getAllEventsFromUser } from '@/apiCalls/getAllEventsFromUser';
import { subscribeToEvent } from '@/apiCalls/subscribeToAnEvent';
import { useEventContext } from '@/context/eventContext';
import SpectatedUserModal from '@/components/SpectatedUserModal';
import { white } from 'react-native-paper/lib/typescript/styles/themes/v2/colors';
import EventDetailModal from '@/components/EventDetailModal';

export default function Busqueda() {
    const [query, setQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [isDetailsModalVisible, setIsDetailsModalVisible] = useState(false);
    const [eventDetails, setEventDetails] = useState<CustomEvent | null>(null);
    const [filteredEvents, setFilteredEvents] = useState<CustomEvent[]>([]);
    const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
    const [isSpectatedUserVisible, setIsSpectatedUserVisible] = useState(false);
    const [seeUser, setSeeUser] = useState<SeeUser | null>(null);


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
    };


    interface SeeUser {
        name: string;
        email: string;
        events: CustomEvent[];
    }

    interface User {
        id: number;
        name: string;
        email: string;
    };



    const handleEventSearch = async () => {
        setIsSearching(true);
        try {
            if (query.length === 0) {
                setFilteredEvents([]);
                return;
            }
            const filteredResults = await getEventByName(query);
            setFilteredEvents(filteredResults.data);
        } catch (error) {
            console.error('Error fetching events:', error);
            Alert.alert('Error', 'Failed to fetch events');
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

        } catch (error) {
            console.error('Error fetching users:', error);
            Alert.alert('Error', 'Failed to fetch users');
        } finally {
            setIsSearching(false);
        }
    }

    const handleSeeUser = async (user: User) => {
        try {
            const userEvents = await getAllEventsFromUser(user.id);
            setSeeUser({ name: user.name, email: user.email, events: userEvents.data });

            setIsSpectatedUserVisible(true);

        } catch (error) {
            console.error('Error fetching user events:', error);
            Alert.alert('Error', 'Failed to fetch user events');
        }
    }
    



    const handleDetailsEvent = async (item: CustomEvent) => {
        try {
            const addresses = await Location.reverseGeocodeAsync({
                latitude: item.latitude,
                longitude: item.longitude,
            });

            const location =
                addresses.length > 0
                    ? `${addresses[0].city}, ${addresses[0].region}, ${addresses[0].country}`
                    : 'Address not found';

            setEventDetails(item)
            setIsDetailsModalVisible(true);
        } catch (error) {
            console.error('Error fetching address:', error);
            Alert.alert('Error', 'Failed to fetch event details');
        }
    };

    const renderEventResult = ({ item }: { item: CustomEvent }) => (
        <TouchableOpacity
            style={styles.eventCard}
            onPress={() => handleDetailsEvent(item)}
        >
            <View style={styles.cardContent}>
                <Text style={styles.eventName}>{item.name}</Text>
                <Text style={styles.eventDate}>
                    {item.date ? new Date(item.date).toLocaleDateString() : 'Fecha no disponible'}
                </Text>
                <Text style={styles.eventDescription}>{item.description}</Text>
            </View>
            <View style={styles.detailButtonContainer}>
                <Button
                    title="Detalles"
                    onPress={() => handleDetailsEvent(item)}
                    color="#FF7F50"
                />
            </View>
        </TouchableOpacity>

    );

    const renderUserResult = ({ item }: { item: User }) => (
        <View style={styles.resultCard}>
            <View style={styles.iconContainer}>
                <FontAwesome5 name="user" size={30} color="#FF7F50" />
            </View>
            <View style={styles.userInfo}>
                <Text style={styles.resultTitle}>{item.name}</Text>
                <Text style={styles.resultType}>{item.email}</Text>
            </View>
            <View style={styles.buttonContainer}>
                <Button
                    title="Ver Perfil"
                    color="#FF7F50"
                    onPress={() => {
                        handleSeeUser(item);
                    }}
                />
            </View>
        </View>);

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
                        handleEventSearch();
                        handleUserSearch();
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
            <EventDetailModal
                visible={isDetailsModalVisible}
                eventDetails={eventDetails as CustomEvent | null}

                onClose={() => setIsDetailsModalVisible(false)}
            />



           
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>

                <SpectatedUserModal
                    isVisible={isSpectatedUserVisible}
                    user={seeUser}
                    onClose={() => setIsSpectatedUserVisible(false)}
                />
            </View>
        </KeyboardAvoidingView>
    );
}

const { width } = Dimensions.get('window');

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
    closeMapButton: {
        position: 'absolute',
        bottom: 10,
        paddingVertical: 10,
        paddingHorizontal: 20,
        backgroundColor: '#f44336',
        borderRadius: 5,
    },
    closeMapButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    buttonWrapper: {
        width: '45%',               // Controla el ancho de cada botón
    },
    mapModalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    mapModalContent: {
        width: '90%',
        height: '60%',
        backgroundColor: '#fff',
        borderRadius: 10,
        overflow: 'hidden',
        alignItems: 'center',
    },
    map: {
        width: '100%',
        height: '100%',
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)', // Fondo semi-transparente
    },
    modalContent: {
        width: '80%',
        padding: 20,
        backgroundColor: '#fff',
        borderRadius: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
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
    userInfo: {
        flex: 1,
    },
    eventCard2: {
        padding: 15,
        backgroundColor: '#f9f9f9',
        borderRadius: 8,
        marginBottom: 10,
        borderColor: '#FF7F50',
        borderWidth: 1,
    },
    detailButton2: {
        marginTop: 10,
        flexDirection: 'row',
        width: '100%', // Make the button container take full width of the card
        justifyContent: 'center', // Center the button within the container
    },
    eventName2: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#FF7F50',
    },
    closeButton2: {
        position: 'absolute',
        top: 8,
        right: 8,
        padding: 8,
    },
    closeButton: {
        marginTop: 10,
        alignSelf: 'center',
        paddingVertical: 11.6,
        paddingHorizontal: 20,
        backgroundColor: '#FF7F50',
        borderRadius: 25,
    },
    closeButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    modalSection: {
        marginBottom: 10,
        paddingVertical: 5,
        borderBottomWidth: 1,
        borderBottomColor: '#FF7F50',
    },
    modalLabel: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#FF7F50',
    },
    modalText: {
        fontSize: 14,
        color: '#333',
    },
    modalActionButton: {
        marginTop: 10, // Reducido el espacio
        alignSelf: 'center',
        paddingVertical: 12,
        paddingHorizontal: 30,
        backgroundColor: '#FF7F50',
        borderRadius: 25,
    },
    largeButton: {
        paddingVertical: 20, // Botón más grande
        width: '100%', // Ocupa todo el ancho del contenedor
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10, // Reducido el espacio
    },
    modalActionButtonText: {
        color: '#fff',
        fontSize: width > 360 ? 16 : 14,
        fontWeight: 'bold',
        textAlign: 'center',
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
    container: {
        flex: 1,
        backgroundColor: '#F9F9F9',
        paddingHorizontal: 16,
        paddingVertical: 10,
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
    header: {
        alignItems: 'center',
        marginBottom: 24,
        backgroundColor: '#FF7F50',
        paddingVertical: 16,
        borderRadius: 16,
    },

    profileImage: {
        width: 100,
        height: 100,
        borderRadius: 50,
        borderWidth: 2,
        borderColor: '#fff',
        marginBottom: 8,
    },
    name: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
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
});