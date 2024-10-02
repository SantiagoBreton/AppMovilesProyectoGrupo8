import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';

export default function creacion_evento () {
    const [titulo, setTitulo] = useState('');
    const [descripcion, setDescripcion] = useState('');
    const [fecha, setFecha] = useState('');
    const [ubicacion, setUbicacion] = useState('');

    const handleCrearEvento = () => {
        // Aquí puedes manejar la lógica para crear el evento
        console.log('Evento creado:', { titulo, descripcion, fecha, ubicacion });
    };

    return (
        <View style={styles.container}>
            <Text style={styles.label}>Título del Evento</Text>
            <TextInput
                style={styles.input}
                value={titulo}
                onChangeText={setTitulo}
                placeholder="Ingrese el título del evento"
            />
            <Text style={styles.label}>Descripción</Text>
            <TextInput
                style={styles.input}
                value={descripcion}
                onChangeText={setDescripcion}
                placeholder="Ingrese la descripción del evento"
            />
            <Text style={styles.label}>Fecha</Text>
            <TextInput
                style={styles.input}
                value={fecha}
                onChangeText={setFecha}
                placeholder="Ingrese la fecha del evento"
            />
            <Text style={styles.label}>Ubicación</Text>
            <TextInput
                style={styles.input}
                value={ubicacion}
                onChangeText={setUbicacion}
                placeholder="Ingrese la ubicación del evento"
            />
            <Button title="Crear Evento" onPress={handleCrearEvento} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: '#fff',
    },
    label: {
        fontSize: 16,
        marginBottom: 8,
    },
    input: {
        height: 40,
        borderColor: '#ccc',
        borderWidth: 1,
        marginBottom: 16,
        paddingHorizontal: 8,
    },
});
