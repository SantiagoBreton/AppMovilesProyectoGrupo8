import React, { useState } from 'react';

interface CustomEvent {
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
interface SeeUser {
    name: string;
    email: string;
    events: CustomEvent[];
};
interface SpectatedUserModalProps {
    isVisible: boolean;
    user: SeeUser | null;
    onClose: () => void;
}
import { Modal, View, Text, TouchableOpacity, Image, FlatList, ScrollView, StyleSheet, Button, Alert } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons'; // If you are using FontAwesome5
import { Float } from 'react-native/Libraries/Types/CodegenTypes';
import EventDetailModal from './EventDetailModal';

const SpectatedUserModal: React.FC<SpectatedUserModalProps> = ({
    isVisible,
    user,
    onClose,
}) => {

    const [isDetailsModalVisible, setIsDetailsModalVisible] = useState(false);
    const [eventDetails, setEventDetails] = useState<CustomEvent | null>(null);
    if (!user ) return null; 
    const handleEventPress = (event: CustomEvent) => {

        setEventDetails(event);
        setIsDetailsModalVisible(true);
    };
    

    return (
        <Modal visible={isVisible} animationType="slide">
            <ScrollView>
                <View style={styles.header3}>
                    <Text style={styles.name}>{user.name}</Text>
                    <TouchableOpacity style={styles.closeButton2} onPress={onClose}>
                        <FontAwesome5 name="times" size={24} color="black" />
                    </TouchableOpacity>
                </View>
                <View style={styles.container}>
                    <View style={styles.header}>
                        <Image source={{ uri: 'https://via.placeholder.com/150' }} style={styles.profileImage} />
                        <Text style={styles.name}>{user.name}</Text>
                    </View>
                    <View style={styles.section}>
                        <Text style={styles.label}>Nombre:</Text>
                        <Text style={styles.input}>{user.name}</Text>
                    </View>
                    <View style={styles.section}>
                        <Text style={styles.label}>Email:</Text>
                        <Text style={styles.input}>{user.email}</Text>
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Eventos Creados</Text>
                        {user.events && user.events.length > 0 ? (
                            <FlatList
                                data={user.events}
                                scrollEnabled={false}
                                renderItem={({ item }) => (
                                    <TouchableOpacity
                                        style={styles.eventCard}
                                        onPress={() => handleEventPress(item)} 
                                    >
                                        <View style={styles.eventHeader}>
                                            <Text style={styles.eventName}>{item.name}</Text>
                                            <Text style={styles.eventDate}>
                                                {item.date ? new Date(item.date).toLocaleDateString() : 'Fecha no disponible'}
                                            </Text>
                                        </View>
                                        <Text style={styles.eventDescription}>{item.description}</Text>
                                        <View style={styles.detailButtonContainer}>
                                            <Button title="Detalles" onPress={() => handleEventPress(item)} color="#FF7F50" />
                                        </View>
                                    </TouchableOpacity>
                                )}
                                keyExtractor={(item) => item.id.toString()}
                                ListFooterComponent={
                                    <Text style={styles.footerText}>{`Total de eventos: ${user.events.length}`}</Text>
                                }
                            />
                        ) : (
                            <Text style={styles.noEventsText}>No se han creado eventos aún.</Text>
                        )}
                    </View>
                </View>
            </ScrollView>
            <EventDetailModal
                visible={isDetailsModalVisible}
                eventDetails={eventDetails as CustomEvent | null}
                onClose={() => setIsDetailsModalVisible(false)}
            />
        </Modal>
    );
};


const styles = StyleSheet.create({
    header3: {
        alignItems: 'center',
        paddingBottom: 5,
        backgroundColor: '#F9F9F9',
    },
    name: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
    },
    closeButton2: {
        position: 'absolute',
        top: 8,
        right: 8,
        padding: 8,
    },
    container: {
        flex: 1,
        backgroundColor: '#F9F9F9',
        paddingHorizontal: 16,
        paddingVertical: 10,
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
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#FF7F50',
        marginBottom: 16,
        textAlign: 'center',
    },
    eventHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
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
});

export default SpectatedUserModal;
function setEventLocation(location: string) {
    throw new Error('Function not implemented.');
}

function setIsDetailsModalVisible(arg0: boolean) {
    throw new Error('Function not implemented.');
}

