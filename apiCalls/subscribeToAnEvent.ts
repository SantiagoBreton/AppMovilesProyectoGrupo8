import { SERVER_IP } from "@env";
import AsyncStorage from "@react-native-async-storage/async-storage";
// Function to subscribe a user to an event
export const subscribeToEvent = async (eventId: number) => {
    interface EventUser {
        eventId: number;
        userId: number;
    };
    
  try {
    
    const userIdString = await AsyncStorage.getItem('userId'); // Get the userId from AsyncStorage
    const userIdInt = userIdString ? parseInt(userIdString) : null; // Convert the userId to an integer if not null
    const eventUser: EventUser = {
        eventId: eventId,
        userId: userIdInt!,
    };
    console.log('userIdInt:', userIdInt);
    console.log('eventId:', eventId);
    const response = await fetch(`http://${SERVER_IP}:3000/subscribeToEvent`, {
      method: 'POST', // POST request to create a subscription
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(eventUser), // Send userId and eventId in the body
    });

    if (response.ok) {
      const data = await response.json();
      console.log('User subscribed to event:', data);
      // Handle the response data (e.g., show a success message)
      return data;
    } else {
      const errorData = await response.json(); // Captura el cuerpo del error
      throw new Error(errorData.error || 'Unknown error occurred'); // Lanza el mensaje del backend como error
    }
  } catch (error) {
    throw error; // Propagate the error for further handling
  }
};
