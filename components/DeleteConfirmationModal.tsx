import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface DeleteConfirmationModalProps {
    isVisible: boolean;
    confirmDelete: () => void;
    mensaje: string;
    onClose: () => void;

}

const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
    isVisible,
    confirmDelete,
    mensaje,
    onClose,
}) => {

    return (
        <Modal visible={isVisible} transparent={true} animationType="fade">
            <View style={modalStyles.modalOverlay}>
                <View style={modalStyles.modalContainer}>
                    <Text style={modalStyles.modalTitle}>Confirmar Eliminación</Text>
                    <Text style={modalStyles.modalMessage}>
                        {mensaje}
                    </Text>
                    <View style={modalStyles.modalButtons}>
                        <TouchableOpacity
                            style={[modalStyles.modalButton, modalStyles.cancelButton]}
                            onPress={() => onClose()}
                        >
                            <Text style={modalStyles.cancelButtonText}>Cancelar</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[modalStyles.modalButton, modalStyles.confirmButton]}
                            onPress={confirmDelete}
                        >
                            <Text style={modalStyles.confirmButtonText}>Eliminar</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const modalStyles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContainer: {
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 10,
        width: '80%',
        alignItems: 'center',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#333',
    },
    modalMessage: {
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 20,
        color: '#666',
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
    },
    modalButton: {
        flex: 1,
        padding: 10,
        borderRadius: 5,
        alignItems: 'center',
        marginHorizontal: 5,
    },
    cancelButton: {
        backgroundColor: '#ddd',
    },
    confirmButton: {
        backgroundColor: '#e53935',
    },
    cancelButtonText: {
        color: '#333',
        fontWeight: 'bold',
    },
    confirmButtonText: {
        color: '#fff',
        fontWeight: 'bold',
    }
});

export default DeleteConfirmationModal;