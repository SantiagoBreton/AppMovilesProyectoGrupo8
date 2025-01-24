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
import SpectatedUserModal from './SpectatedUserModal';
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
    ratingUser: User;
}

const ReviewModal: React.FC<ReviewModalProps> = ({
    isVisible,
    user,
    refreshData,
    onClose,
}) => {
    const [rating, setRating] = useState<number>(0);
    const [comments, setComments] = useState<string>('');
    const [userRatings, setUserRatings] = useState<Rating[]>([]);
    const [userId, setUserId] = useState<number | null>(null);
    const [specModalVisible, setSpecModalVisible] = useState(false);
  
    // Fetch user ratings and userId when modal is visible
    useEffect(() => {
      if (user) {
        fetchRatingsAndUserId(user.id);
      }
    }, [user, isVisible]);
  
    const fetchRatingsAndUserId = async (userId: number) => {
      try {
        const [ratingsResponse, storedUserId] = await Promise.all([
          getAllUserRatings(userId),
          AsyncStorage.getItem('userId'),
        ]);
  
        setUserRatings(ratingsResponse.data);
        if (storedUserId) {
          setUserId(parseInt(storedUserId, 10));
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
  
    const handleSubmit = async () => {
      if (!comments || rating === 0) {
        alert('Por favor, califica y deja un comentario');
        return;
      }
  
      if (user && userId !== null) {
        const newRating = {
          ratingUserId: userId,
          userId: user.id,
          comment: comments,
          rating,
        };
  
        try {
          const response = await createNewRating(newRating);
          if (response) {
            refreshData();
            onClose();
          }
        } catch (error) {
          console.error('Error submitting rating:', error);
        }
      }
    };
  
    const renderStar = (index: number, currentRating: number,size:number) => (
      <TouchableOpacity key={index} onPress={() => setRating(index)}>
        <FontAwesome
          name={index <= currentRating ? 'star' : 'star-o'}
          size={size}
          color={index <= currentRating ? '#FFD700' : '#E0E0E0'}
          style={styles.star}
        />
      </TouchableOpacity>
    );
  
    const renderComment = ({ item }: { item: Rating }) => (
      <View style={styles.commentCard}>
        <Text style={styles.commentText}>{item.comment}</Text>
        <View style={styles.titleSeparator} />
        <View style={styles.commentHeader}>
          <View style={styles.commentRating}>
            {Array.from({ length: 5 }).map((_, i) =>
              renderStar(i + 1, item.rating,15)
            )}
          </View>
          <TouchableOpacity onPress={() => setSpecModalVisible(true)}>
            <Text style={styles.commentUserName}>{item.ratingUser.name}</Text>
          </TouchableOpacity>
        </View>
        <SpectatedUserModal
          isVisible={specModalVisible}
          user={item.ratingUser}
          onClose={() => setSpecModalVisible(false)}
        />
      </View>
    );
  
    return (
      <Modal visible={isVisible} transparent={true} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {user && user.id !== userId ? (
              <>
                <Text style={styles.modalTitle}>Deja tu calificación</Text>
                <View style={styles.starsContainer}>
                  {Array.from({ length: 5 }).map((_, index) =>
                    renderStar(index + 1, rating,40)
                  )}
                </View>
                <TextInput
                  style={styles.input}
                  placeholder="Escribe tu comentario aquí..."
                  value={comments}
                  onChangeText={setComments}
                  multiline
                />
                <FlatList
                  data={userRatings}
                  renderItem={renderComment}
                  keyExtractor={(item) => item.id.toString()}
                  style={styles.commentsContainer}
                />
                <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
                  <Text style={styles.submitButtonText}>Enviar</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <Text style={styles.modalTitle}>Comentarios recibidos</Text>
                <FlatList
                  data={userRatings}
                  renderItem={renderComment}
                  keyExtractor={(item) => item.id.toString()}
                  style={styles.commentsContainer}
                />
              </>
            )}
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <FontAwesome name="times" size={24} color="#FFF" />
            </TouchableOpacity>
          </View>
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
        alignItems: 'center', // Align stars vertically
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
    commentUserName: {
        fontSize: 12,
        color: '#555',
        textAlign: 'right', // Ensure the text aligns properly
    },
    commentHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10, // Add some spacing between the header and the comment
    },
});

export default ReviewModal;
