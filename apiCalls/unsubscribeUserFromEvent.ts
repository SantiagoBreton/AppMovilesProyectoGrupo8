import { SERVER_IP } from "@env";

// Function to delete event by id
export const unsubscribeUserFromAnEvent = async (userId: number, eventId: number ) => {
    try {
      const response = await fetch(`http://${SERVER_IP}:3000/unsubscribeUserFromEvent/${userId}/${eventId}`, {
        method: 'DELETE', // Ensure you are using DELETE HTTP method
      });
  
      if (response.ok) {
        const data = await response.json();
        console.log('Event deleted successfully:', data);
        // Return the response data for any further handling
        return data;
      } else {
        throw new Error('Failed to delete event');
      }
    } catch (error) {
      console.error('Error deleting event:', error);
      throw error; // Propagate the error if you want to handle it elsewhere
    }
  };
  