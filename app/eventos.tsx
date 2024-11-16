import React, { useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet, FlatList, Modal, TextInput, ScrollView, TouchableOpacity, Alert, Platform } from 'react-native';


import MapView, { Marker, Region } from 'react-native-maps';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Float } from 'react-native/Libraries/Types/CodegenTypes';
import { SERVER_IP } from '@env';
import { useLocation } from '../hooks/useLocation';
import { allEvents } from '@/services/allEvents';
import { myEvents } from '@/services/myEvents';


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

    const { location, locationError } = useLocation();
    const  allevents  = allEvents();
    const  myUserEvents = myEvents(1); // Call myEvents and store the result directly in the variable
    const eventsToDisplay = selectedView === 'inscritos' ? allevents.events : myUserEvents.myEvents;
    
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


    const createEvent = async function createEvent() {
        const event: Event = {
            name: titulo,
            date: selectedDate,
            latitude: selectedLatitude ?? 0,
            longitude: selectedLongitude ?? 0,
            description: descripcion,
            maxParticipants: maxParticipants,
            currentParticipants: 0,
            userId: 1
        };
        try {
            const response = await fetch(`http://${SERVER_IP}:3000/createEvent`, {
                method: 'POST',
                headers: {
                'Content-Type': 'application/json',
                },
            body: JSON.stringify(event),
        });
       
        if (!response.ok) {
            throw new Error('Failed to create event');
        }
       
        const newEvent = await response.json();
        console.log('User created:', newEvent);
        setIsModalVisible(false);
        } catch (error) {
        console.error('Error creating user:', error);
        }
    };
    const switchView = (view: string) => {
        setSelectedView(view);
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
                            <View style={styles.eventCard}>
                                <Text style={styles.eventName}>{item.name}</Text>
                                <Text>
                                    {/* Safely parse the date and display it */}
                                    {item.date ? new Date(item.date).toLocaleDateString() : 'Fecha no disponible'}
                                </Text>
                                <Text>{item.description}</Text>
                            </View>
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
                <Button title="Crear Evento" onPress={createEvent} color="#FF7F50" />
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
