import React, { useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet, FlatList, Modal, TextInput, ScrollView, TouchableOpacity, Alert, Platform } from 'react-native';

import AsyncStorage from "@react-native-async-storage/async-storage";
import MapView, { Marker, Region } from 'react-native-maps';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Float } from 'react-native/Libraries/Types/CodegenTypes';
import { useLocation } from '../hooks/useLocation';
import { allEvents } from '@/apiCalls/getAllEvents';
import { myEvents } from '@/apiCalls/myEvents';
import { deleteEventById } from '@/apiCalls/deleteEventById';
import { useEventContext } from '@/context/eventContext';
import { createEvent } from '@/apiCalls/createEvent';


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
    const {refreshEvents} = useEventContext();
    const { location, locationError } = useLocation();

    const { trigger } = useEventContext();

    const  allevents  = allEvents(trigger);
    const  myUserEvents = myEvents(); // Call myEvents and store the result directly in the variable
    const eventsToDisplay = selectedView === 'inscritos' ? allevents.events : myUserEvents.myEvents;

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
        name: String;
        date: Date;
        latitude: Float;
        longitude: Float;
        description: String;
        maxParticipants: number;
        currentParticipants: number;
        userId: number;
    };

    const showDatePicker = () => {
        setDatePickerVisible(true);
    };

    const handleDateChange = (event: any, selectedDate?: Date) => {
        setDatePickerVisible(false);
        if (selectedDate) {
            setSelectedDate(selectedDate);
            setFecha(selectedDate.toLocaleDateString());
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


    const createNewEvent = async function createNewEvent() {
        try{
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
        }  catch (error) {
        setIsModalVisible(false);
        refreshEvents();
        } 
    };

    const switchView = (view: string) => {
        setSelectedView(view);
    };
    
    const handleEventPress = (event: { name: any; description: any; }) => {
        // Aquí puedes navegar a la pantalla de detalles del evento
        Alert.alert('Detalles del Evento', `Nombre: ${event.name}\nDescripción: ${event.description}`);
    };
    const handleEditEvent = (eventId: any) => {
        // Aquí iría la lógica para editar el evento
        Alert.alert('Editar Evento', `Editar el evento con id: ${eventId}`);
    };
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
                            color={selectedView === 'inscritos' ? '#FF7F50' : '#000'}
                        />
                    </View>
                    <View style={styles.buttonWrapper}>
                        <Button
                            title="Mis Eventos Creados"
                            onPress={() => switchView('creados')}
                            color={selectedView === 'creados' ? '#FF7F50' : '#000'}
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

                            {userId !== null && item.userId === userId &&  (
                                <View style={styles.actionButtons}>
                                    <Button title="Editar" onPress={() => handleEditEvent(item.id)} />
                                    <Button title="Eliminar" onPress={() => handleDeleteEvent(item.id)} />
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
                <Button title="Crear Evento" onPress={createNewEvent} color="#FF7F50" />
                <Button title="cerrar" onPress={() => setIsModalVisible(false)} color="#FF7F50" />

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
    },
    label: {
        fontSize: 16,
        marginBottom: 8,
        color: '#FF7F50',
    },
    input: {
        height: 50,
        borderColor: '#FF7F50',
        borderWidth: 1,
        borderRadius: 25,
        paddingHorizontal: 16,
        backgroundColor: '#ffffff',
    },
    map: {
        flex: 1,
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
    actionButtons: {
        marginTop: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    eventCard: {
        padding: 15,
        backgroundColor: '#f9f9f9',
        borderRadius: 8,
        marginBottom: 10,
        borderColor: '#FF7F50',
        borderWidth: 1,
    },
    eventName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#FF7F50',
    },
    buttonWrapper: {
        width: '45%',               // Controla el ancho de cada botón
    },
});
