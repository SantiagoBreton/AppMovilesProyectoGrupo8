import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, StyleSheet, Image, ScrollView, Button, FlatList, TouchableOpacity, Alert, Platform } from 'react-native';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { myData } from '@/apiCalls/getMyUserData';
import { myEvents } from '@/apiCalls/myEvents';
import { useEventContext } from '@/context/eventContext';

export default function Perfil() {
    const { nombre, email, dataError } = myData();
    const { trigger } = useEventContext();
    const  myUserEvents = myEvents(trigger);
    const eventsToDisplay = myUserEvents.myEvents;

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

    // const handleSave = async () => {
    //     const userId = await AsyncStorage.getItem('userId');
    //     console.log('User token:', userId)
    // };

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
                <Text style={styles.input}>{nombre}</Text>
            </View>
            <View style={styles.section}>
                <Text style={styles.label}>Email:</Text>
                <Text style={styles.input}>{email}</Text>
            </View>
            {/* <Button title="Guardar" onPress={handleSave} color="#FF7F50" /> */}
            <Button title="Cerrar Sesion" onPress={handleLogout} color="#FF7F50" />
            
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Eventos Creados</Text>
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

                            {userId !== null && item.userId != userId &&  (
                                <View style={styles.detailButton}>
                                    <Button  title="Detalles" onPress={() => handleDetailsEvent(item.id)} />

                                </View>
                            )}
                        </TouchableOpacity>
                    )}
                    keyExtractor={(item) => item.id.toString()}
                />
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
