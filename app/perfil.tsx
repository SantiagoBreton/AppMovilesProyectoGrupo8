import React from 'react';
import { View, Text, TextInput, Button, StyleSheet, Image, ScrollView } from 'react-native';

export default function Perfil () {
    const [nombre, setNombre] = React.useState('');
    const [email, setEmail] = React.useState('');

    const handleSave = () => {
        // Lógica para guardar la información del usuario
    };

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <Image source={{ uri: 'https://via.placeholder.com/150' }} style={styles.profileImage} />
                <Text style={styles.name}>Nombre del Usuario</Text>
            </View>
            <View style={styles.section}>
                <Text style={styles.label}>Nombre:</Text>
                <TextInput
                    style={styles.input}
                    value={nombre}
                    onChangeText={setNombre}
                />
            </View>
            <View style={styles.section}>
                <Text style={styles.label}>Email:</Text>
                <TextInput
                    style={styles.input}
                    value={email}
                    onChangeText={setEmail}
                />
            </View>
            <Button title="Guardar" onPress={handleSave} />
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Fotos</Text>
                {/* Aquí puedes mapear y mostrar las fotos del usuario */}
            </View>
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Eventos Creados</Text>
                {/* Aquí puedes mapear y mostrar los eventos creados por el usuario */}
            </View>
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Calificaciones</Text>
                {/* Aquí puedes mapear y mostrar las calificaciones del usuario */}
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
    },
    header: {
        alignItems: 'center',
        marginBottom: 20,
    },
    profileImage: {
        width: 150,
        height: 150,
        borderRadius: 75,
    },
    name: {
        fontSize: 24,
        fontWeight: 'bold',
        marginTop: 10,
    },
    section: {
        marginBottom: 20,
    },
    label: {
        fontSize: 18,
        marginBottom: 5,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        padding: 10,
        borderRadius: 5,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10,
    },
});
