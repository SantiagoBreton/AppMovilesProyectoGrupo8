import AsyncStorage from "@react-native-async-storage/async-storage";

export const getUserProfileImage = async () => {
    try {
        const userId = await AsyncStorage.getItem('userId');
        const response = await fetch(
            `http://${process.env.EXPO_PUBLIC_SERVER_IP}:3000/getUserProfileImage/${userId}`
        );

        if (!response.ok) {
            throw new Error('Failed to fetch user profile image');
        }

        const data = await response.json(); // Assuming the backend sends JSON with the image URL or path
        console.log('User profile image:', data);
        return { data, error: null };
    } catch (error: any) {
        console.error('Error fetching user profile image:', error);
        return { data: null, error: 'Error fetching user profile image' };
    }
};
