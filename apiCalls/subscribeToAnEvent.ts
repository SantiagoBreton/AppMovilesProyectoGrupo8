import AsyncStorage from "@react-native-async-storage/async-storage";

export const subscribeToEvent = async (eventId: number) => {
  interface EventUser {
    eventId: number;
    userId: number;
  };

  try {
    const userIdString = await AsyncStorage.getItem('userId');
    const userIdInt = userIdString ? parseInt(userIdString) : null;
    const eventUser: EventUser = {
      eventId: eventId,
      userId: userIdInt!,
    };
    
    const response = await fetch(`http://${process.env.EXPO_PUBLIC_SERVER_IP}:3000/subscribeToEvent`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(eventUser),
    });

    if (response.ok) {
      const data = await response.json();
      return data;
    } else {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Unknown error occurred');
    }
  } catch (error) {
    throw error;
  }
};
