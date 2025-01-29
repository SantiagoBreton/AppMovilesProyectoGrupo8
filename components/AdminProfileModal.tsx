import React, { useEffect, useState, } from 'react';
import { Modal, View, Text, TouchableOpacity, ScrollView, StyleSheet, Pressable, TextInput } from 'react-native';
import { useEventContext } from '@/context/eventContext';
import { updateProfile } from '@/apiCalls/updateProfile';
import ImageUploader from './ImageUploader';
import ConfirmationModal from './ConfirmationModal';
import SuccessModal from './SuccesModal';
import ErrorModal from './ErrorModal';

interface User {
    id: number;
    name: string;
    email: string;
    description: string;
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
    const [isUpdateDescriptionModalVisible, setIsDescriptionModalVisible] = useState(false);
    const [newName, setNewName] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [newDescription, setNewDescription] = useState('');
    const { refreshEvents } = useEventContext();
    const [errorMessageTitle, setErrorMessageTitle] = useState('');
    const [errorMessagePassword, setErrorMessagePassword] = useState('');
    const [errorMessageDescription, setErrorMessageDescription] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');
    const [isImageUploader, setIsImageUploader] = useState(false);
    const [isSuccessModalVisible, setIsSuccessModalVisible] = useState(false);
    const [isConfirmationModalVisible, setIsConfirmationModalVisible] = useState(false);
    const [isErrorModalVisible, setIsErrorModalVisible] = useState(false);
    const[errorMessage, setErrorMessage] = useState('');

    const handleProfileUpdate = async () => {
        setIsConfirmationModalVisible(false);
        if ((!newName && !newPassword && !newDescription)) {
            setErrorMessage('Por favor, complete al menos un campo para actualizar.');
            setIsErrorModalVisible(true);
            return;
        }
        try {
            setIsLoading(true);
            setLoadingMessage('Actualizando detalles del evento...');
    
            const updatedName = newName || adminProfileDetails?.name || '';
            const updatedPassword = newPassword || '';
            const updatedDescription = newDescription || adminProfileDetails?.description || '';

            await updateProfile(adminProfileDetails?.id ?? 0, updatedName, updatedPassword, updatedDescription);

            refreshEvents();
            setNewName('');
            setNewPassword('');
            setNewDescription('');
            setIsLoading(false);
            setIsSuccessModalVisible(true);

        } catch (error) {
            setErrorMessage('Hubo un error al actualizar los detalles del evento. Por favor, inténtelo de nuevo.');
            setIsErrorModalVisible(true);
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

    const handleDescriptionChange = (text: string) => {
        if (text.length <= 150) {
            setNewDescription(text);
            setErrorMessageDescription('');
        }
        else {
            setErrorMessageDescription('La descripción de usuario no puede tener más de 150 caracteres');
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
                                {/* Email del perfil */}
                                <View style={styles.detailBlock}>
                                    <Text style={styles.detailLabel}>📄 Descripción:</Text>
                                    <Text style={styles.detailValue}>{adminProfileDetails.description}</Text>
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

                                {/* Cambiar descripcion */}
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

                    {/* Modal for changing descrption */}
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
                                    onChangeText={handleDescriptionChange}
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
                                {errorMessageDescription ? <Text style={styles.errorMessage}>{errorMessageDescription}</Text> : null}
                            </View>
                        </View>
                    </Modal>

                    <View style={styles.titleSeparator} />
                    {/* Botones de acción */}
                    <View style={styles.actionButtons2}>
                        <TouchableOpacity
                            style={styles.updateButton}
                            onPress={() => adminProfileDetails && setIsConfirmationModalVisible(true)}
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
            <ConfirmationModal
                visible={isConfirmationModalVisible}
                title="Confirmar"
                message={"¿Estás seguro de que deseas actualizar los datos de tu perfil?"}
                onConfirm={() => { handleProfileUpdate(); }}
                onCancel={() => { setIsConfirmationModalVisible(false); }}
            />
            <SuccessModal
                visible={isSuccessModalVisible}
                message="Los datos de tu perfil se actualizaron."
                onClose={() => { setIsSuccessModalVisible(false); onClose(); }}
            />
            <ErrorModal
                visible={isErrorModalVisible}
                title="Error"
                message={errorMessage}
                onClose={() => { setIsErrorModalVisible(false); }}
            />
        </Modal>

    );
};

const styles = StyleSheet.create({
    modalContainer2: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
    },
    modalContent2: {
        width: '90%',
        padding: 20,
        backgroundColor: '#fefefe',
        borderRadius: 15,
        elevation: 10,
        shadowColor: '#000',
        shadowOpacity: 0.3,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 5 },
    },
    modalTitle2: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#FF7F50',
        textAlign: 'center',
        marginBottom: 15,
        textTransform: 'uppercase',
    },
    actionButtons2: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 20,
    },
    detailsSectionTitle: {
        fontSize: 24,
        fontWeight: '600',
        color: '#FF6347', 
        backgroundColor: '#fff3e0',
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderRadius: 20,
        textAlign: 'center',
        marginBottom: 30,
        letterSpacing: 1,
    },
    saveButton: {
        backgroundColor: '#00C851',
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
        backgroundColor: '#ff4444',
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
    updateButton: {
        backgroundColor: '#007E33',
        padding: 12,
        borderRadius: 30,
        alignItems: 'center',
        flex: 1,
        marginRight: 10,
    },
    closeButton: {
        backgroundColor: '#CC0000',
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
    updateButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    modalTitle1: {
        fontSize: 32,
        fontWeight: '600',
        color: '#4A4A4A',
        letterSpacing: 0.5,
        textTransform: 'capitalize',
        textShadowColor: '#ddd',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 4,
        marginBottom: 20,
        paddingHorizontal: 20,
        textAlign: 'center',
    },
    elegantDetailsContainer: {
        padding: 20,
        backgroundColor: '#ffffff',
        borderRadius: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 6,
        borderWidth: 1,
        borderColor: '#FF7F50',
        marginHorizontal: 10,
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
        backgroundColor: '#F9F9F9',
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 8,
        lineHeight: 22,
        borderWidth: 1,
        borderColor: '#EAEAEA',
        overflow: 'hidden',
    },
    actionCardsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center', 
        flexWrap: 'wrap', 
        marginVertical: 20,
    },
    actionCard: {
        width: '30%', 
        minWidth: 120,
        height: 120,
        backgroundColor: '#fff',
        borderRadius: 10,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 10,
        marginBottom: 15,
    },
    actionCardPressed: {
        backgroundColor: '#FF9F68',
    },
    cardIconContainer: {
        marginBottom: 10,
    },
    cardIcon: {
        fontSize: 30,
        color: '#FF7F50',
    },
    cardTitle: {
        fontSize: 14,
        color: '#333',
        textAlign: 'center',
    },
    input: {
        height: 50,
        borderColor: '#FF7F50',
        borderWidth: 1,
        borderRadius: 25,
        paddingHorizontal: 16,
        backgroundColor: '#f9f9f9',
        marginBottom: 20,
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginTop: 20,
    },
    titleSeparator: {
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
        marginVertical: 15,
    },
    errorMessage: {
        color: 'red',
        fontSize: 14,
        textAlign: 'center',
        marginBottom: 10,
    },
});

export default AdminProfileModal;