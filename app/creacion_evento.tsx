import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, ScrollView, Modal, Alert, TouchableOpacity, Platform } from 'react-native';
import * as Location from 'expo-location';
import MapView, { Marker, Region } from 'react-native-maps';
import DateTimePicker from '@react-native-community/datetimepicker';

export default function CreacionEvento() {
    const [titulo, setTitulo] = useState('');
    const [descripcion, setDescripcion] = useState('');
    const [fecha, setFecha] = useState('');
    const [ubicacion, setUbicacion] = useState('');
    const [datePickerVisible, setDatePickerVisible] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedLocation, setSelectedLocation] = useState<{ latitude: number; longitude: number } | null>(null);
    const [initialRegion, setInitialRegion] = useState<Region | null>(null);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [maxParticipants, setMaxParticipants] = useState(0);

    useEffect(() => {
        (async () => {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permiso denegado', 'La aplicación necesita acceso a tu ubicación para funcionar.');
                return;
            }

            const location = await Location.getCurrentPositionAsync({});
            setInitialRegion({
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
            });
        })();
    }, []);

    const handleCrearEvento = () => {
        console.log('Evento creado:', { titulo, descripcion, fecha, selectedLocation });
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
        setUbicacion(`${latitude},${longitude}`);
        setModalVisible(false);
    };

    const handleMaxParticipantsChange = (text: string) => {
        const numericValue = parseInt(text, 10);
        setMaxParticipants(isNaN(numericValue) ? 0 : numericValue);
    };

    return (
        <ScrollView style={styles.container}>
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
            <Button title="Crear Evento" onPress={handleCrearEvento} color="#FF7F50" />

            <Modal visible={modalVisible} animationType="slide">
                {initialRegion ? (
                    <MapView
                        style={styles.map}
                        initialRegion={initialRegion}
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
        </ScrollView>
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
});
