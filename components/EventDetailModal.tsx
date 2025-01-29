import React, { useEffect, useState } from 'react';
import { Modal, View, Text, TouchableOpacity, TouchableWithoutFeedback, StyleSheet, Image, ActivityIndicator } from 'react-native';
import MapView, { Circle } from 'react-native-maps';
import { Float } from 'react-native/Libraries/Types/CodegenTypes';
import { subscribeToEvent } from '@/apiCalls/subscribeToAnEvent';
import { useEventContext } from '@/context/eventContext';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getHostInfoByEventId } from '@/apiCalls/getHostInfoByEventId';
import { getUserDataById } from '@/apiCalls/getUserDataById';
import { getUserProfileImage } from '@/apiCalls/getUserProfileImage';
import SpectatedUserModal from './SpectatedUserModal';
import { StarRating } from '@/components/StarRating';
import ConfirmationModal from './ConfirmationModal';
import SuccessModal from './SuccesModal';
import ErrorModal from './ErrorModal';
import LottieView from 'lottie-react-native';

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

interface EventDetailModalProps {
    visible: boolean;
    eventDetails: CustomEvent | null;
    onClose: () => void;
}

interface User {
    id: number;
    name: string;
    email: string;
    rating: Float;
    description: string;
};

const EventDetailModal: React.FC<EventDetailModalProps> = ({
    visible,
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
    const [isLoading, setIsLoading] = useState(true);
    const [isConfirmationVisible, setIsConfirmationVisible] = useState(false);
    const [isSuccessVisible, setIsSuccessVisible] = useState(false);
    const showSuscribe = userId !== eventDetails?.userId;
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
                        setIsLoading(false);
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
    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <LottieView
                    source={require('../assets/laoding/loadingAn.json')} // Replace with your Lottie JSON file
                    autoPlay
                    loop
                    style={styles.lottieAnimation}
                />
                <Text style={styles.loadingText}>Cargando...</Text>
            </View>
        );
    }


    const handleCloseMap = () => setMapVisible(false);

    const handleSubscribe = async (eventId: number) => {
        try {

            await subscribeToEvent(eventId);
            setIsSuccessVisible(true);
            //onClose();
            refreshEvents();
        } catch (error: any) {
            setErrorMessage(error.response.data.message);
            setIsErrorModalVisible(true);
        }
    };

    const handleSeeUserProfile = (user: { id: number; name: string; email: string; rating: number; description: string }) => {
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
                                <Text style={styles.modalLabel}>Categoría:</Text>
                                <Text style={styles.modalText}>{eventDetails.category.name}</Text>
                            </View>
                            <View style={styles.modalSection}>
                                <Text style={styles.modalLabel}>Fecha:</Text>
                                <Text style={styles.modalText}>
                                    {new Date(eventDetails.date).toLocaleDateString()}
                                </Text>
                            </View>
                            <View style={styles.modalSection}>
                                <Text style={styles.modalLabel}>Hora:</Text>
                                <Text style={styles.modalText}>{eventDetails.time}</Text>
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
                                            <TouchableOpacity onPress={() => handleSeeUserProfile(hostInfo)} style={styles.userInfoRow}>
                                                <Text style={styles.userName}>{hostInfo.name}</Text>
                                                <StarRating rating={hostInfo.rating || 0} size={16} />
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
                                        onPress={() => { setIsConfirmationVisible(true) }}
                                    >
                                        <Text style={styles.modalActionButtonText} numberOfLines={1}>Quiero ir!</Text>
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
            <SpectatedUserModal
                isVisible={isSpectatedUserVisible}
                user={seeUser}
                onClose={() => setIsSpectatedUserVisible(false)}
            />
            <ConfirmationModal
                visible={isConfirmationVisible}
                title="Confirmar"
                message="¿Estás seguro de que deseas suscribirte a este evento?"
                onConfirm={() => handleSubscribe(eventDetails.id)}
                onCancel={() => setIsConfirmationVisible(false)}
            />
            <SuccessModal
                visible={isSuccessVisible}
                message="Te has suscrito al evento con éxito!"
                onClose={() => {setIsSuccessVisible(false);onClose()}}
            />
            <ErrorModal
                visible={isErrorModalVisible}
                title="Error"
                message={errorMessage}
                onClose={() => setIsErrorModalVisible(false)}
            />
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
    lottieAnimation: {
        width: 120,
        height: 120,
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
        backgroundColor: '#dc2626',
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
        maxWidth: '59%', // Limit the width of the name
    },
    profilePicture: {
        width: 50,
        height: 50,
        borderRadius: 25,
        marginRight: 15,
    },
    text: {
        marginLeft: 10,
        fontSize: 14,
        color: '#333',
    },
    userInfoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    loadingContainer: {
        position: 'absolute',
        alignSelf: 'center',
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.7)',  // Slight transparency to show loading over content
        zIndex: 9999,  // Makes sure this layer is above other components
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: '#333',
    },
});

export default EventDetailModal;
