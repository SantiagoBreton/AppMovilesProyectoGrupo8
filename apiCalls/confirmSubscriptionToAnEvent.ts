
// Function to subscribe a user to an event
export const confirmSubscriptionToAnEvent = async (eventId: number, userId: number) => {
    interface EventUser {
        eventId: number;
        userId: number;
    };
  try {
    
    
    const eventUser: EventUser = {
        eventId: eventId,
        userId: userId,
    };
    
    const response = await fetch(`http://${process.env.EXPO_PUBLIC_SERVER_IP}:3000/confirmSubscriptionToAnEvent`, {
      method: 'POST', // POST request to create a subscription
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(eventUser), // Send userId and eventId in the body
    });

    if (response.ok) {
      const data = await response.json();
      
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
