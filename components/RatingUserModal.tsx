import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Modal,
    Button,
    TextInput,
    FlatList
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { getAllUserRatings } from '@/apiCalls/getAllUserRatings';
import { createNewRating } from '@/apiCalls/createNewRating';
import AsyncStorage from '@react-native-async-storage/async-storage';



interface User {
    id: number;
    name: string;
    email: string;
    rating: number;
};
interface ReviewModalProps {
    isVisible: boolean;
    user: User | null;
    onClose: () => void;
}
interface Rating {
    comment: string;
    id: number;
    userId: number;
    rating: number;
    ritingUserId: number;
}

const ReviewModal: React.FC<ReviewModalProps> = ({
    isVisible,
    user,
    onClose,
}) => {
    const [rating, setRating] = useState<number>(user?.rating ?? 0); // User rating
    const [modalVisible, setModalVisible] = useState(false); // Modal visibility
    const [userComments, setUserComments] = useState<string>(''); // User input comments
    const [userRating, setUserRating] = useState<Rating[]>([]); // User rating comments
    const [userId, setUserId] = useState<number | null>(null); // User ID
    
    useEffect(() => {
        if (user) {
            getAllUserRatings(user.id).then((response) => {
                setUserRating(response.data);
            });
            const fetchUserId = async () => {
                try {
                    const storedUserId = await AsyncStorage.getItem('userId');
                    if (storedUserId) {
                        setUserId(parseInt(storedUserId, 10)); // Convierte el ID de string a número
                    }
                } catch (error) {
                    console.error('Error fetching userId:', error);
                }
            };
    
            fetchUserId();
        }
    }
    , [user]);
    
    const handleSubmit = async () => {
        if (userComments === '' || rating === 0) {
            alert('Por favor, califica y deja un comentario');
        }
        else{
        if (user && userId !== null)  {
            const newRating = {
                ratingUserId: user.id,
                userId: userId,
                comment: userComments,
                rating: rating,
            };
            const response = await createNewRating(newRating);
            if (response) {
                setModalVisible(false);
            }
        }}
    }

    const handleRating = (newRating: number) => {
        setRating(newRating);
    };

    return (
        <Modal
            visible={isVisible}
            animationType="slide"
            transparent={true}
            onRequestClose={() => setModalVisible(false)}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <Text style={styles.modalTitle}>Deja tu calificación</Text>
                    <Text style={styles.commentsLabel}>Comentario:</Text>
                    <FlatList
                        data={userRating}
                        scrollEnabled={false}
                        renderItem={({ item }) => (
                            <Text style={styles.commentText}>{item.comment}</Text>
                        )}
                        keyExtractor={(item) => item.id.toString()}
                    />


                    {/* Rating Stars */}
                    <View style={styles.starsContainer}>
                        {Array.from({ length: 5 }).map((_, index) => {
                            const starIndex = index + 1;
                            return (
                                <TouchableOpacity
                                    key={index}
                                    onPress={() => handleRating(starIndex)}
                                >
                                    <FontAwesome
                                        name={starIndex <= rating ? 'star' : 'star-o'}
                                        size={30}
                                        color="#FFD700"
                                        style={styles.star}
                                    />
                                </TouchableOpacity>
                            );
                        })}
                    </View>

                    {/* User Comments Input */}
                    <TextInput
                        style={styles.input}
                        placeholder="Escribe tu comentario..."
                        value={userComments}
                        onChangeText={setUserComments}
                        multiline
                    />

                    {/* Submit Button */}
                    <Button title="Enviar" onPress={()=>{handleSubmit();onClose}} />

                    {/* Close Modal */}
                    <TouchableOpacity
                        style={styles.closeButton}
                        onPress={onClose}
                    >
                        <Text style={styles.closeButtonText}>Cerrar</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        marginVertical: 10,
    },
    starsContainer: {
        flexDirection: 'row',
    },
    star: {
        marginHorizontal: 5,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 20,
        width: '90%',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    commentsLabel: {
        fontSize: 16,
        marginBottom: 10,
    },
    commentText: {
        fontSize: 14,
        marginBottom: 20,
        textAlign: 'center',
        color: '#555',
    },
    input: {
        width: '100%',
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        padding: 10,
        marginVertical: 15,
        textAlignVertical: 'top',
    },
    closeButton: {
        marginTop: 10,
        padding: 10,
    },
    closeButtonText: {
        color: '#007BFF',
        fontWeight: 'bold',
    },
});

export default ReviewModal;
