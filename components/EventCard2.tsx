import React, { useState } from "react";
import { TouchableOpacity, View, Text, StyleSheet, Button } from "react-native";
import { Float } from "react-native/Libraries/Types/CodegenTypes";
import EventDetailModal from "./EventDetailModal";
import { getCategoryBackgroundColor } from "@/constants/CategoryColor";

interface EventWithId {
    id: number;
    name: string;
    date: Date;
    latitude: Float;
    longitude: Float;
    description: string;
    maxParticipants: number;
    currentParticipants: number;
    time: string;
    category: any;
    userId: number;
};

interface EventCard2Props {
    event: EventWithId | null;
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

    const backgroundColor = event ? getCategoryBackgroundColor(event) : '#fef6f2';

    return (
        <View>
            <TouchableOpacity
                style={[styles.eventCard, { borderLeftColor: backgroundColor }]}
                onPress={() => event && handleDetailsEvent(event)}
            >
                <View style={[styles.cardContent]}>
                    <Text style={[styles.eventCategory, { backgroundColor: backgroundColor }]}>
                        {event?.category ? event.category.name : 'Categoría no disponible'}
                    </Text>
                    <Text style={[styles.eventName, {color: backgroundColor}]} numberOfLines={2}>{event?.name}</Text>
                    <View style={styles.dateTimeContainer}>
                        <Text style={styles.eventDate}>
                            {event?.date ? new Date(event.date).toLocaleDateString() : 'Fecha no disponible'}
                        </Text>
                        <Text style={styles.eventTime}>
                            {event?.time ? event.time : 'Hora no disponible'}
                        </Text>
                    </View>

                    <Text style={styles.eventDescription}>{event?.description}</Text>
                </View>
            </TouchableOpacity>
            <EventDetailModal
                    visible={isDetailsModalVisible}
                    eventDetails={eventDetails as EventWithId | null}
                    onClose={() => setIsDetailsModalVisible(false)}
                />
        </View>

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
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
        elevation: 3,
    },
    cardContent: {
        marginBottom: 12,
    },
    eventName: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    dateTimeContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    eventDate: {
        fontSize: 15,
        color: '#888',
        fontStyle: 'italic',
        textAlign: 'left',
        marginRight: 10, 
    },
    eventTime: {
        fontSize: 15,
        color: '#888',
        fontStyle: 'italic',
        textAlign: 'right',
        fontWeight: 'bold',
    },
    eventCategory: {
        fontSize: 16,
        fontWeight: '700',
        color: '#fff',
        paddingVertical: 8,
        paddingHorizontal: 20,
        borderRadius: 25,
        textAlign: 'center',
        letterSpacing: 1,
        marginBottom: 15,
    },
    eventDescription: {
        fontSize: 14,
        color: '#333',
        marginBottom: 20,
        textAlign: 'justify',
        lineHeight: 20,
    }
});