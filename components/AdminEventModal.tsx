import React, { useEffect, useState, } from 'react';
import { Modal, View, Text, TouchableOpacity, Image, Platform, ScrollView, StyleSheet, Pressable, TextInput } from 'react-native';
import { Float } from 'react-native/Libraries/Types/CodegenTypes';
import DateTimePicker from '@react-native-community/datetimepicker';
import { unsubscribeUserFromAnEvent } from '@/apiCalls/unsubscribeUserFromEvent';
import { useEventContext } from '@/context/eventContext';
import { updateEvent } from '@/apiCalls/updateEvent';
import DeleteConfirmationModal from './DeleteConfirmationModal';
import { confirmSubscriptionToAnEvent } from '@/apiCalls/confirmSubscriptionToAnEvent';
import { denySubscriptionToAnEvent } from '@/apiCalls/denySubscriptionToAnEvent';
import { getUserProfileImage } from '@/apiCalls/getUserProfileImage';
import { FontAwesome5 } from '@expo/vector-icons';
import SpectatedUserModal from './SpectatedUserModal';
import ConfirmationModal from './ConfirmationModal';
import SuccessModal from './SuccesModal';
import ErrorModal from './ErrorModal';
import { set } from 'lodash';

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

interface User {
    id: number;
    name: string;
    email: string;
    rating: number;
    description: string;
};
interface AdminEventModalProps {
    isVisible: boolean;
    adminEventDetails: EventWithId | null;
    subscribedUsers: User[];
    requestingUsers: User[];
    onClose: () => void;
}

