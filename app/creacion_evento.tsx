import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, ScrollView } from 'react-native';

export default function CreacionEvento() {
    const [titulo, setTitulo] = useState('');
    const [descripcion, setDescripcion] = useState('');
    const [fecha, setFecha] = useState('');
    const [ubicacion, setUbicacion] = useState('');

    const handleCrearEvento = () => {
        console.log('Evento creado:', { titulo, descripcion, fecha, ubicacion });
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
                <Text style={styles.label}>Fecha</Text>
                <TextInput
                    style={styles.input}
                    value={fecha}
                    onChangeText={setFecha}
                    placeholder="Ingrese la fecha del evento"
                    placeholderTextColor="#A9A9A9"
                />
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
            </View>
            <Button title="Crear Evento" onPress={handleCrearEvento} color="#FF7F50" />
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
});
