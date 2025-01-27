import React, { useState } from "react";
import { TouchableOpacity, View, Text, StyleSheet, Button } from "react-native";
import { Float } from "react-native/Libraries/Types/CodegenTypes";
import EventDetailModal from "./EventDetailModal";

interface EventCard2Props {
    event: EventWithId | null;
};

interface EventWithId {
    id: number;
    name: string;
    date: Date;
    latitude: Float;
    longitude: Float;
    description: string;
    maxParticipants: number;
    currentParticipants: number;
    time:String;
    categoryName: String;
    userId: number;
};

const EventCard2: React.FC<EventCard2Props> = ({
    event,
}) => {
    const [isDetailsModalVisible, setIsDetailsModalVisible] = useState(false);
    const [eventDetails, setEventDetails] = useState<EventWithId | null>(null);

    const handleDetailsEvent = async (item: EventWithId) => {
        setEventDetails(item)
        setIsDetailsModalVisible(true);
    };
    return (
        <TouchableOpacity
            style={styles.eventCard}
            onPress={() => event && handleDetailsEvent(event)}
        >
            <View style={styles.cardContent}>
                <Text style={styles.eventName} numberOfLines={2}>{event?.name}</Text>
                <Text style={styles.eventDate}>
                    {event?.date ? new Date(event.date).toLocaleDateString() : 'Fecha no disponible'}
                </Text>
                <Text style={styles.eventDescription}>{event?.description}</Text>
            </View>
            <View style={styles.detailButtonContainer}>
                <Button
                    title="Detalles"
                    onPress={() => event && handleDetailsEvent(event)}
                    color="#FF7F50"
                />
            </View>

            <EventDetailModal
                visible={isDetailsModalVisible}
                eventDetails={eventDetails as EventWithId | null}
                showSuscribe = {true}
                onClose={() => setIsDetailsModalVisible(false)}
            />
        </TouchableOpacity>
        
    );
};

export default EventCard2;

const styles = StyleSheet.create({
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
    cardContent: {
        flex: 1,
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
        flexShrink: 0, // Prevents the date from shrinking
        marginTop: 5, // Adds a small gap between the name and the date if it moves to the next line
        marginLeft: 8, // Moves the date a bit more to the left (closer to the name)
        textAlign: 'right', // Aligns the date to the left if it wraps
        width: '100%', // Ensures it takes up the full width on the next line
        paddingTop: 5,
    },
    eventDescription: {
        fontSize: 14,
        color: '#333',
        marginBottom: 8,
    },
    detailButtonContainer: {
        alignSelf: 'flex-end',
        marginTop: 8,
    }
});