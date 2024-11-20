import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, StyleSheet, Image, ScrollView, Button, FlatList, TouchableOpacity, Alert, Platform } from 'react-native';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { myData } from '@/apiCalls/getMyUserData';
import { myEvents } from '@/apiCalls/myEvents';
import { useEventContext } from '@/context/eventContext';
import { Float } from 'react-native/Libraries/Types/CodegenTypes';
import { useAuthContext } from '@/context/userLoginContext';  // Updated import

export default function Perfil() {
    const { nombre, email, dataError } = myData();
    const { trigger } = useEventContext();
    const myUserEvents = myEvents(trigger);
    const eventsToDisplay = myUserEvents.myEvents;
    const { logout } = useAuthContext();

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

    const handleEventPress = (event: { name: any; description: any; }) => {
        // Aquí puedes navegar a la pantalla de detalles del evento
        Alert.alert('Detalles del Evento', `Nombre: ${event.name}\nDescripción: ${event.description}`);

    };

    const handleLogout = async () => {
        await AsyncStorage.removeItem("userId");
        const userId = await AsyncStorage.getItem('userId');
        console.log('User token:', userId)
        logout();
    }

    const handleDetailsEvent = (item: Event) => {
        Alert.alert('Detalles del Evento', `Nombre: ${item.name}\nDescripción: ${item.description}\nFecha: ${item.date}\nUbicación: ${item.latitude}, ${item.longitude}\nParticipantes: ${item.currentParticipants}/${item.maxParticipants}`);
    };

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <Image source={{ uri: 'https://via.placeholder.com/150' }} style={styles.profileImage} />
                <Text style={styles.name}>{nombre}</Text>
            </View>
            <View style={styles.section}>
                <Text style={styles.label}>Nombre:</Text>
                <Text style={styles.input}>{nombre}</Text>
            </View>
            <View style={styles.section}>
                <Text style={styles.label}>Email:</Text>
                <Text style={styles.input}>{email}</Text>
            </View>

            <View style={styles.logoutContainer}>
                <Button title="Cerrar Sesión" onPress={handleLogout} color="#FF7F50" />
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Eventos Creados</Text>
                {eventsToDisplay.length > 0 ? (
                    <FlatList
                        data={eventsToDisplay}
                        scrollEnabled={false}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                style={styles.eventCard}
                                onPress={() => handleEventPress(item)}
                            >
                                <View style={styles.eventHeader}>
                                    <Text style={styles.eventName}>{item.name}</Text>
                                    <Text style={styles.eventDate}>
                                        {item.date
                                            ? new Date(item.date).toLocaleDateString()
                                            : 'Fecha no disponible'}
                                    </Text>
                                </View>
                                <Text style={styles.eventDescription}>{item.description}</Text>
                                {userId !== null && item.userId !== userId && (
                                    <View style={styles.detailButtonContainer}>
                                        <Button
                                            title="Detalles"
                                            onPress={() => handleDetailsEvent(item.id)}
                                            color="#FF7F50"
                                        />
                                    </View>
                                )}
                            </TouchableOpacity>
                        )}
                        keyExtractor={(item) => item.id.toString()}
                        ListFooterComponent={
                            <Text style={styles.footerText}>
                                {`Total de eventos: ${eventsToDisplay.length}`}
                            </Text>
                        }
                    />
                ) : (
                    <Text style={styles.noEventsText}>No se han creado eventos aún.</Text>
                )}
            </View>
        </ScrollView>

    );
};

const styles = StyleSheet.create({
    container: {
        marginTop: 30,
        flex: 1,
        backgroundColor: '#F9F9F9',
        paddingHorizontal: 16,
        paddingVertical: 24,
    },
    eventHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    footerText: {
        marginTop: 16,
        textAlign: 'center',
        fontSize: 14,
        color: '#666',
    },
    noEventsText: {
        textAlign: 'center',
        fontSize: 16,
        color: '#999',
        marginTop: 16,
    },
    header: {
        alignItems: 'center',
        marginBottom: 24,
        backgroundColor: '#FF7F50',
        paddingVertical: 16,
        borderRadius: 16,
    },
    profileImage: {
        width: 100,
        height: 100,
        borderRadius: 50,
        borderWidth: 2,
        borderColor: '#fff',
        marginBottom: 8,
    },
    name: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
    },
    section: {
        backgroundColor: '#fff',
        padding: 16,
        marginVertical: 12,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 4,
    },
    label: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#FF7F50',
        marginBottom: 4,
    },
    input: {
        fontSize: 16,
        color: '#333',
        marginBottom: 8,
    },
    logoutContainer: {
        marginVertical: 16,
        alignItems: 'center',
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#FF7F50',
        marginBottom: 16,
        textAlign: 'center',
    },
    eventCard: {
        backgroundColor: '#fef6f2',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderLeftWidth: 4,
        borderLeftColor: '#FF7F50',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
        elevation: 3,
    },
    eventName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#FF7F50',
    },
    eventDate: {
        fontSize: 14,
        color: '#666',
        fontStyle: 'italic',
    },
    eventDescription: {
        fontSize: 14,
        color: '#333',
        marginBottom: 8,
    },
    detailButtonContainer: {
        alignSelf: 'flex-end',
        marginTop: 8,
    },
});
