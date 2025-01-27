import { deleteEventById } from "@/apiCalls/deleteEventById";
import { unsubscribeUserFromAnEvent } from "@/apiCalls/unsubscribeUserFromEvent";
import { useEventContext } from "@/context/eventContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect, useState } from "react";
import { Modal, TouchableOpacity, View, Text, StyleSheet, Alert } from "react-native";
import { Float } from "react-native/Libraries/Types/CodegenTypes";

interface EventCardProps {
    event: EventWithId | null;
    handleAdministrarEvent: (event: EventWithId) => void;
    handleDetailsEvent: (event: EventWithId) => void;
};

interface EventWithId {
    id: number;
    name: string;
    date: Date;
    latitude: Float;
    longitude: Float;
    description: string;
    maxParticipants: number;
    currentParticipants: number;
    time:string;
    categoryName: string;
    userId: number;
};

const EventCard: React.FC<EventCardProps> = ({
    event,
    handleAdministrarEvent,
    handleDetailsEvent,
}) => {
    const [userId, setUserId] = useState<number | null>(null);
    const { refreshEvents } = useEventContext();
    const isEventOngoing = event?.date ? new Date(event.date) > new Date() : false;
    const [isConfirmaDeletionModalVisible, setIsConfirmaDeletionModalVisible] = useState(false);

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


    const openDeleteModal = (eventId: number) => {
        setIsConfirmaDeletionModalVisible(true);
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



    return (
        <TouchableOpacity style={styles.eventCard}>

            {event && (
                <>
                    <View style={styles.headerSection}>
                        <Text style={styles.eventName} numberOfLines={2} >{event.name}</Text>


                        <Text style={styles.eventDate}>
                            {event.date ? new Date(event.date).toLocaleDateString() : 'Fecha no disponible'}
                        </Text>
                    </View>


                    <View style={styles.divider} />


                    <Text style={styles.eventDescription} numberOfLines={3}>
                        {event.description || 'No hay descripción disponible para este evento.'}
                    </Text>
                    <View style={styles.actionButtons}>
                        {userId !== null && event.userId === userId && isEventOngoing && (
                            <>
                                <TouchableOpacity
                                    style={styles.adminButton}
                                    onPress={() => handleAdministrarEvent(event)}
                                >
                                    <Text style={styles.adminButtonText}>Administrar</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={styles.deleteButton}
                                    onPress={() => openDeleteModal(event.id)}
                                >
                                    <Text style={styles.deleteButtonText}>Eliminar</Text>
                                </TouchableOpacity>
                            </>
                        )}
                        {userId !== null && event.userId !== userId && isEventOngoing && (
                            <>
                                <TouchableOpacity
                                    style={styles.detailsButton}
                                    onPress={() => handleDetailsEvent(event)}
                                >
                                    <Text style={styles.detailsButtonText}>Detalles</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={styles.unsubscribeButton}
                                    onPress={() => handleUnsubscribe(event.id)}
                                >
                                    <Text style={styles.unsubscribeButtonText}>Desuscribirse</Text>
                                </TouchableOpacity>
                            </>
                        )}
                        {!isEventOngoing && (
                            <>
                                <TouchableOpacity
                                    style={styles.detailsButton}
                                    onPress={() => handleDetailsEvent(event)}
                                >
                                    <Text style={styles.detailsButtonText}>Detalles</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={styles.unsubscribeButton}
                                    onPress={() => handleDeleteEvent(event.id)}
                                >
                                    <Text style={styles.unsubscribeButtonText}>Borrar</Text>
                                </TouchableOpacity>
                            </>

                        )}
                    </View>
                </>
            )}

        </TouchableOpacity>
    );
};

export default EventCard;

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