import React, { useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet, FlatList, Modal, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import * as Location from 'expo-location';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Float } from 'react-native/Libraries/Types/CodegenTypes';
import { myEvents } from '@/apiCalls/myEvents';
import { useEventContext } from '@/context/eventContext';
import { getSubscribedEvents } from '@/apiCalls/getSubscribedEvents';
import { getAllUsersSubscribedToAnEvent } from '@/apiCalls/getAllUsersSubscribedToAnEvent';
import EventCreationModal from '@/components/EventCreationModal';
import AdminEventModal from '@/components/AdminEventModal';
import EventDetailModal from '@/components/EventDetailModal';
import EventCardModal from '@/components/EventCard';
import { getAllRequestingUsersToAnEvent } from '@/apiCalls/getAllRequestingUsersToAnEvent';


export default function CreacionEvento() {
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [selectedView, setSelectedView] = useState('inscriptos'); // 'inscriptos' o 'creados'
    const [isDetailsModalVisible, setIsDetailsModalVisible] = useState(false);
    const [eventDetails, setEventDetails] = useState<EventWithId | null>(null);
    const [eventLocation, setEventLocation] = useState<string | null>(null);
    const { trigger } = useEventContext();
    const allevents = getSubscribedEvents(trigger);
    const myUserEvents = myEvents(trigger); // Call myEvents and store the result directly in the variable
    //const eventsToDisplay = selectedView === 'inscriptos' ? allevents.events : myUserEvents.myEvents;
    const [isAdminModalVisible, setIsAdminModalVisible] = useState(false);
    const [adminEventDetails, setAdminEventDetails] = useState<EventWithId | null>(null);
    const [subscribedUsers, setSubscribedUsers] = useState<User[]>([]);
    const [requestingUsers, setRequestingUsers] = useState<User[]>([]);
    const [userId, setUserId] = useState<number | null>(null);
    const [isAdminEventLoading, setIsAdminEventLoading] = useState(false);
    const [selectedSubTab, setSelectedSubTab] = useState('activos'); // Sub-tab: 'activos' o 'finalizados'


    const eventsToDisplay =
        selectedView === 'inscriptos' ? allevents.events : myUserEvents.myEvents;

    // Filtrar eventos según el sub-tab activo
    const filteredEvents = eventsToDisplay.filter((event) =>
        selectedSubTab === 'activos'
            ? new Date(event.date) >= new Date()
            : selectedSubTab === 'finalizados'
                ? new Date(event.date) < new Date()
                : event.status === 'pendiente' // Nuevos filtros para solicitudes pendientes
    );



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

    interface EventWithId {
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

    const handleDetailsEvent = async (item: EventWithId) => {
        try {

            const addresses = await Location.reverseGeocodeAsync({
                latitude: item.latitude,
                longitude: item.longitude,
            });

            const location =
                addresses.length > 0
                    ? `${addresses[0].city}, ${addresses[0].region}, ${addresses[0].country}`
                    : 'Address not found';

            setEventDetails(item);
            setEventLocation(location);

            setIsDetailsModalVisible(true);
        } catch (error) {
            console.error('Error fetching address:', error);
            Alert.alert('Error', 'Failed to fetch event details');
        }
    };
    const switchView = (view: string) => {
        setSelectedView(view);
        setSelectedSubTab('activos'); // Reiniciar sub-tab al cambiar vista
    };

    const switchSubTab = (tab: string) => {
        setSelectedSubTab(tab);
    };




    const handleAdministrarEvent = async (event: EventWithId) => {
        try {
            setIsAdminEventLoading(true);
            const allSubscribedUser = await getAllUsersSubscribedToAnEvent(event.id);
            const allRequestingUsers = await getAllRequestingUsersToAnEvent(event.id);

            if (allSubscribedUser.data != null && allRequestingUsers.data != null) {
                setSubscribedUsers(allSubscribedUser.data);
                setRequestingUsers(allRequestingUsers.data);
            } else {
                Alert.alert('Error', 'No se pudo cargar la información de los usuarios inscriptos.');
            }
            setIsAdminEventLoading(false);
            setAdminEventDetails(event);
            setIsAdminModalVisible(true);
        } catch (error) {
            Alert.alert('Error', 'No se pudo cargar la información del evento.');
        }
    };
    if (isAdminEventLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#007AFF" />
                <Text style={styles.loadingText}>Cargando pantalla de administarcion...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Mis Eventos</Text>

            {/* Tabs principales */}
            <View style={styles.tabContainer}>
                <Text
                    style={[
                        styles.tabButton,
                        selectedView === 'inscriptos' && styles.tabButtonSelected,
                    ]}
                    onPress={() => switchView('inscriptos')}
                >
                    Eventos Inscritos
                </Text>
                <Text
                    style={[
                        styles.tabButton,
                        selectedView === 'creados' && styles.tabButtonSelected,
                    ]}
                    onPress={() => switchView('creados')}
                >
                    Eventos Creados
                </Text>
            </View>

            {/* Sub-tabs de Activos, Finalizados, y Pendientes */}
            <View style={styles.subTabContainer}>
                <Text
                    style={[
                        styles.subTabButton,
                        selectedSubTab === 'activos' && styles.subTabButtonSelected,
                    ]}
                    onPress={() => switchSubTab('activos')}
                >
                    Activos
                </Text>

                {selectedView === 'inscriptos' && (
                    <Text
                        style={[
                            styles.subTabButton,
                            selectedSubTab === 'pendientes' && styles.subTabButtonSelected,
                        ]}
                        onPress={() => switchSubTab('pendientes')}
                    >
                        Pendientes
                    </Text>
                )}
                                <Text
                    style={[
                        styles.subTabButton,
                        selectedSubTab === 'finalizados' && styles.subTabButtonSelected,
                    ]}
                    onPress={() => switchSubTab('finalizados')}
                >
                    Finalizados
                </Text>
            </View>


            <ScrollView>

                {/* Lista de eventos activos */}

                <FlatList
                    data={filteredEvents}
                    scrollEnabled={false}
                    renderItem={({ item }) => (
                        <EventCardModal
                            event={item}
                            handleDetailsEvent={handleDetailsEvent}
                            handleAdministrarEvent={handleAdministrarEvent}
                        />

                    )}
                    keyExtractor={(item) => item.id.toString()}
                    ListEmptyComponent={
                        <Text style={styles.emptyMessage}>No hay eventos disponibles</Text>
                    }
                />



                {/* Lista de eventos finalizados */}
                {/* <FlatList
                    data={eventsToDisplay.filter(event => new Date(event.date) < new Date())}
                    scrollEnabled={false}
                    renderItem={({ item }) => (
                        <EventCardModal
                            event={item}
                            handleDetailsEvent={handleDetailsEvent}
                            handleAdministrarEvent={handleAdministrarEvent}
                        />

                    )}
                    keyExtractor={(item) => item.id.toString()}
                /> */}

            </ScrollView>

            {/* Botón para abrir el modal de creación de evento */}
            <Button
                title="Crear Evento"
                onPress={() => setIsModalVisible(true)}
                color="#FF7F50"
            />

            {/* Modal para crear un evento */}
            <EventCreationModal
                isModalVisible={isModalVisible}
                onClose={() => setIsModalVisible(false)}
            />

            <EventDetailModal
                visible={isDetailsModalVisible}
                eventDetails={eventDetails}
                onClose={() => setIsDetailsModalVisible(false)}
            />

            {/* Modal para administrar eventos */}

            <AdminEventModal
                isVisible={isAdminModalVisible}
                adminEventDetails={adminEventDetails}
                subscribedUsers={subscribedUsers}
                requestingUsers={requestingUsers}
                onClose={() => setIsAdminModalVisible(false)}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginTop: 30,
        flex: 1,
        padding: 16,
        backgroundColor: '#ffffff',
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
    header: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#FF7F50',
        textAlign: 'center',
        marginBottom: 20,
        textShadowColor: 'rgba(0, 0, 0, 0.1)',
        textShadowOffset: { width: 2, height: 2 },
        textShadowRadius: 3,
    },
    subHeader: {
        fontSize: 20,
        fontWeight: '600',
        color: '#444',
        marginTop: 20,
        marginBottom: 10,
        textAlign: 'center',
        textTransform: 'uppercase',
    },
    tabContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginVertical: 15,
        backgroundColor: '#f9f9f9',
        borderRadius: 25,
        paddingVertical: 5,
        paddingHorizontal: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 5,
    },
    tabButton: {
        flex: 1,
        paddingVertical: 10,
        paddingHorizontal: 20,
        textAlign: 'center',
        color: '#A9A9A9',
        fontSize: 16,
        fontWeight: '500',
        borderRadius: 20,
    },
    tabButtonSelected: {
        color: '#fff',
        backgroundColor: '#FF7F50',
        fontWeight: '700',
        textShadowColor: 'rgba(0, 0, 0, 0.2)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 3,
    },
    subTabContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 16,
    },
    subTabButton: {
        fontSize: 14,
        fontWeight: '500',
        padding: 8,
        color: '#666',
    },
    subTabButtonSelected: {
        color: '#FF7F50',
        borderBottomWidth: 2,
        borderBottomColor: '#FF7F50',
    },
    emptyMessage: {
        textAlign: 'center',
        color: '#999',
        marginTop: 20,
        fontSize: 16,
    },


});