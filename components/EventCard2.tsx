import React, { useState } from "react";
import { TouchableOpacity, View, Text, StyleSheet, Button } from "react-native";
import { Float } from "react-native/Libraries/Types/CodegenTypes";
import EventDetailModal from "./EventDetailModal";


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
    return (
        <TouchableOpacity
            style={styles.eventCard}
            onPress={() => event && handleDetailsEvent(event)}
        >
            <View style={styles.cardContent}>
                <Text style={styles.eventName} numberOfLines={2}>{event?.name}</Text>
                <View style={styles.dateTimeContainer}>
                    <Text style={styles.eventDate}>
                        {event?.date ? new Date(event.date).toLocaleDateString() : 'Fecha no disponible'}
                    </Text>
                    <Text style={styles.eventTime}>
                        {event?.time ? event.time : 'Hora no disponible'}
                    </Text>
                </View>
                <Text style={styles.eventCategory}>
                    {event?.category ? event.category.name : 'Categoría no disponible'}
                </Text>
                <Text style={styles.eventDescription}>{event?.description}</Text>
            </View>

            <View style={styles.detailButtonContainer}>
                <Button
                    title="Ver Detalles"
                    onPress={() => event && handleDetailsEvent(event)}
                    color="#FF7F50"
                />
            </View>

            <EventDetailModal
                visible={isDetailsModalVisible}
                eventDetails={eventDetails as EventWithId | null}
                showSuscribe={true}
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
        marginBottom: 12,
    },
    eventName: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#FF7F50',
        marginBottom: 8,
    },
    // Contenedor de la fecha y hora
    dateTimeContainer: {
        flexDirection: 'row', // Organiza la fecha y hora en una fila
        justifyContent: 'space-between', // Separa la fecha y la hora
        marginBottom: 10, // Aumenté el espacio para más claridad
    },
    
    // Fecha
    eventDate: {
        fontSize: 15,
        color: '#888',  // Cambié el color a algo más suave
        fontStyle: 'italic',
        textAlign: 'left',
        marginRight: 10, // Un poco de separación entre la fecha y la hora
    },
    
    // Hora
    eventTime: {
        fontSize: 15,
        color: '#888',
        fontStyle: 'italic',
        textAlign: 'right',
        fontWeight: 'bold', // Hice la hora más destacada
    },
    
    // Categoría
    eventCategory: {
        fontSize: 16,
        fontWeight: '700',
        color: '#fff',
        backgroundColor: '#FF7F50', // Fondo más llamativo
        paddingVertical: 5,
        paddingHorizontal: 15,
        borderRadius: 25, // Borde redondeado para un look más moderno
        marginBottom: 12,
        textAlign: 'center',
        letterSpacing: 1, // Espaciado de letras para darle más estilo
    },
    
    eventDescription: {
        fontSize: 14,
        color: '#333',
        marginBottom: 20,
        textAlign: 'justify',  // Mejor alineación para la descripción
        lineHeight: 20, // Aumento de altura de línea para mejorar la legibilidad
    },
    
    detailButtonContainer: {
        alignSelf: 'flex-end',
    }
});