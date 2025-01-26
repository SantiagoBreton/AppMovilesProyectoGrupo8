import React, { useEffect, useState } from 'react';
import { Modal, View, Text, TouchableOpacity, TouchableWithoutFeedback, StyleSheet, Alert, Image } from 'react-native';
import MapView, { Circle } from 'react-native-maps';
import { Float } from 'react-native/Libraries/Types/CodegenTypes';
import { subscribeToEvent } from '@/apiCalls/subscribeToAnEvent';
import { useEventContext } from '@/context/eventContext';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getHostInfoByEventId } from '@/apiCalls/getHostInfoByEventId';
import { getUserDataById } from '@/apiCalls/getUserDataById';
import { getUserProfileImage } from '@/apiCalls/getUserProfileImage';

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
    showSuscribe: boolean;
    eventDetails: CustomEvent | null;
    onClose: () => void;
}
interface User {
    id: number;
    name: string;
    email: string;
    rating: Float;
};

const EventDetailModal: React.FC<EventDetailModalProps> = ({
    visible,
    showSuscribe,
    eventDetails,
    onClose,

}) => {
    const { refreshEvents } = useEventContext();
    const [isMapVisible, setMapVisible] = useState(false);
    const [eventLocation, setEventLocation] = useState<string | null>(null);
    const [userId, setUserId] = useState<number | null>(null);
    const [hostInfo, setHostInfo] = useState<User | null>(null);
    const [seeUser, setSeeUser] = useState<User | null>(null);
    const [isSpectatedUserVisible, setIsSpectatedUserVisible] = useState(false);
    const [userImages, setUserImages] = useState<{ [key: number]: string }>({});

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

        const fetchHostInfo = async () => {
            if (eventDetails) {
                try {
                    const updatedImages: { [key: number]: string } = {};
                    const hostId = await getHostInfoByEventId(eventDetails.id);
                    if (hostId && hostId.data) {
                        const hostData = await getUserDataById(hostId.data.user.id);
                        setHostInfo(hostData);
                        const { data } = await getUserProfileImage(hostId.data.user.id);
                        updatedImages[hostId.data.user.id] = data?.imageUrl || 'default_image_url';
                        setUserImages(updatedImages);
                    }
                } catch (error) {
                    console.error('Error fetching host info:', error);
                }
            }
        };

        fetchLocation();
        fetchHostInfo();
    }, [eventDetails]);

    if (!eventDetails) return null;

    const handleCloseMap = () => setMapVisible(false);

    const handleSubscribe = async (eventId: number) => {
        try {
            await subscribeToEvent(eventId);
            Alert.alert('Subscribed', 'You have successfully subscribed to the event');
            onClose();
            refreshEvents();
        } catch (error: any) {
            Alert.alert('Error subscribing to event:', error.message);
        }
    };

    const handleSeeUserProfile = (user: { id: number; name: string; email: string; rating: number }) => {
        setSeeUser(user)
        setIsSpectatedUserVisible(true);
    }

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
                            <View style={styles.modalSection}>
                                <Text style={styles.modalLabel}>Host del evento:</Text>
                                {hostInfo && (
                                    <View key={hostInfo.id} style={styles.userCard}>
                                        <TouchableOpacity onPress={() => handleSeeUserProfile(hostInfo)}>
                                            <Image
                                                source={{
                                                    uri: userImages[hostInfo.id] || 'default_image_url',
                                                }}
                                                style={styles.profilePicture}
                                            />
                                        </TouchableOpacity>
                                        <View style={styles.userInfo}>
                                            <TouchableOpacity onPress={() => handleSeeUserProfile(hostInfo)}>
                                                <Text style={styles.userName}>{hostInfo.name}</Text>
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                )}
                            </View>
                            <TouchableOpacity
                                style={[styles.modalActionButton, styles.largeButton]}
                                onPress={() => setMapVisible(true)}
                            >
                                <Text style={styles.modalActionButtonText}>Ver en el Mapa</Text>
                            </TouchableOpacity>

                            <View style={styles.buttonRow}>
                                {showSuscribe && (
                                    <TouchableOpacity
                                        style={[styles.modalActionButton, styles.subscribeButton]}
                                        onPress={() => { handleSubscribe(eventDetails.id) }}
                                    >
                                        <Text style={styles.modalActionButtonText} numberOfLines={1}>Suscribirse</Text>
                                    </TouchableOpacity>
                                )}
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
                            <Circle
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
    userCard: {
        flexDirection: 'row', // Align image and info in a row
        alignItems: 'center',
        marginBottom: 15,
        borderRadius: 8,
        backgroundColor: '#f8f8f8',
        padding: 10,
        elevation: 2, // Add a slight shadow
    },
    userInfo: {
        flexDirection: 'column', // Align name and button vertically
        flex: 1, // Take up available space next to the image
    },
    userName: {
        fontSize: 18,
        color: '#333',
        marginBottom: 5, // Space between name and button
    },
    profilePicture: {
        width: 50,
        height: 50,
        borderRadius: 25,
        marginRight: 15,
    },
});

export default EventDetailModal;
