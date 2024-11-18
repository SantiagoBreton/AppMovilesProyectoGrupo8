import AsyncStorage from '@react-native-async-storage/async-storage';
import { SERVER_IP } from '@env';


interface User {
    email: string;
    password: string;
};
export const loginUser = async (user: User) => {
        try {
            const response = await fetch(`http://${SERVER_IP}:3000/userLogin`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(user),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to login');
            }

            const data = await response.json();
            console.log('User logged in:', data);
            await AsyncStorage.setItem("userId", data.id.toString());
            
        } catch (error) {
            console.error('Error logging in:', error);
        }
    };