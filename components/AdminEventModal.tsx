import React, { useEffect, useState, } from 'react';
import { Modal, View, Text, TouchableOpacity, Image, Platform, ScrollView, StyleSheet, Button, Alert, ActivityIndicator, Pressable, TextInput } from 'react-native';
import { Float } from 'react-native/Libraries/Types/CodegenTypes';
import DateTimePicker from '@react-native-community/datetimepicker';
import SpectatedUserModal from './SpectatedUserModal';
import { unsubscribeUserFromAnEvent } from '@/apiCalls/unsubscribeUserFromEvent';
import { useEventContext } from '@/context/eventContext';
import { updateEvent } from '@/apiCalls/updateEvent';


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


interface User {
    id: number;
    name: string;
    email: string;
};
interface AdminEventModalProps {
    isVisible: boolean;
    adminEventDetails: EventWithId | null;
    subscribedUsers: User[];
    onClose: () => void;
}



const AdminEventModal: React.FC<AdminEventModalProps> = ({
    isVisible,
    adminEventDetails,
    subscribedUsers,
    onClose,
}) => {

    const [datePickerVisible, setDatePickerVisible] = useState(false);
    const [isUpdateNameModalVisible, setIsNameModalVisible] = useState(false);
    const [isUpdateDescriptionModalVisible, setIsDescriptionModalVisible] = useState(false);
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [fecha, setFecha] = useState('');
    const [newName, setNewName] = useState('');
    const [newDescription, setNewDescription] = useState('');
    const [seeUser, setSeeUser] = useState<User | null>(null);
    const [isSpectatedUserVisible, setIsSpectatedUserVisible] = useState(false);
    const { refreshEvents } = useEventContext();
    const [updatedSubscribedUsers, setUpdatedSubscribedUsers] = useState<User[]>(subscribedUsers);


    useEffect(() => {
        setUpdatedSubscribedUsers(subscribedUsers);
    }, [subscribedUsers]);



    const handleDateChange = (event: any, date?: Date) => {
        setDatePickerVisible(false);

        if (date && date >= new Date()) {
            setSelectedDate(date);
            setFecha(date.toLocaleDateString());
        }
        else {
            setSelectedDate(null);
            Alert.alert('Error', 'Por favor, seleccione una fecha válida.');
        }
    };

    const handleSeeUserProfile = (user: { id: number; name: string; email: string }) => {
        setSeeUser(user)
        setIsSpectatedUserVisible(true);
    }

    const handleEliminateUserFromEvent = async (userId: number, eventId: number) => {
        try {
            await unsubscribeUserFromAnEvent(userId, eventId);
            Alert.alert('Éxito', 'Usuario eliminado del evento correctamente.');

            // Immediately update the subscribed users in the state
            setUpdatedSubscribedUsers((prevUsers) => prevUsers.filter((user) => user.id !== userId));

        } catch (error) {
            Alert.alert('Error', 'No se pudo eliminar al usuario del evento.');
        }
    };


    const handleEventUpdate = async () => {
        if ((!newName && !newDescription && !selectedDate)) {
            Alert.alert('Error', 'Por favor, complete al menos un campo para actualizar.');
            return;
        }
        if (selectedDate && selectedDate <= new Date()) {
            setSelectedDate(adminEventDetails?.date ?? null);
        }
        try {
            console.log(`newName: ${newName}, newDescription: ${newDescription}, selectedDate: ${selectedDate}`);

            // Fallback to default values if inputs are empty
            const updatedName = newName || adminEventDetails?.name || '';
            const updatedDescription = newDescription || adminEventDetails?.description || '';
            const updatedDate = selectedDate || adminEventDetails?.date || new Date();

            console.log(`updatedName: ${updatedName}, updatedDescription: ${updatedDescription}, updatedDate: ${updatedDate}`);

            // Call the update function with the resolved values
            await updateEvent(adminEventDetails?.id ?? 0, updatedName, updatedDescription, updatedDate);

            // Refresh and reset
            refreshEvents();
            setNewName('');
            setNewDescription('');
            setSelectedDate(new Date());
            onClose();

            Alert.alert('Éxito', 'El evento se actualizó.');
        } catch (error) {
            console.error('Error updating event:', error);
            Alert.alert('Error', 'No se pudo actualizar el evento.');
        }
    };


    return (
        <Modal
            visible={isVisible}
            transparent={true}
            animationType="slide"
            onRequestClose={() => onClose()}
        >
            <View style={styles.modalContainer2}>
                <ScrollView contentContainerStyle={styles.modalContent2}>
                    <Text style={styles.modalTitle1}>Administrar Evento</Text>
                    <View style={styles.titleSeparator} />

                    {/* Detalles del evento */}
                    {adminEventDetails && (
                        <>
                            <Text style={styles.detailsSectionTitle}>Detalles del Evento</Text>
                            <View style={styles.elegantDetailsContainer}>
                                {/* Nombre del Evento */}
                                <View style={styles.detailBlock}>
                                    <Text style={styles.detailLabel}>📛 Nombre:</Text>
                                    <Text style={styles.detailValue}>{adminEventDetails.name}</Text>
                                </View>

                                {/* Descripción del Evento */}
                                <View style={styles.detailBlock}>
                                    <Text style={styles.detailLabel}>📄 Descripción:</Text>
                                    <Text style={styles.detailValue}>{adminEventDetails.description}</Text>
                                </View>

                                {/* Fecha del Evento */}
                                <View style={styles.detailBlock}>
                                    <Text style={styles.detailLabel}>📅 Fecha:</Text>
                                    <Text style={styles.detailValue}>
                                        {new Date(adminEventDetails.date).toLocaleDateString('es-ES', {
                                            weekday: 'long',
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric',
                                        })}
                                    </Text>
                                </View>
                            </View>

                            <View style={styles.titleSeparator} />

                            <View style={styles.actionCardsContainer}>
                                {/* Cambiar Nombre */}
                                <Pressable
                                    style={({ pressed }) => [
                                        styles.actionCard,
                                        pressed && styles.actionCardPressed,
                                    ]}
                                    onPress={() => setIsNameModalVisible(true)}
                                >
                                    <View style={styles.cardIconContainer}>
                                        <Text style={styles.cardIcon}>✏️</Text>
                                    </View>
                                    <Text style={styles.cardTitle}>Cambiar Nombre</Text>
                                </Pressable>

                                {/* Cambiar Descripción */}
                                <Pressable
                                    style={({ pressed }) => [
                                        styles.actionCard,
                                        pressed && styles.actionCardPressed,
                                    ]}
                                    onPress={() => setIsDescriptionModalVisible(true)}
                                >
                                    <View style={styles.cardIconContainer}>
                                        <Text style={styles.cardIcon}>📝</Text>
                                    </View>
                                    <Text style={styles.cardTitle}>Cambiar Descripción</Text>
                                </Pressable>

                                {/* Cambiar Fecha */}
                                <Pressable
                                    style={({ pressed }) => [
                                        styles.actionCard,
                                        pressed && styles.actionCardPressed,
                                    ]}
                                    onPress={() => setDatePickerVisible(true)}
                                >
                                    <View style={styles.cardIconContainer}>
                                        <Text style={styles.cardIcon}>📅</Text>
                                    </View>
                                    <Text style={styles.cardTitle}>Cambiar Fecha</Text>
                                </Pressable>
                            </View>



                            {datePickerVisible && (
                                <DateTimePicker
                                    value={selectedDate || new Date()}
                                    mode="date"
                                    display={Platform.OS === 'ios' ? 'inline' : 'default'}
                                    onChange={handleDateChange}
                                />
                            )}


                        </>
                    )}
                    <Modal
                        visible={isUpdateNameModalVisible}
                        transparent={true}
                        animationType="slide"
                        onRequestClose={() => setIsNameModalVisible(false)}
                    >
                        <View style={styles.modalContainer2}>
                            <View style={styles.modalContent2}>
                                <Text style={styles.modalTitle2}>Cambiar Nombre</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Nuevo Nombre"
                                    value={newName}
                                    onChangeText={setNewName}
                                />
                                <View style={styles.modalButtons}>
                                    <TouchableOpacity
                                        style={styles.saveButton}
                                        onPress={() => {
                                            setIsNameModalVisible(false);
                                            // Handle Save Logic
                                        }}
                                    >
                                        <Text style={styles.saveButtonText}>Guardar</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={styles.cancelButton}
                                        onPress={() => {
                                            setIsNameModalVisible(false);
                                            setNewName(''); // Clear the input
                                        }}
                                    >
                                        <Text style={styles.cancelButtonText}>Cancelar</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    </Modal>


                    {/* Modal for changing description */}
                    <Modal
                        visible={isUpdateDescriptionModalVisible}
                        transparent={true}
                        animationType="slide"
                        onRequestClose={() => setIsDescriptionModalVisible(false)}
                    >
                        <View style={styles.modalContainer2}>
                            <View style={styles.modalContent2}>
                                <Text style={styles.modalTitle2}>Cambiar Descripción</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Nueva Descripción"
                                    value={newDescription}
                                    onChangeText={setNewDescription}
                                />
                                <View style={styles.modalButtons}>
                                    <TouchableOpacity
                                        style={styles.saveButton}
                                        onPress={() => {
                                            setIsDescriptionModalVisible(false);
                                            // Handle Save Logic
                                        }}
                                    >
                                        <Text style={styles.saveButtonText}>Guardar</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={styles.cancelButton}
                                        onPress={() => {
                                            setIsDescriptionModalVisible(false);
                                            setNewDescription(''); // Clear the input
                                        }}
                                    >
                                        <Text style={styles.cancelButtonText}>Cancelar</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    </Modal>
                    <View style={styles.titleSeparator} />

                    {/* Lista de usuarios inscriptos */}
                    <Text style={styles.sectionTitle}>Usuarios Inscriptos:</Text>

                    {updatedSubscribedUsers.map((user) => (
                        <View key={user.id} style={styles.userCard}>
                            {/* Profile Picture */}
                            <TouchableOpacity onPress={() => handleSeeUserProfile({ id: user.id, name: user.name, email: user.email })}>
                                <Image
                                    source={{ uri: 'https://www.gravatar.com/avatar/2c7d99fe281ecd3bcd65ab915bac6dd5?s=250' }} // Use default image if no profile picture
                                    style={styles.profilePicture}
                                />
                            </TouchableOpacity>

                            {/* User Info (Name and Eliminate Button) */}
                            <View style={styles.userInfo}>
                                {/* User Name */}
                                <TouchableOpacity onPress={() => handleSeeUserProfile({ id: user.id, name: user.name, email: user.email })}>
                                    <Text style={styles.userName} numberOfLines={1}>
                                        {user.name}
                                    </Text>
                                </TouchableOpacity>

                                <SpectatedUserModal
                                    isVisible={isSpectatedUserVisible}
                                    user={seeUser}
                                    onClose={() => setIsSpectatedUserVisible(false)}
                                />

                                {/* Eliminate Button */}
                                <TouchableOpacity
                                    onPress={() => handleEliminateUserFromEvent(user.id, adminEventDetails?.id ?? 0)}
                                    style={styles.deleteUserButton}
                                >
                                    <Text style={styles.deleteUserText}>Eliminar</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    ))
                    }
                    <View style={styles.titleSeparator} />
                    {/* Botones de acción */}
                    <View style={styles.actionButtons2}>
                        <TouchableOpacity
                            style={styles.updateButton}
                            onPress={() => adminEventDetails && handleEventUpdate()}
                        >
                            <Text style={styles.updateButtonText}>Guardar Cambios</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.closeButton}
                            onPress={() => onClose()}
                        >
                            <Text style={styles.closeButtonText}>Cerrar</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </View>
        </Modal>

    );
};