const AdminEventModal: React.FC<AdminEventModalProps> = ({
    isVisible,
    adminEventDetails,
    subscribedUsers,
    requestingUsers,
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
    const [updatedRequestingUsers, setUpdatedRequestingUsers] = useState<User[]>(requestingUsers);
    const [errorMessageTitle, setErrorMessageTitle] = useState('');
    const [errorMessageDescription, setErrorMessageDescription] = useState('');
    const [errorMessageDate, setErrorMessageDate] = useState('');
    const [activeTab, setActiveTab] = useState<'inscritos' | 'pendientes'>('inscritos');
    const [showTimePicker, setShowTimePicker] = useState(false);
    const [time, setTime] = useState<string>('');
    const [userImages, setUserImages] = useState<{ [key: number]: string }>({});
    const [isConfirmationModalVisible, setIsConfirmationModalVisible] = useState(false);
    const [isSuccessModalVisible, setIsSuccessModalVisible] = useState(false);
    const [isErrorModalVisible, setIsErrorModalVisible] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [succesMessage, setSuccesMessage] = useState('');
    const [confirmationMessage, setConfirmationMessage] = useState('');
    const [onConfirmCallback, setOnConfirmCallback] = useState<(() => void) | null>(null);
    const [onCloseCallback, setOnCloseCallback] = useState<(() => void) | null>(null);


    useEffect(() => {
        setUpdatedSubscribedUsers(subscribedUsers);
        setUpdatedRequestingUsers(requestingUsers);
        updatedRequestingUsers.forEach(async (user: User) => {
            const profileImage = await getUserProfileImage(user.id);
               
            setUserImages((prevImages) => ({
                ...prevImages,
                [user.id]: profileImage.data.imageUrl, // Store only the URL from the response
            }));

        });
        updatedSubscribedUsers.forEach(async (user: User) => {
            const profileImage = await getUserProfileImage(user.id);
           
            setUserImages((prevImages) => ({
                ...prevImages,
                [user.id]: profileImage.data.imageUrl, // Store only the URL from the response
            }));

        });


    }, [subscribedUsers, requestingUsers]);

    const handleDateChange = (event: any, date?: Date) => {
        setDatePickerVisible(false);

        if (date && date >= new Date()) {
            setSelectedDate(date);
            setFecha(date.toLocaleDateString());
            setErrorMessageDate('');
        }
        else {
            setSelectedDate(null);
            setErrorMessage("Seleccione una fecha válida")
            setIsErrorModalVisible(true);
        }
    };

    const handleSeeUserProfile = (user: { id: number; name: string; email: string; rating: number; description: string }) => {
        setSeeUser(user)
        setIsSpectatedUserVisible(true);
    }

    const handleEliminateUserFromEvent = async (userId: number, eventId: number) => {
        try {
            await unsubscribeUserFromAnEvent(userId, eventId);

            setUpdatedSubscribedUsers((prevUsers) => prevUsers.filter((user) => user.id !== userId));
            setSuccesMessage('Usuario eliminado del evento correctamente.');
            setOnCloseCallback(() => () => setIsSuccessModalVisible(false));
            setIsSuccessModalVisible(true);


        } catch (error) {
            setErrorMessage('No se pudo eliminar al usuario del evento.');
            setIsErrorModalVisible(true);
        }
    };

    const handleEventUpdate = async () => {
        if ((!newName && !newDescription && !selectedDate && !time)) {
            setErrorMessage('Complete al menos un campo.');
            setIsErrorModalVisible(true);
            return;
        }
        if (selectedDate && selectedDate <= new Date()) {
            setSelectedDate(adminEventDetails?.date ?? null);
        }
        try {
            const updatedName = newName || adminEventDetails?.name || '';
            const updatedDescription = newDescription || adminEventDetails?.description || '';
            const updatedDate = selectedDate || adminEventDetails?.date || new Date();
            const updatedTime = time || adminEventDetails?.time || '';

            await updateEvent(adminEventDetails?.id ?? 0, updatedName, updatedDescription, updatedDate, updatedTime);

            refreshEvents();
            setNewName('');
            setNewDescription('');
            setSelectedDate(new Date());
            setOnCloseCallback(() => onClose);
            setSuccesMessage('Evento actualizado correctamente.');
            setIsSuccessModalVisible(true);

        } catch (error) {
            setErrorMessage('No se pudo actualizar el evento.');
            setIsErrorModalVisible(true);
        }
    };

    const handleEventTitleChange = (text: string) => {
        if (text.length <= 30) {
            setNewName(text);
            setErrorMessageTitle('');
        }
        else {
            setErrorMessageTitle('El nombre de usuario no puede tener más de 30 caracteres');
        }
    };

    const handleDescriptionChange = (text: string) => {
        if (text.length <= 100) {
            setNewDescription(text);
            setErrorMessageDescription('');
        }
        else {
            setErrorMessageDescription('La descripcion no puede tener más de 100 caracteres');
        }
    };

    const handleAcceptUser = async (userId: number) => {
        try {
            if (adminEventDetails?.id !== undefined) {
                const response = await confirmSubscriptionToAnEvent(adminEventDetails.id, userId);
                if (response) {
                    setSuccesMessage('Usuario aceptado en el evento correctamente.');
                    setOnCloseCallback(() => () => setIsSuccessModalVisible(false));
                    setUpdatedSubscribedUsers((prevUsers) => [...prevUsers, requestingUsers.find((user) => user.id === userId) ?? { id: 0, name: '', email: '', rating: 0, description: '' }]);
                    setUpdatedRequestingUsers((prevUsers) => prevUsers.filter((user) => user.id !== userId));
                    requestingUsers = requestingUsers.filter((user) => user.id !== userId);
                    refreshEvents();
                    setIsSuccessModalVisible(true);
                }
            }
            else {
                setErrorMessage('No se pudo obtener el ID del evento.');
                setIsErrorModalVisible(true);
            }


        } catch (error: any) {
            setErrorMessage('No se pudo aceptar al usuario en el evento.');
            setIsErrorModalVisible(true);
        }
    };

    const handleDenyUser = async (userId: number) => {
        try {
            if (adminEventDetails?.id !== undefined) {
                const response = await denySubscriptionToAnEvent(adminEventDetails.id, userId);
                if (response) {
                    setSuccesMessage('Usuario denegado en el evento correctamente.');
                    setOnCloseCallback(() => () => setIsSuccessModalVisible(false));
                    setIsSuccessModalVisible(true);
                    setUpdatedRequestingUsers((prevUsers) => prevUsers.filter((user) => user.id !== userId));
                    requestingUsers = requestingUsers.filter((user) => user.id !== userId);
                    refreshEvents();
                }
            }
            else {
                setErrorMessage('No se pudo obtener el ID del evento.');
                setIsErrorModalVisible(true);
            }


        } catch (error: any) {
            setErrorMessage('No se pudo denegar al usuario en el evento.');
            setIsErrorModalVisible(true);
        }
    };
    const onTimeChange = (event: any, selectedTime?: Date) => {
        setShowTimePicker(false);
        if (selectedTime) {
            const hours = selectedTime.getHours().toString().padStart(2, '0');
            const minutes = selectedTime.getMinutes().toString().padStart(2, '0');
            setTime(`${hours}:${minutes}`);
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
                                <View style={styles.detailBlock}>
                                    <Text style={styles.detailLabel}>🕒 Hora:</Text>
                                    <Text style={styles.detailValue}>{adminEventDetails.time}</Text>
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
                                {errorMessageDate ? <Text style={styles.errorMessage}>{errorMessageDate}</Text> : null}


                                {/* Cambiar hora */}
                                <Pressable
                                    style={({ pressed }) => [
                                        styles.actionCard,
                                        pressed && styles.actionCardPressed,
                                    ]}
                                    onPress={() => setShowTimePicker(true)}
                                >
                                    <View style={styles.cardIconContainer}>
                                        <Text style={styles.cardIcon}>🕒</Text>
                                    </View>
                                    <Text style={styles.cardTitle}>Cambiar Hora</Text>
                                    {showTimePicker && (
                                        <DateTimePicker
                                            value={new Date()}
                                            mode="time"
                                            display="default"
                                            onChange={onTimeChange}
                                        />
                                    )}
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
                                    onChangeText={handleEventTitleChange}
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
                                            setNewName('');
                                        }}
                                    >
                                        <Text style={styles.cancelButtonText}>Cancelar</Text>
                                    </TouchableOpacity>
                                </View>
                                {errorMessageTitle ? <Text style={styles.errorMessage}>{errorMessageTitle}</Text> : null}
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
                                    onChangeText={handleDescriptionChange}
                                />
                                <View style={styles.modalButtons}>
                                    <TouchableOpacity
                                        style={styles.saveButton}
                                        onPress={() => {
                                            setIsDescriptionModalVisible(false);
                                        }}
                                    >
                                        <Text style={styles.saveButtonText}>Guardar</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={styles.cancelButton}
                                        onPress={() => {
                                            setIsDescriptionModalVisible(false);
                                            setNewDescription('');
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

                    {/* Lista de usuarios inscriptos */}
                    <View style={styles.container}>
                        {/* Tabs */}
                        <View style={styles.tabContainer}>
                            <TouchableOpacity
                                style={[styles.tabButton, activeTab === 'inscritos' && styles.activeTabButton]}
                                onPress={() => setActiveTab('inscritos')}
                            >
                                <Text style={[styles.tabText, activeTab === 'inscritos' && styles.activeTabText]}>
                                    Usuarios Inscritos
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.tabButton, activeTab === 'pendientes' && styles.activeTabButton]}
                                onPress={() => setActiveTab('pendientes')}
                            >
                                <Text style={[styles.tabText, activeTab === 'pendientes' && styles.activeTabText]}>
                                    Usuarios Pendientes
                                </Text>
                            </TouchableOpacity>
                        </View>

                        {/* Contenido basado en la pestaña activa */}
                        {activeTab === 'inscritos' && (
                            <View>
                                <Text style={styles.sectionTitle}>Usuarios Inscriptos:</Text>
                                {updatedSubscribedUsers.length === 0 ? (
                                    <Text style={styles.noSubscribedUsersText}>No hay usuarios inscritos.</Text>
                                ) : (
                                    updatedSubscribedUsers.map((user) => (
                                        <View key={user.id} style={styles.userCard}>
                                            <TouchableOpacity onPress={() => handleSeeUserProfile(user)}>
                                                {userImages[user.id] ? (
                                                    <Image source={{ uri: userImages[user.id] }} style={styles.profilePicture} />
                                                ) : (
                                                    <FontAwesome5 name="user" size={30} color="#FF7F50" />
                                                )}
                                            </TouchableOpacity>
                                            <View style={styles.userInfo}>
                                                <TouchableOpacity onPress={() => handleSeeUserProfile(user)}>
                                                    <Text style={styles.userName}>{user.name}</Text>
                                                </TouchableOpacity>
                                                <TouchableOpacity
                                                    onPress={() => { if (adminEventDetails) { setOnConfirmCallback(() => () => handleEliminateUserFromEvent(user.id, adminEventDetails.id)); setConfirmationMessage('¿Estás seguro de que deseas eliminar al usuario del evento?'); setIsConfirmationModalVisible(true); } }}

                                                    style={styles.deleteUserButton}
                                                >
                                                    <Text style={styles.deleteUserText}>Eliminar</Text>
                                                </TouchableOpacity>

                                            </View>
                                        </View>
                                    ))
                                )}
                            </View>
                        )}

                        {activeTab === 'pendientes' && (
                            <View>
                                <Text style={styles.sectionTitle}>Usuarios Pendientes:</Text>
                                {updatedRequestingUsers.length === 0 ? (
                                    <Text style={styles.noPendingUsersText}>No hay solicitudes pendientes.</Text>
                                ) : (
                                    updatedRequestingUsers.map((user) => (
                                        <View key={user.id} style={styles.userCard}>
                                            <TouchableOpacity onPress={() => handleSeeUserProfile(user)}>
                                                {userImages[user.id] ? (
                                                    <Image source={{ uri: userImages[user.id] }} style={styles.profilePicture} />
                                                ) : (
                                                    <FontAwesome5 name="user" size={30} color="#FF7F50" />
                                                )}
                                            </TouchableOpacity>
                                            <View style={styles.userInfo}>
                                                <TouchableOpacity onPress={() => handleSeeUserProfile(user)}>
                                                    <Text style={styles.userName}>{user.name}</Text>
                                                </TouchableOpacity>
                                                <View style={styles.actionButtons}>
                                                    <TouchableOpacity
                                                        onPress={() => { setOnConfirmCallback(() => () => handleAcceptUser(user.id)); setConfirmationMessage('¿Estás seguro de que deseas aceptar al usuario en el evento?'); setIsConfirmationModalVisible(true); }}
                                                        style={styles.acceptButton}
                                                    >
                                                        <Text style={styles.acceptButtonText}>Aceptar</Text>
                                                    </TouchableOpacity>
                                                    <TouchableOpacity
                                                        onPress={() => { setOnConfirmCallback(() => () => handleDenyUser(user.id)); setConfirmationMessage('¿Estás seguro de que deseas denegar al usuario en el evento?'); setIsConfirmationModalVisible(true); }}
                                                        style={styles.denyButton}
                                                    >
                                                        <Text style={styles.denyButtonText}>Denegar</Text>
                                                    </TouchableOpacity>
                                                </View>
                                            </View>
                                        </View>
                                    ))
                                )}
                            </View>
                        )}
                    </View>
                    <View style={styles.titleSeparator} />
                    {/* Botones de acción */}
                    <View style={styles.actionButtons2}>
                        <TouchableOpacity
                            style={styles.updateButton}
                            onPress={() => { setOnConfirmCallback(() => handleEventUpdate); setConfirmationMessage('¿Estás seguro de que deseas actualizar el evento?'); setIsConfirmationModalVisible(true); }}
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
            <SpectatedUserModal
                isVisible={isSpectatedUserVisible}
                user={seeUser}
                onClose={() => setIsSpectatedUserVisible(false)}
            />
            <ConfirmationModal
                visible={isConfirmationModalVisible}
                title="Confirmación"
                message={confirmationMessage}
                onConfirm={() => {
                    if (onConfirmCallback) {
                        onConfirmCallback(); // Ejecuta la función que pasaste
                    }; setIsConfirmationModalVisible(false);
                }}
                onCancel={() => setIsConfirmationModalVisible(false)}
            />
            <SuccessModal
                visible={isSuccessModalVisible}
                message={succesMessage}
                onClose={() => {
                    if (onCloseCallback) {
                        onCloseCallback();
                        setIsSuccessModalVisible(false) // Ejecuta la función que pasaste
                    }
                }}
            />
            <ErrorModal
                visible={isErrorModalVisible}
                title="Error"
                message={errorMessage}
                onClose={() => setIsErrorModalVisible(false)}
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
    userName: {
        fontSize: 18,
        color: '#333',
        marginBottom: 5,
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
    userCard: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
        borderRadius: 8,
        backgroundColor: '#f8f8f8',
        padding: 10,
        elevation: 2,
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
    profilePicture: {
        width: 50,
        height: 50,
        borderRadius: 25,
        marginRight: 15,
    },
    userInfo: {
        flexDirection: 'column',
        flex: 1,
    },
    titleSeparator: {
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
        marginVertical: 15,
    },
    actionButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10,
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
    }
});

export default AdminEventModal;