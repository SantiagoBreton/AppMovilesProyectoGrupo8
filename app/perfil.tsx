import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, StyleSheet, Image, ScrollView, Button, FlatList, TouchableOpacity, Alert, Platform, ActivityIndicator } from 'react-native';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { myEvents } from '@/apiCalls/myEvents';
import { useEventContext } from '@/context/eventContext';
import { Float } from 'react-native/Libraries/Types/CodegenTypes';
import { useAuthContext } from '@/context/userLoginContext';  // Updated import
import EventCard2 from '@/components/EventCard2';
import { FontAwesome } from '@expo/vector-icons';
import ReviewModal from '@/components/RatingUserModal';
import { getMyUserData } from '@/apiCalls/getMyUserData';


interface User {
    id: number;
    name: string;
    email: string;
    rating: number;
};

export default function Perfil() {
    const [user, setUser] = useState<User>({ id: 0, name: '', email: '', rating: 0 });
    const { trigger } = useEventContext();
    const myUserEvents = myEvents(trigger);
    const eventsToDisplay = myUserEvents.myEvents;
    const { logout } = useAuthContext();
    const [isLoading, setIsLoading] = useState(true);
    const totalStars = 5;
    const rating = user.rating !== undefined && user.rating !== null && !isNaN(user.rating) ? user.rating : 0; // Handle NaN or undefined ratings
    const filledStars = Math.floor(rating); // Fully filled stars
    const hasHalfStar = rating % 1 >= 0.5; // Determine if a half-star is needed
    const emptyStars = totalStars - filledStars - (hasHalfStar ? 1 : 0); // Remaining empty stars
    const [isRevieModalVisible, setIsReviewModalVisible] = useState(false);


    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const storedUserId = await AsyncStorage.getItem('userId');
                if (storedUserId) {
                    const userData = await getMyUserData();
                    setUser(userData);
                }
            } catch (error) {
                console.error('Error fetching userId:', error);
            }
            if (user) {
                setIsLoading(false);
            }
        };

        fetchUserData();
    });

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#FF7F50" />
                <Text style={styles.loadingText}>Cargando...</Text>
            </View>
        );
    }



    const handleLogout = async () => {
        await AsyncStorage.removeItem("userId");
        const userId = await AsyncStorage.getItem('userId');
        console.log('User token:', userId)
        logout();
    }



    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <Image source={{ uri: 'https://via.placeholder.com/150' }} style={styles.profileImage} />
                <Text style={styles.name}>{user.name}</Text>
            </View>
            <TouchableOpacity onPress={() => { setIsReviewModalVisible(true) }}>
                <View style={styles.starContainer}>
                    {/* Render fully filled stars */}
                    <Text style={styles.text}>Users Rating:  </Text>
                    {Array.from({ length: filledStars }).map((_, index) => (
                        <FontAwesome
                            key={`filled-${index}`}
                            name="star"
                            size={24}
                            color="#FFD700"
                            style={styles.star}
                        />
                    ))}

                    {/* Render a half-filled star, if needed */}
                    {hasHalfStar && (
                        <FontAwesome
                            name="star-half"
                            size={24}
                            color="#FFD700"
                            style={styles.star}
                        />
                    )}

                    {/* Render empty stars */}
                    {Array.from({ length: emptyStars }).map((_, index) => (
                        <FontAwesome
                            key={`empty-${index}`}
                            name="star-o"
                            size={24}
                            color="#FFD700"
                            style={styles.star}
                        />
                    ))}
                    <Text style={styles.text}>{`(${user.rating === null || isNaN(user.rating) ? 0 : user.rating.toFixed(1)}) `}</Text>



                </View>
            </TouchableOpacity>
            <View style={styles.section}>
                <Text style={styles.label}>Nombre:</Text>
                <Text style={styles.input}>{user.name}</Text>
            </View>
            <View style={styles.section}>
                <Text style={styles.label}>Email:</Text>
                <Text style={styles.input}>{user.email}</Text>
            </View>

            <View style={styles.logoutContainer}>
                <Button title="Cerrar Sesión" onPress={handleLogout} color="#FF7F50" />
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Eventos Creados</Text>
                {eventsToDisplay.length > 0 ? (
                    <FlatList
                        data={eventsToDisplay}
                        scrollEnabled={false}
                        renderItem={({ item }) => (
                            <EventCard2 event={item} />
                        )}
                        keyExtractor={(item) => item.id.toString()}
                        ListFooterComponent={
                            <Text style={styles.footerText}>
                                {`Total de eventos: ${eventsToDisplay.length}`}
                            </Text>
                        }
                    />
                ) : (
                    <Text style={styles.noEventsText}>No se han creado eventos aún.</Text>
                )}
            </View>
            <ReviewModal
                isVisible={isRevieModalVisible}
                user={user}
                refreshData={() => { }}
                onClose={() => { setIsReviewModalVisible(false); }}
            />
        </ScrollView>

    );
};

const styles = StyleSheet.create({
    container: {
        marginTop: 30,
        flex: 1,
        backgroundColor: '#F9F9F9',
        paddingHorizontal: 16,
        paddingVertical: 24,
    },
    footerText: {
        marginTop: 16,
        textAlign: 'center',
        fontSize: 14,
        color: '#666',
    },
    noEventsText: {
        textAlign: 'center',
        fontSize: 16,
        color: '#999',
        marginTop: 16,
    },
    header: {
        alignItems: 'center',
        marginBottom: 24,
        backgroundColor: '#FF7F50',
        paddingVertical: 16,
        borderRadius: 16,
    },
    profileImage: {
        width: 100,
        height: 100,
        borderRadius: 50,
        borderWidth: 2,
        borderColor: '#fff',
        marginBottom: 8,
    },
    name: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
    },
    section: {
        backgroundColor: '#fff',
        padding: 16,
        marginVertical: 12,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 4,
    },
    label: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#FF7F50',
        marginBottom: 4,
    },
    input: {
        fontSize: 16,
        color: '#333',
        marginBottom: 8,
    },
    logoutContainer: {
        marginVertical: 16,
        alignItems: 'center',
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#FF7F50',
        marginBottom: 16,
        textAlign: 'center',
    },
    eventHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start', // Aligns content at the top
        flexWrap: 'wrap', // Allows wrapping to the next line when necessary
        marginBottom: 8,
    },

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
    eventName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#FF7F50',
        flex: 1, // Allow the event name to take up the available space
        marginRight: 8, // Adds space between the event name and the date
    },


    eventDate: {
        fontSize: 14,
        color: '#666',
        fontStyle: 'italic',
        flexShrink: 0, // Prevents the date from shrinking
        marginTop: 5, // Adds a small gap between the name and the date if it moves to the next line
        marginLeft: 8, // Moves the date a bit more to the left (closer to the name)
        textAlign: 'right', // Aligns the date to the left if it wraps
        width: '100%', // Ensures it takes up the full width on the next line
        paddingTop: 5,
    },
    eventDescription: {
        fontSize: 14,
        color: '#333',
        marginBottom: 8,
    },
    detailButtonContainer: {
        alignSelf: 'flex-end',
        marginTop: 8,
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: '#333',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
    starContainer: {
        backgroundColor: '#fff',
        padding: 16,
        marginVertical: 12,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 4,
        flexDirection: 'row',
    },
    star: {
        marginHorizontal: 2,
    },
    text: {
        marginLeft: 10,
        fontSize: 16,
        color: '#333',
    },
});
