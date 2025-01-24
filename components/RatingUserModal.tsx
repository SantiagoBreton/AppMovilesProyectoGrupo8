import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Modal,
    Button,
    TextInput,
    FlatList,
    Animated
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
    refreshData: () => void;
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
    refreshData,
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
        else {
            if (user && userId !== null) {
                const newRating = {
                    ratingUserId: userId,
                    userId: user.id,
                    comment: userComments,
                    rating: rating,
                };
                const response = await createNewRating(newRating);
                if (response) {
                    setModalVisible(false);
                    const newReview = { comment: userComments, rating, id: Date.now(), userId: user.id, ritingUserId: userId };
                    setUserRating([...userRating, newReview]); // Update the state with the new review

                    refreshData(); // Trigger data refresh
                    onClose(); // Close the modal
                }
            }
        }
    }

    const handleRating = (newRating: number) => {
        setRating(newRating);
    };

    return (
        <Modal visible={isVisible} transparent={true} animationType="fade">
            <View style={styles.modalOverlay}>
                {user && user.id != userId ? (
                    <View style={styles.modalContent}>
                        {/* Title */}

                        <Text style={styles.modalTitle}>Deja tu calificación</Text>

                        {/* Ratings Section */}
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
                                            size={40}
                                            color={starIndex <= rating ? '#FFD700' : '#E0E0E0'}
                                            style={styles.star}
                                        />
                                    </TouchableOpacity>
                                );
                            })}
                        </View>

                        {/* Review Input */}
                        <TextInput
                            style={styles.input}
                            placeholder="Escribe tu comentario aquí..."
                            value={userComments}
                            onChangeText={setUserComments}
                            multiline={true}
                        />
                        <View style={styles.titleSeparator} />

                        {/* User Comments Section */}
                        <View style={styles.commentsContainer}>
                            <FlatList
                                data={userRating}
                                renderItem={({ item }) => (
                                    <View style={styles.commentCard}>
                                        <Text style={styles.commentText}>{item.comment}</Text>
                                        <View style={styles.commentRating}>
                                            {Array.from({ length: 5 }).map((_, i) => (
                                                <FontAwesome
                                                    key={i}
                                                    name={i < item.rating ? 'star' : 'star-o'}
                                                    size={16}
                                                    color="#FFD700"
                                                />
                                            ))}
                                        </View>
                                    </View>
                                )}
                                keyExtractor={(item) => item.id.toString()}
                            />
                        </View>

                        {/* Submit Button */}
                        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
                            <Text style={styles.submitButtonText}>Enviar</Text>
                        </TouchableOpacity>

                        {/* Close Button */}
                        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                            <FontAwesome name="times" size={24} color="#FFF" />
                        </TouchableOpacity>
                    </View>
                ) : (
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Comentarios recibidos</Text>
                        {userRating.length > 0 ? (
                            <View style={styles.commentsContainer}>
                                <FlatList
                                    data={userRating}
                                    renderItem={({ item }) => (
                                        <View style={styles.commentCard}>
                                            <Text style={styles.commentText}>{item.comment}</Text>
                                            <View style={styles.commentRating}>
                                                {Array.from({ length: 5 }).map((_, i) => (
                                                    <FontAwesome
                                                        key={i}
                                                        name={i < item.rating ? 'star' : 'star-o'}
                                                        size={16}
                                                        color="#FFD700"
                                                    />
                                                ))}
                                            </View>
                                        </View>
                                    )}
                                    keyExtractor={(item) => item.id.toString()}
                                />
                            </View>
                        ) : (
                            <Text>No hay comentarios aún</Text>
                        )}
                        <TouchableOpacity style={styles.submitButton} onPress={onClose}>
                            <Text style={styles.submitButtonText}>Cerrar</Text>
                        </TouchableOpacity>

                    </View>

                )}
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        backgroundColor: '#FFF',
        borderRadius: 20,
        padding: 20,
        width: '85%',
        alignItems: 'center',
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
    },
    modalTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 20,
    },
    starsContainer: {
        flexDirection: 'row',
        marginBottom: 20,
    },
    star: {
        marginHorizontal: 5,
    },
    input: {
        width: '100%',
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 10,
        padding: 15,
        textAlignVertical: 'top',
        marginBottom: 20,
        height: 100,
        backgroundColor: '#F9F9F9',
    },
    commentsContainer: {
        width: '100%',
        maxHeight: 200, // Limit height for scrollable area
        marginBottom: 20,
    },
    commentCard: {
        backgroundColor: '#F0F0F0',
        borderRadius: 10,
        padding: 15,
        marginBottom: 10,
    },
    commentText: {
        fontSize: 14,
        color: '#555',
        marginBottom: 10,
    },
    commentRating: {
        flexDirection: 'row',
    },
    submitButton: {
        backgroundColor: '#FF6F61',
        borderRadius: 10,
        paddingVertical: 12,
        paddingHorizontal: 20,
        alignItems: 'center',
        marginTop: 20,
        width: '100%',
    },
    submitButtonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
    closeButton: {
        position: 'absolute',
        top: 10,
        right: 10,
        backgroundColor: '#FF6F61',
        borderRadius: 15,
        padding: 5,
    },
    titleSeparator: {
        borderBottomWidth: 1, // Creates the horizontal line
        borderBottomColor: '#ddd', // Light gray color for the line
        marginVertical: 15, // Space around the line to keep separation clean
    },
});

export default ReviewModal;
