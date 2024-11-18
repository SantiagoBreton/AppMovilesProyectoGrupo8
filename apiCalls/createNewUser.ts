import { SERVER_IP } from '@env';
import AsyncStorage from '@react-native-async-storage/async-storage';
interface User {
    email: string;
    password: string;
    name: string;
}
export const createNewUser = async (user: User) => {
    if (!user.email || !user.password || !user.name) {
        setErrorMessage('Todos los campos son obligatorios. Por favor, completa todos los campos.');
        return; // Stop execution if any field is empty
      }
    try {
      const response = await fetch(`http://${SERVER_IP}:3000/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(user),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create user');
      }
  
      const newUser = await response.json();
      await AsyncStorage.setItem("userId", newUser.id.toString());
      console.log('User created:', newUser);
  
      return true;  // Return success if user is created
  
    } catch (error) {
      console.error('Error creating user:', error);
      return false;  // Return failure if an error occurred
    }
  };

function setErrorMessage(arg0: string) {
    throw new Error('Function not implemented.');
}
  