const styles = StyleSheet.create({
    modalContainer2: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.7)', // Más oscuro para dar profundidad
    },
    modalContent2: {
        width: '90%',
        padding: 20,
        backgroundColor: '#fefefe',
        borderRadius: 15,
        elevation: 10, // Sombra en Android
        shadowColor: '#000', // Sombra en iOS
        shadowOpacity: 0.3,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 5 },
    },
    modalTitle2: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#FF7F50', // Naranja vibrante
        textAlign: 'center',
        marginBottom: 15,
        textTransform: 'uppercase', // Dar estilo más formal
    },
    modalText2: {
        fontSize: 16,
        color: '#555',
        marginBottom: 10,
    },
    actionButtons2: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 20,
    },
    detailsSectionTitle: {
        fontSize: 24, // A bit smaller to create hierarchy
        fontWeight: '600', // Medium weight for differentiation
        color: '#FF6347', // Warm color to create contrast
        backgroundColor: '#fff3e0', // Soft background color to make it pop
        paddingVertical: 10, // Padding to make it feel more like a banner
        paddingHorizontal: 15,
        borderRadius: 20, // Rounded corners for a more modern look
        textAlign: 'center', // Center align the title
        marginBottom: 30, // Increased space below to separate from content
        letterSpacing: 1, // Small spacing to make it feel light
    },
    saveButton: {
        backgroundColor: '#00C851', // Verde llamativo
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 25,
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
        marginHorizontal: 5,
    },
    saveButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    cancelButton: {
        backgroundColor: '#ff4444', // Rojo vibrante
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 25,
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
        marginHorizontal: 5,
    },
    cancelButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    sectionTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#FF7F50',
    },
    deleteUserButton: {
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FF6347',
        paddingVertical: 8,
        paddingHorizontal: 15,
        borderRadius: 5,
    },
    deleteUserText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: 'bold',
    },
    updateButton: {
        backgroundColor: '#007E33', // Verde oscuro
        padding: 12,
        borderRadius: 30,
        alignItems: 'center',
        flex: 1,
        marginRight: 10,
    },
    closeButton: {
        backgroundColor: '#CC0000', // Rojo oscuro
        padding: 12,
        borderRadius: 30,
        alignItems: 'center',
        flex: 1,
    },
    closeButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    userName: {
        fontSize: 18,
        color: '#333',
        marginBottom: 5, // Space between name and button
    },
    updateButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    modalTitle1: {
        fontSize: 32, // Slightly larger for a premium feel
        fontWeight: '600', // Medium weight for sophistication, not too bold
        color: '#4A4A4A', // A neutral, refined dark gray (softer than pure black)
        letterSpacing: 0.5, // Slight spacing to keep it clean and airy
        textTransform: 'capitalize', // Keep it elegant without all caps
        textShadowColor: '#ddd', // Soft, light gray shadow for depth
        textShadowOffset: { width: 0, height: 2 }, // Slight shadow offset
        textShadowRadius: 4, // Soft shadow for gentle emphasis
        marginBottom: 20, // Slight space below to balance with surrounding content
        paddingHorizontal: 20, // More space for a comfortable feel
        textAlign: 'center', // Center the title for balance
    },
    elegantDetailsContainer: {
        padding: 20,
        backgroundColor: '#ffffff', // Fondo blanco
        borderRadius: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 6, // Sombra para Android
        borderWidth: 1,
        borderColor: '#FF7F50', // Un borde naranja sutil
        marginHorizontal: 10, // Separación horizontal
    },
    detailBlock: {
        marginBottom: 20,
    },
    detailLabel: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
        marginBottom: 8,
        textTransform: 'capitalize',
    },
    detailValue: {
        fontSize: 16,
        color: '#555',
        backgroundColor: '#F9F9F9', // Fondo para el valor
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 8,
        lineHeight: 22,
        borderWidth: 1,
        borderColor: '#EAEAEA', // Un borde gris claro
        overflow: 'hidden',
    },
    actionCardsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',  // Distribute buttons evenly
        alignItems: 'center',             // Vertically align buttons in the center
        flexWrap: 'wrap',                 // Allow buttons to wrap to next line if needed
        marginVertical: 20,
    },
    actionCard: {
        width: '30%',                    // Make each button take up 30% of the width
        minWidth: 120,                   // Ensure a minimum width
        height: 120,
        backgroundColor: '#fff',
        borderRadius: 10,
        elevation: 5,                    // Shadow for Android
        shadowColor: '#000',             // Shadow for iOS
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 10,
        marginBottom: 15,                // Add space between buttons
    },
    actionCardPressed: {
        backgroundColor: '#FF9F68',      // Pressed button color
    },
    cardIconContainer: {
        marginBottom: 10,
    },
    cardIcon: {
        fontSize: 30,
        color: '#FF7F50',                // Icon color
    },
    cardTitle: {
        fontSize: 14,
        color: '#333',                   // Elegant text color
        textAlign: 'center',
    },
    userCard: {
        flexDirection: 'row', // Align image and info in a row
        alignItems: 'center',
        marginBottom: 15,
        borderRadius: 8,
        backgroundColor: '#f8f8f8',
        padding: 10,
        elevation: 2, // Add a slight shadow
    },
    input: {
        height: 50,
        borderColor: '#FF7F50', // Orange border
        borderWidth: 1,
        borderRadius: 25, // Rounded edges
        paddingHorizontal: 16,
        backgroundColor: '#f9f9f9', // Light background
        marginBottom: 20, // Margin below the input
    },
    userInfoContainer: {
        flexDirection: 'row',
        flex: 1, // Take up available space
        alignItems: 'stretch',
        marginRight: 15,
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginTop: 20,
    },
    profilePicture: {
        width: 50,
        height: 50,
        borderRadius: 25,
        marginRight: 15,
    },
    nameContainer: {
        flex: 1,
        justifyContent: 'space-between', // Distribute content vertically
        alignItems: 'flex-start',
    },
    userInfo: {
        flexDirection: 'column', // Align name and button vertically
        flex: 1, // Take up available space next to the image
    },
    titleSeparator: {
        borderBottomWidth: 1, // Creates the horizontal line
        borderBottomColor: '#ddd', // Light gray color for the line
        marginVertical: 15, // Space around the line to keep separation clean
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
    textContainer: {
        flex: 1,
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

});

export default AdminEventModal;

