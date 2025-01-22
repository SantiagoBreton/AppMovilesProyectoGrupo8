import React, { useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet, FlatList, Modal, ScrollView, TouchableOpacity, Alert } from 'react-native';
import * as Location from 'expo-location';
import AsyncStorage from "@react-native-async-storage/async-storage";
import MapView, { Marker } from 'react-native-maps';
import { Float } from 'react-native/Libraries/Types/CodegenTypes';
import { unsubscribeUserFromAnEvent } from '@/apiCalls/unsubscribeUserFromEvent';
import { myEvents } from '@/apiCalls/myEvents';
import { deleteEventById } from '@/apiCalls/deleteEventById';
import { useEventContext } from '@/context/eventContext';
import { getSubscribedEvents } from '@/apiCalls/getSubscribedEvents';
import { getAllUsersSubscribedToAnEvent } from '@/apiCalls/getAllUsersSubscribedToAnEvent';
import EventCreationModal from '@/components/EventCreationModal';
import AdminEventModal from '@/components/AdminEventModal';
import EventDetailModal from '@/components/EventDetailModal';


export default function CreacionEvento() {
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [selectedView, setSelectedView] = useState('inscriptos'); // 'inscriptos' o 'creados'
    const { refreshEvents } = useEventContext();
    const [isDetailsModalVisible, setIsDetailsModalVisible] = useState(false);
    const [isConfirmaDeletionModalVisible, setIsConfirmaDeletionModalVisible] = useState(false);
    const [eventDetails, setEventDetails] = useState<EventWithId | null>(null);
    const [eventLocation, setEventLocation] = useState<string | null>(null);
    const { trigger } = useEventContext();
    const [isMapVisible, setMapVisible] = useState(false);
    const allevents = getSubscribedEvents(trigger);
    const myUserEvents = myEvents(trigger); // Call myEvents and store the result directly in the variable
    const eventsToDisplay = selectedView === 'inscriptos' ? allevents.events : myUserEvents.myEvents;
    const [isAdminModalVisible, setIsAdminModalVisible] = useState(false);
    const [adminEventDetails, setAdminEventDetails] = useState<EventWithId | null>(null);
    const [subscribedUsers, setSubscribedUsers] = useState<User[]>([]);
    const [selectedEventId, setSelectedEventId] = useState<number | null>(null);
    const [userId, setUserId] = useState<number | null>(null);

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
        userId: number;
    };

    interface User {
        id: number;
        name: string;
        email: string;
    };

    const handleShowMap = () => setMapVisible(true);

    const handleCloseMap = () => setMapVisible(false);

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
    };

    const handleUnsubscribe = async (eventId: number) => {
        try {
            const currentUserId = await AsyncStorage.getItem('userId');
            if (currentUserId) {
                await unsubscribeUserFromAnEvent(parseInt(currentUserId), eventId);
                refreshEvents();
            }
        } catch (error) {
            console.error('Error unsubscribing:', error);
            Alert.alert('Error', 'No se pudo cancelar la inscripción.');
        }

    };

    const handleAdministrarEvent = async (event: EventWithId) => {
        try {
            const allSubscribedUser = await getAllUsersSubscribedToAnEvent(event.id);

            if (allSubscribedUser.data) {
                setSubscribedUsers(allSubscribedUser.data);
            } else {
                Alert.alert('Error', 'No se pudo cargar la información de los usuarios inscriptos.');
            }
            setAdminEventDetails(event);
            setIsAdminModalVisible(true);
        } catch (error) {
            Alert.alert('Error', 'No se pudo cargar la información del evento.');
        }
    };

    const handleDeleteEvent = async (eventId: number) => {
        try {
            await deleteEventById(eventId);
            refreshEvents();
            Alert.alert('Éxito', 'El evento ha sido eliminado.');
        } catch (error) {
            console.error('Error deleting event:', error);
            Alert.alert('Error', 'No se pudo eliminar el evento.');
        }
    };

    const openDeleteModal = (eventId: number) => {
        setSelectedEventId(eventId);
        setIsConfirmaDeletionModalVisible(true);
    };

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Mis Eventos</Text>

            {/* Botones para cambiar la vista */}
            <View style={styles.buttonContainer}>
                <View style={styles.buttonWrapper}>
                    <Button
                        title="Eventos a los que me Inscribí"
                        onPress={() => switchView('inscriptos')}
                        color={selectedView === 'inscriptos' ? '#FF7F50' : '#A9A9A9'} // Naranja para seleccionado, gris claro para no seleccionado
                    />
                </View>
                <View style={styles.buttonWrapper}>
                    <Button
                        title="Mis Eventos Creados"
                        onPress={() => switchView('creados')}
                        color={selectedView === 'creados' ? '#FF7F50' : '#A9A9A9'} // Naranja para seleccionado, gris claro para no seleccionado
                    />
                </View>
            </View>
            <Text style={styles.subHeader}>Eventos Activos</Text>
            <ScrollView>

                {/* Lista de eventos activos */}
                <FlatList
                    data={eventsToDisplay.filter(event => new Date(event.date) >= new Date())}
                    scrollEnabled={false}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            style={styles.eventCard}
                            activeOpacity={0.9}
                        >
                            {/* Name and Date Section */}
                            <View style={styles.headerSection}>
                                <Text style={styles.eventName} numberOfLines={2} >{item.name}</Text>

                                {/* Date */}
                                <Text style={styles.eventDate}>
                                    {item.date ? new Date(item.date).toLocaleDateString() : 'Fecha no disponible'}
                                </Text>
                            </View>

                            {/* Divider */}
                            <View style={styles.divider} />

                            {/* Event Description */}
                            <Text style={styles.eventDescription} numberOfLines={3}>
                                {item.description || 'No hay descripción disponible para este evento.'}
                            </Text>

                            {/* Action Buttons */}
                            <View style={styles.actionButtons}>
                                {userId !== null && item.userId === userId && (
                                    <>
                                        <TouchableOpacity
                                            style={styles.adminButton}
                                            onPress={() => handleAdministrarEvent(item)}
                                        >
                                            <Text style={styles.adminButtonText}>Administrar</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            style={styles.deleteButton}
                                            onPress={() => openDeleteModal(item.id)}
                                        >
                                            <Text style={styles.deleteButtonText}>Eliminar</Text>
                                        </TouchableOpacity>
                                    </>
                                )}
                                {userId !== null && item.userId !== userId && (
                                    <>
                                        <TouchableOpacity
                                            style={styles.detailsButton}
                                            onPress={() => handleDetailsEvent(item)}
                                        >
                                            <Text style={styles.detailsButtonText}>Detalles</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            style={styles.unsubscribeButton}
                                            onPress={() => handleUnsubscribe(item.id)}
                                        >
                                            <Text style={styles.unsubscribeButtonText}>Desuscribirse</Text>
                                        </TouchableOpacity>
                                    </>
                                )}
                            </View>
                        </TouchableOpacity>
                    )}
                    keyExtractor={(item) => item.id.toString()}
                />

                <Text style={styles.subHeader}>Eventos Finalizados</Text>
                {/* Lista de eventos finalizados */}
                <FlatList
                    data={eventsToDisplay.filter(event => new Date(event.date) < new Date())}
                    scrollEnabled={false}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            style={styles.eventCard}
                            activeOpacity={0.8}
                        >
                            <View style={styles.cardHeader}>
                                <Text style={styles.eventName} numberOfLines={2}>{item.name}</Text>
                                <Text style={styles.eventDate}>
                                    {item.date ? new Date(item.date).toLocaleDateString() : 'Fecha no disponible'}
                                </Text>
                            </View>
                            <Text style={styles.eventDescription}>{item.description}</Text>

                            <View style={styles.divider} />

                            {userId !== null && item.userId === userId && (
                                <View style={styles.actionButtons}>
                                    <Button title="Detalles" onPress={() => handleDetailsEvent(item)} />
                                    <Button
                                        title="Eliminar"
                                        onPress={() => handleDeleteEvent(item.id)}
                                        color="#f44336"
                                    />
                                </View>
                            )}
                            {userId !== null && item.userId !== userId && (
                                <View style={styles.actionButtons}>
                                    <Button title="Detalles" onPress={() => handleDetailsEvent(item)} />
                                    {/* <Button title="Calificaciones y comentarios" onPress={() => {
                                handleReviewsEvent(item); 
                                handleCommentsEvents(item);
                                }} /> */}
                                </View>
                            )}
                        </TouchableOpacity>
                    )}
                    keyExtractor={(item) => item.id.toString()}
                />

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
                showSuscribe={true}
                onClose={() => setIsDetailsModalVisible(false)}
            />
            {/* <Modal
                visible={isDetailsModalVisible}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setIsDetailsModalVisible(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        {eventDetails && (
                            <>
                                <Text style={styles.modalTitle} numberOfLines={2}>{eventDetails.name}</Text>
                                <View style={styles.modalSection}>
                                    <Text style={styles.modalLabel } numberOfLines={4}>Descripción:</Text>
                                    <Text style={styles.modalText}>{eventDetails.description}</Text>
                                </View>
                                <View style={styles.modalSection}>
                                    <Text style={styles.modalLabel}>Fecha:</Text>
                                    <Text style={styles.modalText}>
                                        {new Date(eventDetails.date).toLocaleDateString()}
                                    </Text>
                                </View>
                                <View style={styles.modalSection}>
                                    <Text style={styles.modalLabel}>Ubicación:</Text>
                                    <Text style={styles.modalText}>{eventLocation}</Text>
                                </View>
                                <View style={styles.modalSection}>
                                    <Text style={styles.modalLabel}>Participantes:</Text>
                                    <Text style={styles.modalText}>
                                        {eventDetails.currentParticipants}/{eventDetails.maxParticipants}
                                    </Text>
                                </View>
                                <TouchableOpacity
                                    style={styles.modalActionButton}
                                    onPress={handleShowMap}
                                >
                                    <Text style={styles.modalActionButtonText}>Ver en el Mapa</Text>
                                </TouchableOpacity>
                            </>
                        )}
                        <TouchableOpacity
                            style={[styles.modalActionButton, { backgroundColor: 'red' }]}
                            onPress={() => setIsDetailsModalVisible(false)}
                        >
                            <Text style={styles.closeButtonText}>Cerrar</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal> */}

            {/* Map Modal */}
            <Modal
                visible={isMapVisible}
                transparent={true}
                animationType="fade"
                onRequestClose={handleCloseMap}
            >
                <View style={styles.mapModalContainer}>
                    <View style={styles.mapModalContent}>
                        <MapView
                            style={styles.map}
                            initialRegion={{
                                latitude: eventDetails?.latitude ?? 0,
                                longitude: eventDetails?.longitude ?? 0,
                                latitudeDelta: 0.01,
                                longitudeDelta: 0.01,
                            }}
                        >
                            <Marker
                                coordinate={{
                                    latitude: eventDetails?.latitude ?? 0,
                                    longitude: eventDetails?.longitude ?? 0,
                                }}
                                title={eventDetails?.name ?? ''}
                                description={eventDetails?.description ?? ''}
                            />
                        </MapView>
                        <TouchableOpacity
                            style={styles.closeMapButton}
                            onPress={handleCloseMap}
                        >
                            <Text style={styles.closeMapButtonText}>Cerrar Mapa</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
            
            {/* Modal para administrar eventos */}

            <AdminEventModal
                isVisible={isAdminModalVisible}
                adminEventDetails={adminEventDetails}
                subscribedUsers={subscribedUsers}
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
    subHeader: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginTop: 20,
        marginBottom: 10,
    },
    buttonContainer: {
        flexDirection: 'row',        // Alineación de los botones en fila
        justifyContent: 'space-between', // Espaciado entre los botones
        marginBottom: 20,            // Margen abajo para separar de la lista
    },
    header: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        color: '#FF7F50',
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
        marginTop: 20,
        alignSelf: 'center',
        paddingVertical: 12,
        paddingHorizontal: 30,
        backgroundColor: '#FF7F50',
        borderRadius: 25,
    },
    modalActionButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center',
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
        backgroundColor: 'rgba(0, 0, 0, 0.5)', // Overlay for modal
    },
    modalContent: {
        width: '80%', // Adjust width if needed
        backgroundColor: '#ffffff', // White background
        borderRadius: 15, // Rounded edges
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5, // For Android shadow
    },
    modalTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#FF7F50', // Orange color for title
        textAlign: 'center',
        marginBottom: 15,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    closeButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    eventCard: {
        backgroundColor: '#f9f9f9',
        borderRadius: 15,
        marginVertical: 10,
        marginHorizontal: 16,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 5,
        borderWidth: 1,
        borderColor: '#e6e6e6',
    },
    headerSection: {
        flexDirection: 'row',
        justifyContent: 'space-between', // Pushes name and date to opposite ends
        alignItems: 'center',
        marginBottom: 8,
    },
    eventName: {
        fontSize: 20,
        fontWeight: '700',
        color: '#333',
        textTransform: 'capitalize',
        flex: 1, // Ensures the name takes up available space
    },
    eventDate: {
        fontSize: 14,
        fontStyle: 'italic',
        color: '#6b7280',
        backgroundColor: '#f1f1f1',
        padding: 4,
        borderRadius: 5,
        textAlign: 'right', // Aligns text to the right
        maxWidth: '40%', // Ensures it doesn’t take too much space
    },
    divider: {
        height: 1,
        backgroundColor: '#e5e5e5',
        marginVertical: 10,
    },
    eventDescription: {
        fontSize: 16,
        color: '#4b5563',
        lineHeight: 22,
        marginBottom: 12,
        textAlign: 'justify',
    },
    actionButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10,
    },
    adminButton: {
        backgroundColor: '#3b82f6',
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 8,
    },
    adminButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
        textTransform: 'uppercase',
    },
    deleteButton: {
        backgroundColor: '#ef4444',
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 8,
    },
    deleteButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
        textTransform: 'uppercase',
    },
    detailsButton: {
        backgroundColor: '#6366f1',
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 8,
    },
    detailsButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
        textTransform: 'uppercase',
    },
    unsubscribeButton: {
        backgroundColor: '#f59e0b',
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 8,
    },
    unsubscribeButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
        textTransform: 'uppercase',
    }
});