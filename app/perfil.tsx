import React from 'react';
import { View, Text, TextInput, Button, StyleSheet, Image, ScrollView } from 'react-native';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { myData } from '@/apiCalls/getMyUserData';


export default function Perfil() {
    const { nombre, email, dataError } = myData();


    const handleSave = async () => {
        const userId = await AsyncStorage.getItem('userId');
        console.log('User token:', userId)
    };

    const handleLogout = async () => {
        await AsyncStorage.removeItem("userId");
        const userId = await AsyncStorage.getItem('userId');
        console.log('User token:', userId)
    }



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
                />
            </View>
            <View style={styles.section}>
                <Text style={styles.label}>Email:</Text>
                <TextInput 
                style={styles.input} 
                value={email}
                />
            </View>
            <Button title="Guardar" onPress={handleSave} color="#FF7F50" />
            <Button title="Cerrar Sesion" onPress={handleLogout} color="#FF7F50" />
            
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Eventos Creados</Text>
            </View>
            
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#ffffff',
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
        color: '#FF7F50',
    },
    section: {
        marginBottom: 20,
    },
    label: {
        fontSize: 18,
        marginBottom: 5,
        color: '#FF7F50',
    },
    input: {
        borderWidth: 1,
        borderColor: '#FF7F50',
        padding: 10,
        borderRadius: 25,
        backgroundColor: '#ffffff',
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10,
        color: 'black', 
    },
});
