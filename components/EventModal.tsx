import React from "react";
import { Modal, TouchableOpacity, View, Text, StyleSheet } from "react-native";
import { Float } from "react-native/Libraries/Types/CodegenTypes";

interface EventDetailsModalProps {
    isVisible: boolean;
    eventDetails: EventWithId | null;
    showUnsubscribe?: boolean;
    onUnsubscribe?: () => void;
    onClose: () => void;
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
        userId: number;
    };

const EventDetailsModal: React.FC<EventDetailsModalProps> = ({
    isVisible,
    eventDetails,
    showUnsubscribe = false,
    onUnsubscribe,
    onClose,
}) => {
    
    return (
        <Modal
            visible={isVisible}
            transparent={true}
            animationType="slide"
            onRequestClose={onClose}
        >
            <View style={styles.modalContainer}>
                <View style={styles.modalContent}>
                    {eventDetails && (
                        <>
                            <Text style={styles.modalTitle}>{eventDetails.name}</Text>
                            <View style={styles.modalSection}>
                                <Text style={styles.modalLabel}>Descripción:</Text>
                                <Text style={styles.modalText}>{eventDetails.description}</Text>
                            </View>
                            <View style={styles.modalSection}>
                                <Text style={styles.modalLabel}>Fecha:</Text>
                                <Text style={styles.modalText}>
                                    {new Date(eventDetails.date).toLocaleDateString()}
                                </Text>
                            </View>
                            <View style={styles.modalSection}>
                                <Text style={styles.modalLabel}>Participantes:</Text>
                                <Text style={styles.modalText}>
                                    {eventDetails.currentParticipants}/{eventDetails.maxParticipants}
                                </Text>
                            </View>
                            {showUnsubscribe && onUnsubscribe && (
                                <TouchableOpacity
                                    style={styles.modalActionButton}
                                    onPress={onUnsubscribe}
                                >
                                    <Text style={styles.modalActionButtonText}>Desuscribirse</Text>
                                </TouchableOpacity>
                            )}
                        </>
                    )}
                    <TouchableOpacity
                        style={[styles.modalActionButton, { backgroundColor: 'red' }]}
                        onPress={onClose}
                    >
                        <Text style={styles.closeButtonText}>Cerrar</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};

export default EventDetailsModal;

const styles = StyleSheet.create({
    container: {
        marginTop: 30,
        flex: 1,
        padding: 16,
        backgroundColor: '#ffffff',
    },
    subHeader: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginTop: 20,
        marginBottom: 10,
    },
    buttonContainer: {
        flexDirection: 'row',        // Alineación de los botones en fila
        justifyContent: 'space-between', // Espaciado entre los botones
        marginBottom: 20,            // Margen abajo para separar de la lista
    },
    header: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        color: '#FF7F50',
    },
    modalSection: {
        marginBottom: 10,
        paddingVertical: 5,
        borderBottomWidth: 1,
        borderBottomColor: '#FF7F50',
    },
    modalLabel: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#FF7F50',
    },
    modalText: {
        fontSize: 14,
        color: '#333',
    },
    modalActionButton: {
        marginTop: 20,
        alignSelf: 'center',
        paddingVertical: 12,
        paddingHorizontal: 30,
        backgroundColor: '#FF7F50',
        borderRadius: 25,
    },
    modalActionButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    closeMapButton: {
        position: 'absolute',
        bottom: 10,
        paddingVertical: 10,
        paddingHorizontal: 20,
        backgroundColor: '#f44336',
        borderRadius: 5,
    },
    closeMapButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    buttonWrapper: {
        width: '45%',               // Controla el ancho de cada botón
    },
    mapModalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    mapModalContent: {
        width: '90%',
        height: '60%',
        backgroundColor: '#fff',
        borderRadius: 10,
        overflow: 'hidden',
        alignItems: 'center',
    },
    map: {
        width: '100%',
        height: '100%',
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)', // Overlay for modal
    },
    modalContent: {
        width: '80%', // Adjust width if needed
        backgroundColor: '#ffffff', // White background
        borderRadius: 15, // Rounded edges
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5, // For Android shadow
    },
    modalTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#FF7F50', // Orange color for title
        textAlign: 'center',
        marginBottom: 15,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    closeButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    eventCard: {
        backgroundColor: '#f9f9f9',
        borderRadius: 15,
        marginVertical: 10,
        marginHorizontal: 16,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 5,
        borderWidth: 1,
        borderColor: '#e6e6e6',
    },
    headerSection: {
        flexDirection: 'row',
        justifyContent: 'space-between', // Pushes name and date to opposite ends
        alignItems: 'center',
        marginBottom: 8,
    },
    eventName: {
        fontSize: 20,
        fontWeight: '700',
        color: '#333',
        textTransform: 'capitalize',
        flex: 1, // Ensures the name takes up available space
    },
    eventDate: {
        fontSize: 14,
        fontStyle: 'italic',
        color: '#6b7280',
        backgroundColor: '#f1f1f1',
        padding: 4,
        borderRadius: 5,
        textAlign: 'right', // Aligns text to the right
        maxWidth: '40%', // Ensures it doesn’t take too much space
    },
    divider: {
        height: 1,
        backgroundColor: '#e5e5e5',
        marginVertical: 10,
    },
    eventDescription: {
        fontSize: 16,
        color: '#4b5563',
        lineHeight: 22,
        marginBottom: 12,
        textAlign: 'justify',
    },
    actionButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10,
    },
    adminButton: {
        backgroundColor: '#3b82f6',
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 8,
    },
    adminButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
        textTransform: 'uppercase',
    },
    deleteButton: {
        backgroundColor: '#ef4444',
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 8,
    },
    deleteButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
        textTransform: 'uppercase',
    },
    detailsButton: {
        backgroundColor: '#6366f1',
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 8,
    },
    detailsButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
        textTransform: 'uppercase',
    },
    unsubscribeButton: {
        backgroundColor: '#f59e0b',
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 8,
    },
    unsubscribeButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
        textTransform: 'uppercase',
    }
});