import React, { useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet, FlatList, Modal, TextInput, ScrollView, TouchableOpacity, Alert, Platform } from 'react-native';
import * as Location from 'expo-location';
import AsyncStorage from "@react-native-async-storage/async-storage";
import MapView, { Marker, Region } from 'react-native-maps';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Float } from 'react-native/Libraries/Types/CodegenTypes';
import { useLocation } from '../hooks/useLocation';
import { unsubscribeUserFromAnEvent } from '@/apiCalls/unsubscribeUserFromEvent';
import { myEvents } from '@/apiCalls/myEvents';
import { deleteEventById } from '@/apiCalls/deleteEventById';
import { useEventContext } from '@/context/eventContext';
import { createEvent } from '@/apiCalls/createEvent';
import { getSubscribedEvents } from '@/apiCalls/getSubscribedEvents';
import { getAllUsersSubscribedToAnEvent } from '@/apiCalls/getAllUsersSubscribedToAnEvent';
import { updateEvent } from '@/apiCalls/updateEvent';


export default function CreacionEvento() {
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [titulo, setTitulo] = useState('');
    const [descripcion, setDescripcion] = useState('');
    const [fecha, setFecha] = useState('');
    const [ubicacion, setUbicacion] = useState('');
    const [datePickerVisible, setDatePickerVisible] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedLocation, setSelectedLocation] = useState<{ latitude: number; longitude: number } | null>(null);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [maxParticipants, setMaxParticipants] = useState(0);
    const [selectedLatitude, setLatitude] = useState<number | null>(null);
    const [selectedLongitude, setLongitude] = useState<number | null>(null);
    const [selectedView, setSelectedView] = useState('inscritos'); // 'inscritos' o 'creados'
    const { refreshEvents } = useEventContext();
    const { location, locationError } = useLocation();
    const [isDetailsModalVisible, setIsDetailsModalVisible] = useState(false);
    const [eventDetails, setEventDetails] = useState<Event | null>(null);
    const [eventLocation, setEventLocation] = useState<string | null>(null);
    const { trigger } = useEventContext();
    const [isMapVisible, setMapVisible] = useState(false);
    const allevents = getSubscribedEvents(trigger);
    const myUserEvents = myEvents(trigger); // Call myEvents and store the result directly in the variable
    const eventsToDisplay = selectedView === 'inscritos' ? allevents.events : myUserEvents.myEvents;
    const [isAdminModalVisible, setIsAdminModalVisible] = useState(false);
    const [adminEventDetails, setAdminEventDetails] = useState<EventWithId | null>(null);
    const [subscribedUsers, setSubscribedUsers] = useState<{ id: number; name: string }[]>([]);

    const [isUpdateNameModalVisible, setIsNameModalVisible] = useState(false);
    const [isUpdateDescriptionModalVisible, setIsDescriptionModalVisible] = useState(false);
    const [newName, setNewName] = useState('');
    const [newDescription, setNewDescription] = useState('');



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


    const showDatePicker = () => {
        setDatePickerVisible(true);
    };

    const handleShowMap = () => setMapVisible(true);

    const handleCloseMap = () => setMapVisible(false);

    const handleDateChange = (event: any, date?: Date) => {
        setDatePickerVisible(false);

        if (date) {
            setSelectedDate(date);
            setFecha(date.toLocaleDateString());

        }
    };

    const handleMapPress = (event: { nativeEvent: { coordinate: { latitude: number; longitude: number; }; }; }) => {
        const { latitude, longitude } = event.nativeEvent.coordinate;
        setSelectedLocation({ latitude, longitude });
        setLatitude(latitude);
        setLongitude(longitude);
        setUbicacion(`${latitude},${longitude}`);
        setModalVisible(false);
    };

    const handleMaxParticipantsChange = (text: string) => {
        const numericValue = parseInt(text, 10);
        setMaxParticipants(isNaN(numericValue) ? 0 : numericValue);
    };

    const handleDetailsEvent = async (item: Event) => {
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

    const handleEventUpdate = async () => {
        try {
            console.log(`newName: ${newName}, newDescription: ${newDescription}, selectedDate: ${selectedDate}`);
    
            // Fallback to default values if inputs are empty
            const updatedName = newName || adminEventDetails?.name || '';
            const updatedDescription = newDescription || adminEventDetails?.description || '';
            const updatedDate = selectedDate || adminEventDetails?.date || new Date();
    
            console.log(`updatedName: ${updatedName}, updatedDescription: ${updatedDescription}, updatedDate: ${updatedDate}`);
    
            // Call the update function with the resolved values
            await updateEvent(adminEventDetails?.id ?? 0, updatedName, updatedDescription, updatedDate);
    
            // Refresh and reset
            refreshEvents();
            setNewName('');
            setNewDescription('');
            setSelectedDate(new Date());
            setIsAdminModalVisible(false); 
    
            Alert.alert('Éxito', 'El evento se actualizó.');
        } catch (error) {
            console.error('Error updating event:', error);
            Alert.alert('Error', 'No se pudo actualizar el evento.');
        }
    };
    

    const createNewEvent = async function createNewEvent() {
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
            setIsModalVisible(false);
            refreshEvents();
        } catch (error) {
            setIsModalVisible(false);
            refreshEvents();
        }
    };

    const switchView = (view: string) => {
        setSelectedView(view);
    };

    const handleEventPress = (event: EventWithId) => {
        // Aquí puedes navegar a la pantalla de detalles del evento
        Alert.alert('Detalles del Evento', `Nombre: ${event.name}\nDescripción: ${event.description}`);
    };
    const handleAdministrarEvent = async (event: EventWithId) => {
        try {
            const allSubscribedUser = await getAllUsersSubscribedToAnEvent(event.id);

            if (allSubscribedUser.data) {
                setSubscribedUsers(allSubscribedUser.data);
            } else {
                Alert.alert('Error', 'No se pudo cargar la información de los usuarios inscritos.');
            }
            setAdminEventDetails(event);
            setIsAdminModalVisible(true);
        } catch (error) {
            Alert.alert('Error', 'No se pudo cargar la información del evento.');
        }
    };

    const handleEliminateUserFromEvent = async (userId: number, eventId: number) => {
        try {
            await unsubscribeUserFromAnEvent(userId, eventId);
            Alert.alert('Éxito', 'Usuario eliminado del evento correctamente.');
            setSubscribedUsers((prevUsers) => prevUsers.filter((user) => user.id !== userId));
            refreshEvents();
        } catch (error) {
            Alert.alert('Error', 'No se pudo eliminar al usuario del evento.');
        }
    }
        ;

   
    const handleDeleteEvent = (eventId: any) => {
        deleteEventById(eventId)
        refreshEvents();
        Alert.alert('Eliminar Evento', `Eliminar el evento con id: ${eventId}`);
    };

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Mis Eventos</Text>

            {/* Botones para cambiar la vista */}
            <View style={styles.buttonContainer}>
                <View style={styles.buttonWrapper}>
                    <Button
                        title="Eventos a los que me Inscribí"
                        onPress={() => switchView('inscritos')}
                        color={selectedView === 'inscritos' ? '#FF7F50' : '#A9A9A9'} // Naranja para seleccionado, gris claro para no seleccionado
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

            {/* Lista de eventos */}
            <FlatList
            data={eventsToDisplay}
            renderItem={({ item }) => (
                <TouchableOpacity
                    style={styles.eventCard}
                    onPress={() => handleEventPress(item)}
                >
                    <Text style={styles.eventName}>{item.name}</Text>
                    <Text>
                        {item.date ? new Date(item.date).toLocaleDateString() : 'Fecha no disponible'}
                    </Text>
                    <Text>{item.description}</Text>

                    {userId !== null && item.userId === userId && (
                        <View style={styles.actionButtons}>
                            <Button title="Administar" onPress={() => { handleAdministrarEvent(item) }} />
                            <Button 
                                title="Eliminar" 
                                onPress={() => handleDeleteEvent(item.id)} 
                                color="#f44336" // Red color
                            />
                        </View>
                    )}
                    {userId !== null && item.userId != userId && (
                        <View style={styles.detailButton}>
                            <Button title="Detalles" onPress={() => handleDetailsEvent(item)} />
                        </View>
                    )}
                </TouchableOpacity>
            )}
            keyExtractor={(item) => item.id.toString()}
        />



            {/* Botón para abrir el modal de creación de evento */}
            <Button
                title="Crear Evento"
                onPress={() => setIsModalVisible(true)}
                color="#FF7F50"
            />
            <Modal visible={isModalVisible} animationType="slide">
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
                    <Text style={styles.label}>Numero Maximo De Participantes</Text>
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
                    {datePickerVisible && (
                        <DateTimePicker
                            value={selectedDate}
                            mode="date"
                            display={Platform.OS === 'ios' ? 'inline' : 'default'}
                            onChange={handleDateChange}
                        />
                    )}
                </View>
                <View style={styles.section}>
                    <Text style={styles.label}>Ubicación</Text>
                    <TextInput
                        style={styles.input}
                        value={ubicacion}
                        onChangeText={setUbicacion}
                        placeholder="Ingrese la ubicación del evento"
                        placeholderTextColor="#A9A9A9"
                    />
                    <Button title="Seleccionar en el mapa" onPress={() => setModalVisible(true)} color="#FF7F50" />
                </View>
                
                {/* Botones con marginTop para separación */}
                <View style={styles.modalButtonContainer}>
                    <Button title="Crear Evento" onPress={createNewEvent} color="#FF7F50" />
                    <Button title="Cerrar" onPress={() => setIsModalVisible(false)} color="#FF7F50" />
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
                            {selectedLocation && (
                                <Marker coordinate={selectedLocation} />
                            )}
                        </MapView>
                    ) : (
                        <Text>Cargando mapa...</Text>
                    )}
                    <Button title="Cerrar" onPress={() => setModalVisible(false)} color="#FF7F50" />
                </Modal>
            </Modal>

            <Modal
                visible={isDetailsModalVisible}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setIsDetailsModalVisible(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        {eventDetails && (
                            <>
                                <Text style={styles.modalTitle}>{eventDetails.name}</Text>
                                <Text style={styles.modalText}>
                                    Descripción: {eventDetails.description}
                                </Text>
                                <Text style={styles.modalText}>
                                    Fecha: {new Date(eventDetails.date).toLocaleDateString()}
                                </Text>
                                <Text style={styles.modalText}>Ubicación: {eventLocation}</Text>
                                <Text style={styles.modalText}>
                                    Participantes: {eventDetails.currentParticipants}/
                                    {eventDetails.maxParticipants}
                                </Text>
                                <TouchableOpacity
                                    style={styles.locationButton}
                                    onPress={handleShowMap}
                                >
                                    <Text style={styles.locationButtonText}>Ver en el Mapa</Text>
                                </TouchableOpacity>
                            </>
                        )}
                        <TouchableOpacity
                            style={styles.closeButton}
                            onPress={() => setIsDetailsModalVisible(false)}
                        >
                            <Text style={styles.closeButtonText}>Cerrar</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

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
            <Modal
                visible={isAdminModalVisible}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setIsAdminModalVisible(false)}
            >
                <View style={styles.modalContainer}>
                    <ScrollView contentContainerStyle={styles.modalContent}>
                        <Text style={styles.modalTitle}>Administrar Evento</Text>

                        {/* Detalles del evento */}
                        {adminEventDetails && (
                            <>
                                <Text style={styles.modalText}>Nombre: {adminEventDetails.name}</Text>
                                <Text style={styles.modalText}>
                                    Descripcion: {adminEventDetails.description}
                                </Text>
                                <Text style={styles.modalText}>
                                    Fecha Evento: {new Date(adminEventDetails.date).toLocaleDateString()}
                                </Text>

                                {/* Button to change name */}
                                <TouchableOpacity
                                    style={styles.dateChangeButton}
                                    onPress={() => setIsNameModalVisible(true)}
                                >
                                    <Text style={styles.dateChangeText}>Cambiar Nombre</Text>
                                </TouchableOpacity>

                                {/* Button to change description */}
                                <TouchableOpacity
                                    style={styles.dateChangeButton}
                                    onPress={() => setIsDescriptionModalVisible(true)}
                                >
                                    <Text style={styles.dateChangeText}>Cambiar Descripción</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={styles.dateChangeButton}
                                    onPress={() => setDatePickerVisible(true)}
                                >
                                    <Text style={styles.dateChangeText}>Cambiar Fecha</Text>
                                </TouchableOpacity>
                                {datePickerVisible && (
                                    <DateTimePicker
                                        value={selectedDate}
                                        mode="date"
                                        display={Platform.OS === 'ios' ? 'inline' : 'default'}
                                        onChange={handleDateChange}
                                    />
                                )}
                            </>
                        )}
                        <Modal
                            visible={isUpdateNameModalVisible}
                            transparent={true}
                            animationType="slide"
                            onRequestClose={() => setIsNameModalVisible(false)}
                        >
                            <View style={styles.modalContainer}>
                                <View style={styles.modalContent}>
                                    <Text style={styles.modalTitle}>Cambiar Nombre</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Nuevo Nombre"
                                        value={newName}
                                        onChangeText={setNewName}
                                    />
                                    <View style={styles.modalButtons}>
                                        <TouchableOpacity
                                            style={styles.saveButton}
                                            onPress={() => {
                                                setIsNameModalVisible(false);
                                                // Handle Save Logic
                                            }}
                                        >
                                            <Text style={styles.saveButtonText}>Guardar</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            style={styles.cancelButton}
                                            onPress={() => {
                                                setIsNameModalVisible(false);
                                                setNewName(''); // Clear the input
                                            }}
                                        >
                                            <Text style={styles.cancelButtonText}>Cancelar</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </View>
                        </Modal>


                        {/* Modal for changing description */}
                        <Modal
                            visible={isUpdateDescriptionModalVisible}
                            transparent={true}
                            animationType="slide"
                            onRequestClose={() => setIsDescriptionModalVisible(false)}
                        >
                            <View style={styles.modalContainer}>
                                <View style={styles.modalContent}>
                                    <Text style={styles.modalTitle}>Cambiar Descripción</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Nueva Descripción"
                                        value={newDescription}
                                        onChangeText={setNewDescription}
                                    />
                                    <View style={styles.modalButtons}>
                                        <TouchableOpacity
                                            style={styles.saveButton}
                                            onPress={() => {
                                                setIsDescriptionModalVisible(false);
                                                // Handle Save Logic
                                            }}
                                        >
                                            <Text style={styles.saveButtonText}>Guardar</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            style={styles.cancelButton}
                                            onPress={() => {
                                                setIsDescriptionModalVisible(false);
                                                setNewDescription(''); // Clear the input
                                            }}
                                        >
                                            <Text style={styles.cancelButtonText}>Cancelar</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </View>
                        </Modal>


                        {/* Lista de usuarios inscritos */}
                        <Text style={styles.sectionTitle}>Usuarios Inscritos:</Text>
                        {subscribedUsers.map((user) => (
                            <View key={user.id} style={styles.userRow}>
                                <Text style={styles.userName}>{user.name}</Text>
                                <TouchableOpacity
                                    onPress={() => handleEliminateUserFromEvent(user.id, adminEventDetails?.id ?? 0)}
                                    style={styles.deleteUserButton}
                                >
                                    <Text style={styles.deleteUserText}>Eliminar</Text>
                                </TouchableOpacity>
                            </View>
                        ))}

                        {/* Botones de acción */}
                        <View style={styles.actionButtons}>
                            <TouchableOpacity
                                style={styles.updateButton}
                                onPress={() => adminEventDetails && handleEventUpdate()}
                            >
                                <Text style={styles.updateButtonText}>Guardar Cambios</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.closeButton}
                                onPress={() => setIsAdminModalVisible(false)}
                            >
                                <Text style={styles.closeButtonText}>Cerrar</Text>
                            </TouchableOpacity>
                        </View>
                    </ScrollView>
                </View>
            </Modal>

        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: '#ffffff',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#FF7F50',
        textAlign: 'center',
        marginBottom: 20,
    },
    section: {
        marginBottom: 20,
        paddingHorizontal: 20, // Adds padding to the left and right
    },

    label: {
        fontSize: 16,
        marginBottom: 8,
        color: '#FF7F50',
    },
    buttonGroup: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginTop: 20,
    },
    input: {
        height: 50,
        borderColor: '#FF7F50', // Orange border
        borderWidth: 1,
        borderRadius: 25, // Rounded edges
        paddingHorizontal: 16,
        backgroundColor: '#f9f9f9', // Light background
        marginBottom: 20, // Margin below the input
      },
    locationButton: {
        marginTop: 15,
        paddingVertical: 10,
        paddingHorizontal: 20,
        backgroundColor: '#4CAF50',
        borderRadius: 5,
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

    detailButton: {
        marginTop: 10,
        flexDirection: 'row',
        width: '100%', // Make the button container take full width of the card
        justifyContent: 'center', // Center the button within the container
    },
    eventCard: {
        padding: 15,
        backgroundColor: '#f9f9f9',
        borderRadius: 8,
        marginBottom: 10,
        borderColor: '#FF7F50',
        borderWidth: 1,
    },
    locationButtonText: {
        color: '#fff',
        fontSize: 16,
        textAlign: 'center',
        fontWeight: 'bold',
    },
    eventName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#FF7F50',
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
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 10, // Add space between buttons
        width: '100%', // Ensure the container takes full width
        marginTop: 20,
    },
    saveButton: {
        backgroundColor: '#4CAF50', // Green for save button
        paddingVertical: 12, // Adjust padding for better spacing
        paddingHorizontal: 10, // Added padding for text alignment
        borderRadius: 25, // Rounded edges
        flex: 1, // Make both buttons equally wide
        alignItems: 'center',
        justifyContent: 'center', // Center content vertically
    },
    saveButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center', // Center text horizontally
    },
    cancelButton: {
        backgroundColor: '#f44336', // Red for cancel button
        paddingVertical: 12,
        paddingHorizontal: 10,
        borderRadius: 25,
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    cancelButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center',
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
    modalText: {
        fontSize: 16,
        color: '#333',
        marginBottom: 10,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginVertical: 10,
        color: '#FF7F50',
    },
    userRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 10,
        borderBottomColor: '#ccc',
        borderBottomWidth: 1,
    },
    userName: {
        fontSize: 16,
        color: '#333',
    },
    deleteUserButton: {
        backgroundColor: '#f44336',
        paddingVertical: 5,
        paddingHorizontal: 10,
        borderRadius: 5,
    },
    deleteUserText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: 'bold',
    },
    dateChangeButton: {
        backgroundColor: '#FF7F50',
        padding: 10,
        borderRadius: 5,
        marginVertical: 10,
        alignItems: 'center',
    },
    dateChangeText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: 'bold',
    },
    actionButtons: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginTop: 20,
    },
    updateButton: {
        backgroundColor: '#4CAF50',
        padding: 10,
        borderRadius: 5,
        width: '45%',
    },
    updateButtonText: {
        color: '#fff',
        fontSize: 14,
        textAlign: 'center',
        fontWeight: 'bold',
    },
    closeButton: {
        backgroundColor: '#f44336',
        padding: 10,
        borderRadius: 5,
        width: '45%',
    },
    closeButtonText: {
        color: '#fff',
        fontSize: 14,
        textAlign: 'center',
        fontWeight: 'bold',
    },
    modalButtonContainer: {
        flexDirection: 'column',  // Aseguramos que los botones estén uno encima del otro
        marginTop: 20,  // Separa los botones entre sí
        paddingHorizontal: 20, // Añadir espacio en los laterales
    },

    


});
