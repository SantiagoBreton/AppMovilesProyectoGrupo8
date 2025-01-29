import AsyncStorage from '@react-native-async-storage/async-storage';

interface User {
  email: string;
  password: string;
}

interface LoginSuccessResponse {
  id: string;
}

interface LoginErrorResponse {
  error: string;
}

export const loginUser = async (user: User): Promise<LoginSuccessResponse | LoginErrorResponse> => {
  try {
    const response = await fetch(`http://${process.env.EXPO_PUBLIC_SERVER_IP}:3000/userLogin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(user),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return { error: errorData.error || 'Failed to login' };  // Return error response
    }

    const data = await response.json();
    
    await AsyncStorage.setItem("userId", data.id.toString());

    return { id: data.id };  // Return success response with user id
  } catch (error) {

    return { error: 'Error logging in, please try again' };  // Return general error message
  }
};
