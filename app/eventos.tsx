import React, { useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet, FlatList, Modal, TextInput, ScrollView, TouchableOpacity, Alert, Platform, Pressable, Image } from 'react-native';
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
import SpectatedUserModal from '@/components/SpectatedUserModal';


export default function CreacionEvento() {
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [titulo, setTitulo] = useState('');
    const [descripcion, setDescripcion] = useState('');
    const [fecha, setFecha] = useState('');
    const [ubicacion, setUbicacion] = useState('');
    const [datePickerVisible, setDatePickerVisible] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedLocation, setSelectedLocation] = useState<{ latitude: number; longitude: number } | null>(null);
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [maxParticipants, setMaxParticipants] = useState(0);
    const [selectedLatitude, setLatitude] = useState<number | null>(null);
    const [selectedLongitude, setLongitude] = useState<number | null>(null);
    const [selectedView, setSelectedView] = useState('inscriptos'); // 'inscriptos' o 'creados'
    const { refreshEvents } = useEventContext();
    const { location, locationError } = useLocation();
    const [isDetailsModalVisible, setIsDetailsModalVisible] = useState(false);
    const [isConfirmaDeletionModalVisible, setIsConfirmaDeletionModalVisible] = useState(false);
    const [eventDetails, setEventDetails] = useState<Event | null>(null);
    const [eventLocation, setEventLocation] = useState<string | null>(null);
    const { trigger } = useEventContext();
    const [isMapVisible, setMapVisible] = useState(false);
    const allevents = getSubscribedEvents(trigger);
    const myUserEvents = myEvents(trigger); // Call myEvents and store the result directly in the variable
    const eventsToDisplay = selectedView === 'inscriptos' ? allevents.events : myUserEvents.myEvents;
    const [isAdminModalVisible, setIsAdminModalVisible] = useState(false);
    const [adminEventDetails, setAdminEventDetails] = useState<EventWithId | null>(null);
    const [subscribedUsers, setSubscribedUsers] = useState<{ id: number; name: string; email: string }[]>([]);
    const [eventAssLocation, setEventAssLocation] = useState<string | null>(null);
    const [isUpdateNameModalVisible, setIsNameModalVisible] = useState(false);
    const [isUpdateDescriptionModalVisible, setIsDescriptionModalVisible] = useState(false);
    const [newName, setNewName] = useState('');
    const [newDescription, setNewDescription] = useState('');
    const [selectedEventId, setSelectedEventId] = useState<number | null>(null);
    const [userId, setUserId] = useState<number | null>(null);
    const [seeUser, setSeeUser] = useState<{ id: number; name: string; email: string } | null>(null);
    const [isSpectatedUserVisible, setIsSpectatedUserVisible] = useState(false);

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

        if (date && date >= new Date()) {
            setSelectedDate(date);
            setFecha(date.toLocaleDateString());
        }
        else {
            setSelectedDate(null);
            Alert.alert('Error', 'Por favor, seleccione una fecha válida.');
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
        if ((!newName && !newDescription && !selectedDate)) {
            Alert.alert('Error', 'Por favor, complete al menos un campo para actualizar.');
            return;
        }
        if (selectedDate && selectedDate <= new Date()) {
            setSelectedDate(adminEventDetails?.date ?? null);
        }
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
            setIsModalVisible(false);
            resetEvetCreationInfo();

            refreshEvents();
        } catch (error) {
            setIsModalVisible(false);
            refreshEvents();
        }
    };

    const switchView = (view: string) => {
        setSelectedView(view);
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
    const alertUserProfile = (user: { id?: number; name: any; email?: any; signupDate?: any; }) => {
        // You can replace this with a more complex profile modal in the future.
        alert(`Perfil de ${user.name}\n\nCorreo: ${user.email}\nFecha de inscripción: ${new Date(user.signupDate).toLocaleDateString()}`);
    }

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

    const handleEliminateUserFromEvent = async (userId: number, eventId: number) => {
        try {
            await unsubscribeUserFromAnEvent(userId, eventId);
            Alert.alert('Éxito', 'Usuario eliminado del evento correctamente.');
            setSubscribedUsers((prevUsers) => prevUsers.filter((user) => user.id !== userId));
            refreshEvents();
        } catch (error) {
            Alert.alert('Error', 'No se pudo eliminar al usuario del evento.');
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

    const confirmDelete = () => {
        if (selectedEventId !== null) {
            handleDeleteEvent(selectedEventId); // Call your existing delete function
        }
        closeDeleteModal();
    };

    const closeDeleteModal = () => {
        setSelectedEventId(null);
        setIsConfirmaDeletionModalVisible(false);
    };

    const handleSeeUserProfile = (user: { id: number; name: string; email: string }) => {
        setSeeUser(user)
        setIsSpectatedUserVisible(true);
    }

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
                                <Text style={styles.eventName}>{item.name}</Text>

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

                            {/* Modal for Delete Confirmation */}
                            <Modal
                                visible={isConfirmaDeletionModalVisible}
                                transparent={true}
                                animationType="fade"
                            >
                                <View style={modalStyles.modalOverlay}>
                                    <View style={modalStyles.modalContainer}>
                                        <Text style={modalStyles.modalTitle}>Confirmar Eliminación</Text>
                                        <Text style={modalStyles.modalMessage}>
                                            ¿Estás seguro de que deseas eliminar este evento? Esta acción no se puede deshacer.
                                        </Text>
                                        <View style={modalStyles.modalButtons}>
                                            <TouchableOpacity
                                                style={[modalStyles.modalButton, modalStyles.cancelButton]}
                                                onPress={closeDeleteModal}
                                            >
                                                <Text style={modalStyles.cancelButtonText}>Cancelar</Text>
                                            </TouchableOpacity>
                                            <TouchableOpacity
                                                style={[modalStyles.modalButton, modalStyles.confirmButton]}
                                                onPress={confirmDelete}
                                            >
                                                <Text style={modalStyles.confirmButtonText}>Eliminar</Text>
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                </View>
                            </Modal>
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
                                <Text style={styles.eventName}>{item.name}</Text>
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
                                setIsModalVisible(false);
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
                <View style={styles.modalContainer2}>
                    <ScrollView contentContainerStyle={styles.modalContent2}>
                        <Text style={styles.modalTitle1}>Administrar Evento</Text>
                        <View style={styles.titleSeparator} />

                        {/* Detalles del evento */}
                        {adminEventDetails && (
                            <>
                                <Text style={styles.detailsSectionTitle}>Detalles del Evento</Text>
                                <View style={styles.elegantDetailsContainer}>
                                    {/* Nombre del Evento */}
                                    <View style={styles.detailBlock}>
                                        <Text style={styles.detailLabel}>📛 Nombre:</Text>
                                        <Text style={styles.detailValue}>{adminEventDetails.name}</Text>
                                    </View>

                                    {/* Descripción del Evento */}
                                    <View style={styles.detailBlock}>
                                        <Text style={styles.detailLabel}>📄 Descripción:</Text>
                                        <Text style={styles.detailValue}>{adminEventDetails.description}</Text>
                                    </View>

                                    {/* Fecha del Evento */}
                                    <View style={styles.detailBlock}>
                                        <Text style={styles.detailLabel}>📅 Fecha:</Text>
                                        <Text style={styles.detailValue}>
                                            {new Date(adminEventDetails.date).toLocaleDateString('es-ES', {
                                                weekday: 'long',
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric',
                                            })}
                                        </Text>
                                    </View>
                                </View>

                                <View style={styles.titleSeparator} />

                                <View style={styles.actionCardsContainer}>
                                    {/* Cambiar Nombre */}
                                    <Pressable
                                        style={({ pressed }) => [
                                            styles.actionCard,
                                            pressed && styles.actionCardPressed,
                                        ]}
                                        onPress={() => setIsNameModalVisible(true)}
                                    >
                                        <View style={styles.cardIconContainer}>
                                            <Text style={styles.cardIcon}>✏️</Text>
                                        </View>
                                        <Text style={styles.cardTitle}>Cambiar Nombre</Text>
                                    </Pressable>

                                    {/* Cambiar Descripción */}
                                    <Pressable
                                        style={({ pressed }) => [
                                            styles.actionCard,
                                            pressed && styles.actionCardPressed,
                                        ]}
                                        onPress={() => setIsDescriptionModalVisible(true)}
                                    >
                                        <View style={styles.cardIconContainer}>
                                            <Text style={styles.cardIcon}>📝</Text>
                                        </View>
                                        <Text style={styles.cardTitle}>Cambiar Descripción</Text>
                                    </Pressable>

                                    {/* Cambiar Fecha */}
                                    <Pressable
                                        style={({ pressed }) => [
                                            styles.actionCard,
                                            pressed && styles.actionCardPressed,
                                        ]}
                                        onPress={() => setDatePickerVisible(true)}
                                    >
                                        <View style={styles.cardIconContainer}>
                                            <Text style={styles.cardIcon}>📅</Text>
                                        </View>
                                        <Text style={styles.cardTitle}>Cambiar Fecha</Text>
                                    </Pressable>
                                </View>



                                {datePickerVisible && (
                                    <DateTimePicker
                                        value={selectedDate || new Date()}
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
                            <View style={styles.modalContainer2}>
                                <View style={styles.modalContent2}>
                                    <Text style={styles.modalTitle2}>Cambiar Nombre</Text>
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
                            <View style={styles.modalContainer2}>
                                <View style={styles.modalContent2}>
                                    <Text style={styles.modalTitle2}>Cambiar Descripción</Text>
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
                        <View style={styles.titleSeparator} />

                        {/* Lista de usuarios inscriptos */}
                        <Text style={styles.sectionTitle}>Usuarios Inscriptos:</Text>

                        {subscribedUsers.map((user) => (
                            <View key={user.id} style={styles.userCard}>
                                {/* Profile Picture */}
                                <TouchableOpacity onPress={() => handleSeeUserProfile({ id: user.id, name: user.name, email: user.email })}>
                                    <Image
                                        source={{ uri: 'https://www.gravatar.com/avatar/2c7d99fe281ecd3bcd65ab915bac6dd5?s=250' }} // Use default image if no profile picture
                                        style={styles.profilePicture}
                                    />
                                </TouchableOpacity>

                                {/* User Info (Name and Eliminate Button) */}
                                <View style={styles.userInfo}>
                                    {/* User Name */}
                                    <TouchableOpacity onPress={() => handleSeeUserProfile({ id: user.id, name: user.name, email: user.email })}>
                                        <Text style={styles.userName} numberOfLines={1}>
                                            {user.name}
                                        </Text>
                                    </TouchableOpacity>
                                    <SpectatedUserModal
                                        isVisible={isSpectatedUserVisible}
                                        user={seeUser}
                                        onClose={() => setIsSpectatedUserVisible(false)}
                                    />

                                    {/* Eliminate Button */}
                                    <TouchableOpacity
                                        onPress={() => handleEliminateUserFromEvent(user.id, adminEventDetails?.id ?? 0)}
                                        style={styles.deleteUserButton}
                                    >
                                        <Text style={styles.deleteUserText}>Eliminar</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        ))}
                        <View style={styles.titleSeparator} />
                        {/* Botones de acción */}
                        <View style={styles.actionButtons2}>
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
        marginTop: 30,
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
    subHeader: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginTop: 20,
        marginBottom: 10,
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

    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginTop: 20,
    },
    saveButton: {
        backgroundColor: '#00C851', // Verde llamativo
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 25,
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
        marginHorizontal: 5,
    },
    saveButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    cancelButton: {
        backgroundColor: '#ff4444', // Rojo vibrante
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 25,
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
        marginHorizontal: 5,
    },
    cancelButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
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
    sectionTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#FF7F50',
    },
    userRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 10,
        borderBottomColor: '#ddd',
        borderBottomWidth: 1,
    },
    userName: {
        fontSize: 18,
        color: '#333',
        marginBottom: 5, // Space between name and button
    },
    deleteUserButton: {
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FF6347',
        paddingVertical: 8,
        paddingHorizontal: 15,
        borderRadius: 5,
    },


    scrollContainer: {
        flexGrow: 1, // Ensures the content stretches vertically
        paddingBottom: 20, // Optional: Add bottom padding for better spacing when scrolling
    },
    deleteUserText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: 'bold',
    },
    dateChangeButton: {
        backgroundColor: '#6C63FF', // Azul moderno
        paddingVertical: 12,
        paddingHorizontal: 15,
        borderRadius: 30, // Botón redondeado
        marginVertical: 10,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 5, // Sombra para profundidad
    },
    dateChangeText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },

    updateButton: {
        backgroundColor: '#007E33', // Verde oscuro
        padding: 12,
        borderRadius: 30,
        alignItems: 'center',
        flex: 1,
        marginRight: 10,
    },
    updateButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    closeButton: {
        backgroundColor: '#CC0000', // Rojo oscuro
        padding: 12,
        borderRadius: 30,
        alignItems: 'center',
        flex: 1,
    },

    closeButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    modalButtonContainer: {
        flexDirection: 'column',  // Aseguramos que los botones estén uno encima del otro
        marginTop: 20,  // Separa los botones entre sí
        paddingHorizontal: 20, // Añadir espacio en los laterales
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

    modalContainer2: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.7)', // Más oscuro para dar profundidad
    },
    modalContent2: {
        width: '90%',
        padding: 20,
        backgroundColor: '#fefefe',
        borderRadius: 15,
        elevation: 10, // Sombra en Android
        shadowColor: '#000', // Sombra en iOS
        shadowOpacity: 0.3,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 5 },
    },
    modalTitle2: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#FF7F50', // Naranja vibrante
        textAlign: 'center',
        marginBottom: 15,
        textTransform: 'uppercase', // Dar estilo más formal
    },
    modalText2: {
        fontSize: 16,
        color: '#555',
        marginBottom: 10,
    },
    actionButtons2: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 20,
    },
    detailsSectionTitle: {
        fontSize: 24, // A bit smaller to create hierarchy
        fontWeight: '600', // Medium weight for differentiation
        color: '#FF6347', // Warm color to create contrast
        backgroundColor: '#fff3e0', // Soft background color to make it pop
        paddingVertical: 10, // Padding to make it feel more like a banner
        paddingHorizontal: 15,
        borderRadius: 20, // Rounded corners for a more modern look
        textAlign: 'center', // Center align the title
        marginBottom: 30, // Increased space below to separate from content
        letterSpacing: 1, // Small spacing to make it feel light
    },

    modalTitle1: {
        fontSize: 32, // Slightly larger for a premium feel
        fontWeight: '600', // Medium weight for sophistication, not too bold
        color: '#4A4A4A', // A neutral, refined dark gray (softer than pure black)
        letterSpacing: 0.5, // Slight spacing to keep it clean and airy
        textTransform: 'capitalize', // Keep it elegant without all caps
        textShadowColor: '#ddd', // Soft, light gray shadow for depth
        textShadowOffset: { width: 0, height: 2 }, // Slight shadow offset
        textShadowRadius: 4, // Soft shadow for gentle emphasis
        marginBottom: 20, // Slight space below to balance with surrounding content
        paddingHorizontal: 20, // More space for a comfortable feel
        textAlign: 'center', // Center the title for balance
    },



    elegantDetailsContainer: {
        padding: 20,
        backgroundColor: '#ffffff', // Fondo blanco
        borderRadius: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 6, // Sombra para Android
        borderWidth: 1,
        borderColor: '#FF7F50', // Un borde naranja sutil
        marginHorizontal: 10, // Separación horizontal
    },

    detailBlock: {
        marginBottom: 20,
    },

    detailLabel: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
        marginBottom: 8,
        textTransform: 'capitalize',
    },

    detailValue: {
        fontSize: 16,
        color: '#555',
        backgroundColor: '#F9F9F9', // Fondo para el valor
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 8,
        lineHeight: 22,
        borderWidth: 1,
        borderColor: '#EAEAEA', // Un borde gris claro
        overflow: 'hidden',
    },
    actionCardsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',  // Distribute buttons evenly
        alignItems: 'center',             // Vertically align buttons in the center
        flexWrap: 'wrap',                 // Allow buttons to wrap to next line if needed
        marginVertical: 20,
    },
    actionCard: {
        width: '30%',                    // Make each button take up 30% of the width
        minWidth: 120,                   // Ensure a minimum width
        height: 120,
        backgroundColor: '#fff',
        borderRadius: 10,
        elevation: 5,                    // Shadow for Android
        shadowColor: '#000',             // Shadow for iOS
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 10,
        marginBottom: 15,                // Add space between buttons
    },
    actionCardPressed: {
        backgroundColor: '#FF9F68',      // Pressed button color
    },
    cardIconContainer: {
        marginBottom: 10,
    },
    cardIcon: {
        fontSize: 30,
        color: '#FF7F50',                // Icon color
    },
    cardTitle: {
        fontSize: 14,
        color: '#333',                   // Elegant text color
        textAlign: 'center',
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


    userInfoContainer: {
        flexDirection: 'row',
        flex: 1, // Take up available space
        alignItems: 'stretch',
        marginRight: 15,
    },


    profilePicture: {
        width: 50,
        height: 50,
        borderRadius: 25,
        marginRight: 15,
    },

    nameContainer: {
        flex: 1,
        justifyContent: 'space-between', // Distribute content vertically
        alignItems: 'flex-start',
    },
    userInfo: {
        flexDirection: 'column', // Align name and button vertically
        flex: 1, // Take up available space next to the image
    },
    titleSeparator: {
        borderBottomWidth: 1, // Creates the horizontal line
        borderBottomColor: '#ddd', // Light gray color for the line
        marginVertical: 15, // Space around the line to keep separation clean
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

    textContainer: {
        flex: 1,
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
    },







});

const modalStyles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContainer: {
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 10,
        width: '80%',
        alignItems: 'center',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#333',
    },
    modalMessage: {
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 20,
        color: '#666',
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
    },
    modalButton: {
        flex: 1,
        padding: 10,
        borderRadius: 5,
        alignItems: 'center',
        marginHorizontal: 5,
    },
    cancelButton: {
        backgroundColor: '#ddd',
    },
    confirmButton: {
        backgroundColor: '#e53935',
    },
    cancelButtonText: {
        color: '#333',
        fontWeight: 'bold',
    },
    confirmButtonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
});