import React, { useState } from 'react';
import { Modal, View, Text, TouchableOpacity, ScrollView, StyleSheet, Button, Alert, TextInput, Platform, ActivityIndicator } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Float } from 'react-native/Libraries/Types/CodegenTypes';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createEvent } from '@/apiCalls/createEvent';
import { useEventContext } from '@/context/eventContext';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { useLocation } from '@/hooks/useLocation';


interface Event {
    name: string;
    date: Date;
    latitude: Float;
    longitude: Float;
    description: string;
    maxParticipants: number;
    currentParticipants: number;
    rating: number;
    userId: number;
};

interface EventCreationModalProps {
    isModalVisible: boolean;
    onClose: () => void;
}

const EventCreationModal: React.FC<EventCreationModalProps> = ({
    isModalVisible,
    onClose,
}) => {

    const [datePickerVisible, setDatePickerVisible] = useState(false);
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [fecha, setFecha] = useState('');
    const [maxParticipants, setMaxParticipants] = useState(0);
    const [eventAssLocation, setEventAssLocation] = useState<string | null>(null);
    const [titulo, setTitulo] = useState('');
    const [descripcion, setDescripcion] = useState('');
    const [ubicacion, setUbicacion] = useState('');
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedLocation, setSelectedLocation] = useState<{ latitude: number; longitude: number } | null>(null);
    const [selectedLatitude, setLatitude] = useState<number | null>(null);
    const [selectedLongitude, setLongitude] = useState<number | null>(null);
    const { refreshEvents } = useEventContext();
    const { location, locationError } = useLocation();
    const [errorMessageTitle, setErrorMessageTitle] = useState('');
    const [errorMessageDescription, setErrorMessageDescription] = useState('');
    const [errorMessageParticipants, setErrorMessageParticipants] = useState('');
    const [errorMessageDate, setErrorMessageDate] = useState('');
    const [isCreationLoading, setIsCreationLoading] = useState(false);



    const resetEvetCreationInfo = () => {
        setTitulo('');
        setDescripcion('');
        setFecha('');
        setUbicacion('');
        setMaxParticipants(0);
        setSelectedLocation(null);
        setLatitude(null);
        setLongitude(null);
        setEventAssLocation(null);
        setSelectedDate(null);
    };

    const showDatePicker = () => {
        setDatePickerVisible(true);
    };

    const createNewEvent = async function createNewEvent() {
        if (!titulo || !descripcion || !selectedDate || !selectedLocation || maxParticipants <= 0) {
            Alert.alert('Error', 'Por favor, complete todos los campos.');
            return;
        }
        try {
            setIsCreationLoading(true);
            const currentUserId = await AsyncStorage.getItem('userId');
            const event: Event = {
                name: titulo,
                date: selectedDate,
                latitude: selectedLatitude ?? 0,
                longitude: selectedLongitude ?? 0,
                description: descripcion,
                maxParticipants: maxParticipants,
                rating: 0,
                currentParticipants: 0,

                userId: currentUserId ? parseInt(currentUserId, 10) : 0,
            };
            await createEvent(event);
            resetEvetCreationInfo();
            setIsCreationLoading(false);
            refreshEvents();
            onClose();

            
        } catch (error) {
            refreshEvents();
        }
    };

    const handleMapPress = async (event: { nativeEvent: { coordinate: { latitude: number; longitude: number; }; }; }) => {
        const { latitude, longitude } = event.nativeEvent.coordinate;
        setSelectedLocation({ latitude, longitude });
        setLatitude(latitude);
        setLongitude(longitude);
        setUbicacion(`${latitude},${longitude}`);
        //setModalVisible(false);
        const addresses = await Location.reverseGeocodeAsync({
            latitude: latitude,
            longitude: longitude,
        });

        const location =
            addresses.length > 0
                ? `${addresses[0].city}, ${addresses[0].region}, ${addresses[0].country}`
                : 'Address not found';

        setEventAssLocation(location);



    };


    const confirmLocationSelection = () => {
        if (!selectedLocation) {
            Alert.alert("Error", "Por favor, selecciona una ubicación antes de confirmar.");
            return;
        }
        setModalVisible(false);

    };
    const handleEventTitleChange = (text: string) => {
        if (text.length <= 30) {
            setTitulo(text);
            setErrorMessageTitle('');
        }
        else {
            setErrorMessageTitle('El nombre de usuario no puede tener más de 30 caracteres');
        }
    };

    const handleDescriptionChange = (text: string) => {
        if (text.length <= 100) {
            setDescripcion(text);
            setErrorMessageDescription('');
        }
        else {
            setErrorMessageDescription('La descripcion no puede tener más de 100 caracteres');
        }
    };


    const handleDateChange = (event: any, date?: Date) => {
        setDatePickerVisible(false);

        if (date && date >= new Date()) {
            setSelectedDate(date);
            setFecha(date.toLocaleDateString());
            setErrorMessageDate('');
        }
        else {
            setErrorMessageDate('Seleccione una fecha válida');
        }

    };

    const handleMaxParticipantsChange = (text: string) => {
        const numericValue = parseInt(text, 10);
        if (numericValue < 0) {
            setErrorMessageParticipants('El número máximo de participantes no puede ser negativo');
            return;
        }
        if (numericValue > 100) {
            setErrorMessageParticipants('El número máximo de participantes no puede ser mayor a 100');
            return;
        }
        setMaxParticipants(isNaN(numericValue) ? 0 : numericValue);
        setErrorMessageParticipants('');
    };
    if (isCreationLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#007AFF" />
                <Text style={styles.loadingText}>Creando nuevo evento...</Text>
            </View>
        );
    }







    return (
        <Modal visible={isModalVisible} animationType="slide">
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <Text style={styles.title}>Crear Evento</Text>


                {/* Event Title */}
                <View style={styles.section}>
                    <Text style={styles.label}>Título del Evento</Text>
                    <TextInput
                        style={styles.input}
                        value={titulo}
                        onChangeText={handleEventTitleChange}
                        placeholder="Ingrese el título del evento"
                        placeholderTextColor="#A9A9A9"
                    />
                    {errorMessageTitle ? <Text style={styles.errorMessage}>{errorMessageTitle}</Text> : null}
                </View>

                {/* Description */}
                <View style={styles.section}>
                    <Text style={styles.label}>Descripción</Text>
                    <TextInput
                        style={styles.input}
                        value={descripcion}
                        onChangeText={handleDescriptionChange}
                        placeholder="Ingrese la descripción del evento"
                        placeholderTextColor="#A9A9A9"
                        multiline
                    />
                    {errorMessageDescription ? <Text style={styles.errorMessage}>{errorMessageDescription}</Text> : null}
                </View>

                {/* Maximum Participants */}
                <View style={styles.section}>
                    <Text style={styles.label}>Número Máximo De Participantes</Text>
                    <TextInput
                        style={styles.input}
                        value={maxParticipants.toString()}
                        onChangeText={handleMaxParticipantsChange}
                        placeholder="Ingrese el número máximo de participantes"
                        placeholderTextColor="#A9A9A9"
                        keyboardType="numeric"
                    />
                    {errorMessageParticipants ? <Text style={styles.errorMessage}>{errorMessageParticipants}</Text> : null}
                </View>

                {/* Event Date */}
                <View style={styles.section}>
                    <Text style={styles.label}>Fecha</Text>
                    <TouchableOpacity onPress={showDatePicker}>
                        <TextInput
                            style={styles.input}
                            value={fecha}
                            placeholder="Seleccione la fecha del evento"
                            placeholderTextColor="#A9A9A9"
                            editable={false}
                        />
                    </TouchableOpacity>
                    {datePickerVisible && Platform.OS === 'ios' && (
                        <Modal transparent animationType="slide" visible={datePickerVisible}>
                            <View style={styles.datePickerContainer}>
                                <View style={styles.datePicker}>
                                    <DateTimePicker
                                        value={selectedDate || new Date()}
                                        mode="date"
                                        display="inline"
                                        onChange={handleDateChange}
                                    />
                                    <TouchableOpacity
                                        style={styles.button}
                                        onPress={() => setDatePickerVisible(false)}
                                    >
                                        <Text style={styles.buttonText}>Confirmar</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </Modal>
                    )}
                    {datePickerVisible && Platform.OS !== 'ios' && (
                        <DateTimePicker
                            value={selectedDate || new Date()}
                            mode="date"
                            display="default"
                            onChange={handleDateChange}
                        />
                    )}
                    {errorMessageDate ? <Text style={styles.errorMessage}>{errorMessageDate}</Text> : null}
                </View>

                {/* Location */}
                <View style={styles.section}>
                    <Text style={styles.label}>Ubicación</Text>
                    <TextInput
                        style={styles.input}
                        value={eventAssLocation ?? ''}
                        onChangeText={setUbicacion}
                        placeholder="Ingrese la ubicación del evento"
                        placeholderTextColor="#A9A9A9"
                    />
                    <TouchableOpacity
                        style={styles.button}
                        onPress={() => setModalVisible(true)}
                    >
                        <Text style={styles.buttonText}>Seleccionar en el mapa</Text>
                    </TouchableOpacity>
                </View>

                {/* Buttons */}
                <View style={styles.modalButtonContainer}>
                    <TouchableOpacity style={styles.buttonCreate} onPress={createNewEvent}>
                        <Text style={styles.buttonText}>Crear Evento</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.buttonClose}
                        onPress={() => {
                            onClose();
                            resetEvetCreationInfo();
                        }}
                    >
                        <Text style={styles.buttonText}>Cerrar</Text>
                    </TouchableOpacity>
                </View>

                {/* Map Modal */}
                <Modal visible={modalVisible} animationType="slide" transparent>
                    <View style={styles.mapModalContainer}>
                        <View style={styles.mapHeader}>
                            <Text style={styles.mapTitle}>Seleccionar Ubicación</Text>
                            <Text style={styles.mapDescription}>
                                Toque el mapa para seleccionar la ubicación del evento.
                            </Text>
                        </View>

                        {location ? (
                            <MapView
                                style={styles.enhancedMap}
                                initialRegion={{
                                    latitude: location.coords.latitude,
                                    longitude: location.coords.longitude,
                                    latitudeDelta: 0.01,
                                    longitudeDelta: 0.01,
                                }}
                                onPress={handleMapPress}
                            >
                                {selectedLocation && (
                                    <Marker coordinate={selectedLocation} pinColor="#FF7F50" />
                                )}
                            </MapView>
                        ) : (
                            <View style={styles.loadingMapContainer}>
                                <ActivityIndicator size="large" color="#FF7F50" />
                                <Text style={styles.loadingMapText}>Cargando mapa...</Text>
                            </View>
                        )}

                        <View style={styles.mapActionButtons}>
                            <TouchableOpacity
                                style={styles.confirmButton}
                                onPress={confirmLocationSelection}
                            >
                                <Text style={styles.confirmButtonText}>Confirmar</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.cancelButton}
                                onPress={() => setModalVisible(false)}
                            >
                                <Text style={styles.cancelButtonText}>Cancelar</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>
            </ScrollView>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modal: {
        flex: 1,
        backgroundColor: '#F9F9F9',
        paddingHorizontal: 20,
        paddingVertical: 10,
    },
    scrollContainer: {
        flexGrow: 1,
        paddingBottom: 30,
    },
    title: {
        fontSize: 32, // Larger font size
        fontWeight: 'bold', // Make it bold
        textAlign: 'center', // Center-align the text
        marginTop: 20, // Add top margin for spacing
        marginBottom: 20, // Add bottom margin to separate from other elements
        color: '#1A237E', // Deep navy blue color
        textTransform: 'uppercase', // Uppercase for a more dynamic look
        letterSpacing: 1, // Add spacing between letters for a modern look
    },
    section: {
        backgroundColor: '#FFFFFF',
        padding: 16,
        marginVertical: 10,
        borderRadius: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 4,
    },
    label: {
        fontSize: 16,
        fontWeight: '500',
        color: '#FF7F50',
        marginBottom: 8,
    },
    input: {
        fontSize: 16,
        padding: 12,
        backgroundColor: '#F4F4F4',
        borderRadius: 12,
        color: '#333',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
        marginBottom: 10,
    },
    button: {
        backgroundColor: '#FF7F50',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.15,
        shadowRadius: 5,
        elevation: 3,
        marginVertical: 10,
    },
    buttonCreate: {
        backgroundColor: 'green',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.15,
        shadowRadius: 5,
        elevation: 3,
        marginVertical: 10,
    },
    buttonClose: {
        backgroundColor: 'red',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.15,
        shadowRadius: 5,
        elevation: 3,
        marginVertical: 10,
    },
    buttonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    modalButtonContainer: {
        marginTop: 20,
    },
    map: {
        width: '100%',
        height: 300,
        borderRadius: 16,
        overflow: 'hidden',
        marginTop: 10,
    },
    datePickerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    datePicker: {
        backgroundColor: '#FFF',
        padding: 20,
        borderRadius: 16,
        width: '90%',
    },
    mapModalContainer: {
        flex: 1,
        backgroundColor: '#F9F9F9',
        justifyContent: 'space-between',
    },
    mapHeader: {
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 10,
        backgroundColor: '#FF7F50',
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
    },
    mapTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#fff',
        textAlign: 'center',
    },
    mapDescription: {
        fontSize: 14,
        color: '#fff',
        textAlign: 'center',
        marginTop: 5,
    },
    searchBarContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: 20,
        marginTop: 10,
    },
    searchBar: {
        flex: 1,
        backgroundColor: '#fff',
        borderRadius: 8,
        padding: 10,
        fontSize: 14,
        color: '#333',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 2,
    },
    searchButton: {
        backgroundColor: '#FF7F50',
        borderRadius: 8,
        marginLeft: 10,
        paddingVertical: 10,
        paddingHorizontal: 15,
    },
    searchButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: 'bold',
    },
    enhancedMap: {
        flex: 1,
        margin: 20,
        borderRadius: 15,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 4,
    },
    loadingMapContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingMapText: {
        marginTop: 10,
        fontSize: 14,
        color: '#666',
    },
    mapActionButtons: {
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        paddingVertical: 15,
        paddingHorizontal: 20,
        backgroundColor: '#F9F9F9',
    },
    confirmButton: {
        backgroundColor: '#FF7F50',
        borderRadius: 10,
        paddingVertical: 12,
        paddingHorizontal: 20,
    },
    confirmButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    cancelButton: {
        backgroundColor: '#ccc',
        borderRadius: 10,
        paddingVertical: 12,
        paddingHorizontal: 20,
    },
    cancelButtonText: {
        color: '#333',
        fontSize: 16,
        fontWeight: 'bold',
    },
    errorMessage: {
        color: 'red',
        fontSize: 14,
        textAlign: 'center',
        marginBottom: 10,
    },
    loadingContainer: {
        flex: 1,
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,

        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F4F4F4',
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: '#333',
    },
});

export default EventCreationModal;


