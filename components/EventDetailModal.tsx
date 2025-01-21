// EventDetailModal.tsx
import React, { useEffect, useState } from 'react';
import { Modal, View, Text, TouchableOpacity, TouchableWithoutFeedback, StyleSheet, Alert } from 'react-native';
import MapView, { Circle } from 'react-native-maps';
import { Float } from 'react-native/Libraries/Types/CodegenTypes';
import { subscribeToEvent } from '@/apiCalls/subscribeToAnEvent';
import { useEventContext } from '@/context/eventContext';
import * as Location from 'expo-location';

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
interface EventDetailModalProps {
    visible: boolean;
    eventDetails: CustomEvent | null;
    onClose: () => void;
}

const EventDetailModal: React.FC<EventDetailModalProps> = ({
    visible,
    eventDetails,
    onClose,

}) => {
    const { refreshEvents } = useEventContext();
    const [isMapVisible, setMapVisible] = useState(false);
    const [eventLocation, setEventLocation] = useState<string | null>(null);

    useEffect(() => {
        const fetchLocation = async () => {
            if (eventDetails) {
                try {
                    const addresses = await Location.reverseGeocodeAsync({
                        latitude: eventDetails.latitude,
                        longitude: eventDetails.longitude,
                    });

                    const location =
                        addresses.length > 0
                            ? `${addresses[0].city}, ${addresses[0].region}, ${addresses[0].country}`
                            : 'Dirección no encontrada';
                    setEventLocation(location);
                } catch (error) {
                    console.error('Error obteniendo dirección:', error);
                    setEventLocation('Error al obtener dirección');
                }
            }
        };

        fetchLocation();
    }, [eventDetails]);

    if (!eventDetails) return null;
    
    const handleCloseMap = () => setMapVisible(false);

    const handleSubscribe = async (eventId: number) => {
            try {
                await subscribeToEvent(eventId);
                Alert.alert('Subscribed', 'You have successfully subscribed to the event');
                onClose();
                eventDetails.currentParticipants++; //no deberia ser necesario
                refreshEvents(); //FIXME: No se actualiza el contador de participantes
            } catch (error: any) {
                Alert.alert('Error subscribing to event:', error.message);
            }
        };

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="slide"
            onRequestClose={onClose}
        >
            <TouchableWithoutFeedback onPress={onClose}>
                <View style={styles.modalContainer}>
                    <TouchableWithoutFeedback>
                        <View style={styles.modalContent}>
                            <Text style={styles.modalTitle} >{eventDetails.name}</Text>
                            <View style={styles.modalSection}>
                                <Text style={styles.modalLabel}>Descripción:</Text>
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
                                style={[styles.modalActionButton, styles.largeButton]}
                                onPress={()=>setMapVisible(true)}
                            >
                                <Text style={styles.modalActionButtonText}>Ver en el Mapa</Text>
                            </TouchableOpacity>
                            <View style={styles.buttonRow}>
                                <TouchableOpacity
                                    style={[styles.modalActionButton, styles.subscribeButton]}
                                    onPress={() => handleSubscribe(eventDetails.id)}
                                >
                                    <Text style={styles.modalActionButtonText} numberOfLines={1}>Suscribirse</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.closeButton, styles.separatedButton]}
                                    onPress={onClose}
                                >
                                    <Text style={styles.closeButtonText}>Cerrar</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </TouchableWithoutFeedback>
                </View>
            </TouchableWithoutFeedback>
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
                                latitude: (eventDetails?.latitude ?? 0) + 0.004, // Offset latitude
                                longitude: (eventDetails?.longitude ?? 0) + 0.004, // Offset longitude
                                latitudeDelta: 0.015,
                                longitudeDelta: 0.015,
                            }}
                        >
                            <Circle //cambiar a marker para que se vea el punto
                                center={{
                                    latitude: (eventDetails?.latitude ?? 0) + 0.001, // Offset latitude
                                    longitude: (eventDetails?.longitude ?? 0) + 0.001, // Offset longitude
                                }}
                                radius={500}
                                strokeColor="rgba(0, 255, 0, 0.5)"
                                fillColor="rgba(0, 255, 0, 0.2)"
                                strokeWidth={2}

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
        </Modal>

        
    );
};

const styles = StyleSheet.create({
    // Same styles as before, define them here
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
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#FF7F50',
        marginBottom: 10,
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
    modalActionButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center',
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
    subscribeButton: {
        flex: 1,
        marginRight: 10, // Separación entre botones
        backgroundColor: 'green',
        borderRadius: 25,
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
    separatedButton: {
        flex: 1,
        marginLeft: 10, // Separación entre botones
        backgroundColor: 'red',
        borderRadius: 25,
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
    map: {
        width: '100%',
        height: '100%',
    },

});

export default EventDetailModal;
