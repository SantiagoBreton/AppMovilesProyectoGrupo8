import React, { useEffect, useState, } from 'react';
import { Modal, View, Text, TouchableOpacity, Image, Platform, ScrollView, StyleSheet, Button, Alert, ActivityIndicator, Pressable, TextInput } from 'react-native';
import { useEventContext } from '@/context/eventContext';
import { getUserProfileImage } from '@/apiCalls/getUserProfileImage';
import { updateProfile } from '@/apiCalls/updateProfile';
import ImageUploader from './ImageUploader';

interface User {
    id: number;
    name: string;
    email: string;
};

interface AdminProfileModalProps {
    isVisible: boolean;
    adminProfileDetails: User | null;
    onClose: () => void;
}

const AdminProfileModal: React.FC<AdminProfileModalProps> = ({
    isVisible,
    adminProfileDetails,
    onClose,
}) => {

    const [isUpdateNameModalVisible, setIsNameModalVisible] = useState(false);
    const [isUpdatePasswordModalVisible, setIsPasswordModalVisible] = useState(false);
    const [newName, setNewName] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const { refreshEvents } = useEventContext();
    const [errorMessageTitle, setErrorMessageTitle] = useState('');
    const [errorMessagePassword, setErrorMessagePassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');
    const [isImageUploader, setIsImageUploader] = useState(false);

    const handleProfileUpdate = async () => {
        if ((!newName && !newPassword)) {
            Alert.alert('Error', 'Por favor, complete al menos un campo para actualizar.');
            return;
        }
        try {
            setIsLoading(true);
            setLoadingMessage('Actualizando detalles del evento...');
            console.log(`newName: ${newName}, newPassword: ${newPassword}`);

            // Fallback to default values if inputs are empty
            const updatedName = newName || adminProfileDetails?.name || '';
            const updatedPassword = newPassword || '';

            // Call the update function with the resolved values
            await updateProfile(adminProfileDetails?.id ?? 0, updatedName, updatedPassword);

            // Refresh and reset
            refreshEvents();
            setNewName('');
            setNewPassword('');
            setIsLoading(false);
            onClose();

            Alert.alert('Éxito', 'El evento se actualizó.');
        } catch (error) {
            console.error('Error updating event:', error);
            Alert.alert('Error', 'No se pudo actualizar el evento.');
        }
    };

    const handleNameChange = (text: string) => {
        if (text.length <= 30) {
            setNewName(text);
            setErrorMessageTitle('');
        }
        else {
            setErrorMessageTitle('El nombre de usuario no puede tener más de 30 caracteres');
        }
    };

    const handlePasswordChange = (text: string) => {
        if (text.length >= 6 && text.length <= 15) {
            setNewPassword(text);
            setErrorMessagePassword('');
        }
        else {
            setErrorMessagePassword('La contraseña no puede tener más de 15 caracteres y menos de 6');
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
                    <Text style={styles.modalTitle1}>Administrar Perfil</Text>
                    <View style={styles.titleSeparator} />

                    {/* Detalles del perfil */}
                    {adminProfileDetails && (
                        <>
                            <Text style={styles.detailsSectionTitle}>Datos del usuario</Text>
                            <View style={styles.elegantDetailsContainer}>
                                {/* Nombre del perfil */}
                                <View style={styles.detailBlock}>
                                    <Text style={styles.detailLabel}>📛 Nombre:</Text>
                                    <Text style={styles.detailValue}>{adminProfileDetails.name}</Text>
                                </View>

                                {/* Email del perfil */}
                                <View style={styles.detailBlock}>
                                    <Text style={styles.detailLabel}>📄 Email:</Text>
                                    <Text style={styles.detailValue}>{adminProfileDetails.email}</Text>
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

                                {/* Cambiar Foto de Perfil */}
                                <Pressable
                                    style={({ pressed }) => [
                                        styles.actionCard,
                                        pressed && styles.actionCardPressed,
                                    ]}
                                    onPress={() => setIsImageUploader(true)}
                                >
                                    <View style={styles.cardIconContainer}>
                                        <Text style={styles.cardIcon}>📝</Text>
                                    </View>
                                    <Text style={styles.cardTitle}>Cambiar foto de Perfil</Text>
                                </Pressable>

                                {/* Cambiar contraseña */}
                                <Pressable
                                    style={({ pressed }) => [
                                        styles.actionCard,
                                        pressed && styles.actionCardPressed,
                                    ]}
                                    onPress={() => setIsPasswordModalVisible(true)}
                                >
                                    <View style={styles.cardIconContainer}>
                                        <Text style={styles.cardIcon}>📝</Text>
                                    </View>
                                    <Text style={styles.cardTitle}>Cambiar Contraseña</Text>
                                </Pressable>
                            </View>
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
                                    onChangeText={handleNameChange}
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
                                {errorMessageTitle ? <Text style={styles.errorMessage}>{errorMessageTitle}</Text> : null}
                            </View>
                        </View>
                    </Modal>

                    {/* Modal for changing Password */}
                    <Modal
                        visible={isUpdatePasswordModalVisible}
                        transparent={true}
                        animationType="slide"
                        onRequestClose={() => setIsPasswordModalVisible(false)}
                    >
                        <View style={styles.modalContainer2}>
                            <View style={styles.modalContent2}>
                                <Text style={styles.modalTitle2}>Cambiar Contraseña</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Nueva Contraseña"
                                    value={newPassword}
                                    onChangeText={handlePasswordChange}
                                />
                                <View style={styles.modalButtons}>
                                    <TouchableOpacity
                                        style={styles.saveButton}
                                        onPress={() => {
                                            setIsPasswordModalVisible(false);
                                            // Handle Save Logic
                                        }}
                                    >
                                        <Text style={styles.saveButtonText}>Guardar</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={styles.cancelButton}
                                        onPress={() => {
                                            setIsPasswordModalVisible(false);
                                            setNewPassword(''); // Clear the input
                                        }}
                                    >
                                        <Text style={styles.cancelButtonText}>Cancelar</Text>
                                    </TouchableOpacity>
                                </View>
                                {errorMessagePassword ? <Text style={styles.errorMessage}>{errorMessagePassword}</Text> : null}
                            </View>
                        </View>
                    </Modal>

                    <View style={styles.titleSeparator} />
                    {/* Botones de acción */}
                    <View style={styles.actionButtons2}>
                        <TouchableOpacity
                            style={styles.updateButton}
                            onPress={() => adminProfileDetails && handleProfileUpdate()}
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
            <ImageUploader
                isVisible={isImageUploader}
                onClose={() => { setIsImageUploader(false); onClose(); }}
            />
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
    textContainer: {
        flex: 1,
    },
    divider: {
        height: 1,
        backgroundColor: '#e5e5e5',
        marginVertical: 10,
    },
    eventEmail: {
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
    errorMessage: {
        color: 'red',
        fontSize: 14,
        textAlign: 'center',
        marginBottom: 10,
    },
    container: {
        flex: 1,
        padding: 20,
    },
    tabContainer: {
        flexDirection: 'row',
        marginBottom: 20,
    },
    tabButton: {
        flex: 1,
        padding: 10,
        borderBottomWidth: 2,
        borderBottomColor: 'lightgray',
        alignItems: 'center',
    },
    activeTabButton: {
        borderBottomColor: '#FF7F50',
    },
    tabText: {
        fontSize: 16,
        color: 'gray',
    },
    activeTabText: {
        color: '#FF7F50',
        fontWeight: 'bold',
    },


    acceptButton: {
        backgroundColor: 'green',
        padding: 5,
        borderRadius: 5,
    },
    acceptButtonText: {
        color: 'white',
    },
    denyButton: {
        backgroundColor: 'red',
        padding: 5,
        borderRadius: 5,
    },
    denyButtonText: {
        color: 'white',
    },
    noPendingUsersText: {
        fontSize: 16,
        color: 'gray',
        textAlign: 'center',
        marginTop: 20,
    },
    noSubscribedUsersText: {
        fontSize: 16,
        color: 'gray',
        textAlign: 'center',
        marginTop: 20,
    },
    loadingContainer: {
        flex: 1,
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,

        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F4F4F4',
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: '#333',
    },

});

export default AdminProfileModal;