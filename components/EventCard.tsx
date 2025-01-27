import { deleteEventById } from "@/apiCalls/deleteEventById";
import { unsubscribeUserFromAnEvent } from "@/apiCalls/unsubscribeUserFromEvent";
import { useEventContext } from "@/context/eventContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect, useState } from "react";
import { TouchableOpacity, View, Text, StyleSheet, Alert } from "react-native";
import { Float } from "react-native/Libraries/Types/CodegenTypes";
import DeleteConfirmationModal from "./DeleteConfirmationModal";

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
    time: string;
    category: any;
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
    const[isDeletingLoading, setIsDeletingLoading] = useState(false);

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
            setIsDeletingLoading(true);
            await deleteEventById(eventId);
            refreshEvents();
            setIsConfirmaDeletionModalVisible(false);
            
        } catch (error) {
            console.error('Error deleting event:', error);
            Alert.alert('Error', 'No se pudo eliminar el evento.');
        }
    };

    const getBackgroundColor = () => {
        if (event?.category?.name === 'Deporte') {
            return '#7FBF6E'; //light green
        }
        if (event?.category?.name === 'Musica') {
            return '#F76D8C'; //light pink
        }
        if (event?.category?.name === 'Arte') {
            return '#65B9D3'; //light blue
        }
        if (event?.category?.name === 'Comida') {
            return '#FF4E50'; //light red
        }
        if (event?.category?.name === 'NetWorking') {
            return '#F9D616'; //light yellow
        }
        if (event?.category?.name === 'Fiesta') {
            return '#F0BB62'; //light orange
        }
        if (event?.category?.name === 'Voluntariado') {
            return '#D2B48C'; //light brown
        }
        return '#fef6f2';
    }

    const backgroundColor = getBackgroundColor();

    if (isDeletingLoading) {
        return (
            <View style={styles.eventCard}>
                <Text style= {styles.deleteText}>Eliminando evento...</Text>
            </View>
        );
    }

    return (
        <TouchableOpacity style={[styles.eventCard, { borderColor: backgroundColor }]}>

            {event && (
                <>
                    <View style={styles.headerSection}>
                        <Text style={styles.eventName} numberOfLines={2} >{event.name}</Text>
                        <Text style={styles.eventDate}>
                            {event.date ? new Date(event.date).toLocaleDateString() : 'Fecha no disponible'}
                        </Text>

                    </View>

                    <View style={[styles.divider, { backgroundColor: backgroundColor }]} />

                    <Text style={styles.eventDescription} numberOfLines={3}>
                        {event.description || 'No hay descripción disponible para este evento.'}
                    </Text>

                    <View style={[styles.divider, { backgroundColor: backgroundColor }]} />

                    <View style={styles.headerSection}>
                        <Text style={[styles.eventCategory, { backgroundColor: backgroundColor }]}>{event.category.name}</Text>
                        <Text style={styles.eventTime}>{event.time}</Text>
                    </View>

                    <View style={[styles.divider, { backgroundColor: backgroundColor }]} />

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
                                    onPress={() => setIsConfirmaDeletionModalVisible(true)}
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
                    <DeleteConfirmationModal
                        isVisible={isConfirmaDeletionModalVisible}
                        confirmDelete={() =>
                            handleDeleteEvent(
                                event?.id ? event.id : 0
                            )
                        }
                        mensaje="¿Estás seguro que deseas eliminar este evento?"
                        onClose={() => setIsConfirmaDeletionModalVisible(false)}
                    />
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
        width: '45%',
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
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        width: '80%',
        backgroundColor: '#ffffff',
        borderRadius: 15,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    modalTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#FF7F50',
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
        backgroundColor: '#ffffff',
        borderRadius: 20,
        marginVertical: 15,
        marginHorizontal: 16,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 6,
        borderWidth: 1
    },
    headerSection: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    eventName: {
        fontSize: 22,
        fontWeight: '700',
        color: '#333',
        textTransform: 'capitalize',
        marginBottom: 8,
        width: '60%',
    },
    eventCategory: {
        fontSize: 16,
        fontWeight: '700',
        color: '#fff',
        padding: 4,
        borderRadius: 5,
        textAlign: 'center',
        maxWidth: '40%',
    },
    eventDate: {
        fontSize: 14,
        fontStyle: 'italic',
        color: '#6b7280',
        backgroundColor: '#f1f1f1',
        padding: 4,
        borderRadius: 5,
        textAlign: 'right',
        maxWidth: '40%',
    },
    eventTime: {
        fontSize: 14,
        fontStyle: 'italic',
        color: 'black',
        backgroundColor: '#f1f1f1',
        padding: 4,
        borderRadius: 5,
        textAlign: 'right',
    },
    divider: {
        height: 2,
        borderRadius: 1,
        marginVertical: 16,
    },
    eventDescription: {
        fontSize: 16,
        color: '#4b5563',
        lineHeight: 24,
        textAlign: 'justify',
        alignSelf: 'center',
        marginBottom: 16,
    },
    actionButtons: {
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        flexWrap: 'wrap',
        marginTop: 10,
    },
    adminButton: {
        backgroundColor: '#2563eb',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 10,
        marginBottom: 10,
    },
    adminButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
        textTransform: 'uppercase',
        textAlign: 'center',
    },
    deleteButton: {
        backgroundColor: '#dc2626',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 10,
        marginBottom: 10,
    },
    deleteButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
        textTransform: 'uppercase',
        textAlign: 'center',
    },
    detailsButton: {
        backgroundColor: '#4f46e5',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 10,
        marginBottom: 10,
    },
    detailsButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
        textTransform: 'uppercase',
        textAlign: 'center',
    },
    unsubscribeButton: {
        backgroundColor: '#f97316',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 10,
        marginBottom: 10,
    },
    unsubscribeButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
        textTransform: 'uppercase',
        textAlign: 'center',
    },
    deleteText: {
        fontSize: 16,
        color: '#333',
        textAlign: 'center',
    },
});