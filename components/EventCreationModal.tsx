import React, { useState } from 'react';
import { Modal, View, Text, TouchableOpacity, ScrollView, StyleSheet, Button, Alert, TextInput, Platform } from 'react-native';
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
    userId: number;
};
interface User {
    id: number;
    name: string;
    email: string;
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

    const handleDateChange = (event: any, date?: Date) => {
        setDatePickerVisible(false);

        if (date && date >= new Date()) {
            setSelectedDate(date);
            setFecha(date.toLocaleDateString());
        }
        else {
            setSelectedDate(null);
            Alert.alert('Error', 'Por favor, seleccione una fecha válida.');
        }
    };

    const handleMaxParticipantsChange = (text: string) => {
        const numericValue = parseInt(text, 10);
        setMaxParticipants(isNaN(numericValue) ? 0 : numericValue);
    };

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
            const currentUserId = await AsyncStorage.getItem('userId');
            const event: Event = {
                name: titulo,
                date: selectedDate,
                latitude: selectedLatitude ?? 0,
                longitude: selectedLongitude ?? 0,
                description: descripcion,
                maxParticipants: maxParticipants,
                currentParticipants: 0,
                userId: currentUserId ? parseInt(currentUserId, 10) : 0,
            };
            await createEvent(event);
            resetEvetCreationInfo();

            refreshEvents();
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
            setModalVisible(false);
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

    return (
        <Modal visible={isModalVisible} animationType="slide">
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <Text style={styles.title}>Crear Evento</Text>
                <View style={styles.section}>
                    <Text style={styles.label}>Título del Evento</Text>
                    <TextInput
                        style={styles.input}
                        value={titulo}
                        onChangeText={setTitulo}
                        placeholder="Ingrese el título del evento"
                        placeholderTextColor="#A9A9A9"
                    />
                </View>
                <View style={styles.section}>
                    <Text style={styles.label}>Descripción</Text>
                    <TextInput
                        style={styles.input}
                        value={descripcion}
                        onChangeText={setDescripcion}
                        placeholder="Ingrese la descripción del evento"
                        placeholderTextColor="#A9A9A9"
                    />
                </View>
                <View style={styles.section}>
                    <Text style={styles.label}>Número Máximo De Participantes</Text>
                    <TextInput
                        style={styles.input}
                        value={maxParticipants.toString()} // Convert the number to a string for TextInput
                        onChangeText={handleMaxParticipantsChange}
                        placeholder="Ingrese el número máximo de participantes"
                        placeholderTextColor="#A9A9A9"
                        keyboardType="numeric" // This shows a numeric keyboard for input
                    />
                </View>
                <View style={styles.section}>
                    <Text style={styles.label}>Fecha</Text>
                    <TouchableOpacity onPress={showDatePicker}>
                        <TextInput
                            style={styles.input}
                            value={fecha}
                            placeholder="Ingrese la fecha del evento"
                            placeholderTextColor="#A9A9A9"
                            editable={false} // Disable manual editing
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
                                    <Button
                                        title="Confirmar"
                                        onPress={() => setDatePickerVisible(false)}
                                        color="#FF7F50"
                                    />
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
                </View>
                <View style={styles.section}>
                    <Text style={styles.label}>Ubicación</Text>
                    <TextInput
                        style={styles.input}
                        value={eventAssLocation ?? ''}
                        onChangeText={setUbicacion}
                        placeholder="Ingrese la ubicación del evento"
                        placeholderTextColor="#A9A9A9"
                    />
                    <Button
                        title="Seleccionar en el mapa"
                        onPress={() => setModalVisible(true)}
                        color="#FF7F50"
                    />
                </View>

                {/* Botones con marginTop para separación */}
                <View style={styles.modalButtonContainer}>
                    <Button title="Crear Evento" onPress={createNewEvent} color="#FF7F50" />
                    <Button
                        title="Cerrar"
                        onPress={() => {
                            onClose();
                            resetEvetCreationInfo();
                        }}
                        color="#FF7F50"
                    />
                </View>

                <Modal visible={modalVisible} animationType="slide">
                    {location ? (
                        <MapView
                            style={styles.map}
                            initialRegion={{
                                latitude: location.coords.latitude,
                                longitude: location.coords.longitude,
                                latitudeDelta: 0.01,
                                longitudeDelta: 0.01,
                            }}
                            onPress={handleMapPress}
                        >
                            {selectedLocation && <Marker coordinate={selectedLocation} />}
                        </MapView>
                    ) : (
                        <Text>Cargando mapa...</Text>
                    )}
                    <Button
                        title="Cerrar"
                        onPress={() => setModalVisible(false)}
                        color="#FF7F50"
                    />
                </Modal>
            </ScrollView>
        </Modal>
    );
};

const styles = StyleSheet.create({
    header3: {
        alignItems: 'center',
        paddingBottom: 5,
        backgroundColor: '#F9F9F9',
    },
    name: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
    },
    closeButton2: {
        position: 'absolute',
        top: 8,
        right: 8,
        padding: 8,
    },
    container: {
        flex: 1,
        backgroundColor: '#F9F9F9',
        paddingHorizontal: 16,
        paddingVertical: 10,
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
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#FF7F50',
        marginBottom: 16,
        textAlign: 'center',
    },
    eventHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start', // Aligns content at the top
        flexWrap: 'wrap', // Allows wrapping to the next line when necessary
        marginBottom: 8,
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
        flex: 1, // Allow the event name to take up the available space
        marginRight: 8, // Adds space between the event name and the date
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
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: '#333',
    },
    modalButtonContainer: {
        flexDirection: 'column',  // Aseguramos que los botones estén uno encima del otro
        marginTop: 20,  // Separa los botones entre sí
        paddingHorizontal: 20, // Añadir espacio en los laterales
    },
    map: {
        width: '100%',
        height: '100%',
    },
    datePickerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)', // Dim background
    },
    datePicker: {
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 20,
        width: '90%',
    },
    scrollContainer: {
        flexGrow: 1, // Ensures the content stretches vertically
        paddingBottom: 20, // Optional: Add bottom padding for better spacing when scrolling
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#FF7F50',
        textAlign: 'center',
        marginBottom: 20,
    },
});

export default EventCreationModal;