import { SERVER_IP } from "@env";
import { router } from "expo-router";

// Function to delete event by id
export const deleteEventById = async (id: number) => {
    try {
      const response = await fetch(`http://${SERVER_IP}:3000/deleteEventById/${id}`, {
        method: 'DELETE', // Ensure you are using DELETE HTTP method
      });
  
      if (response.ok) {
        const data = await response.json();
        console.log('Event deleted successfully:', data);
        router.push('/eventos')
        return data;
      } else {
        throw new Error('Failed to delete event');
      }
    } catch (error) {
      console.error('Error deleting event:', error);
      throw error; // Propagate the error if you want to handle it elsewhere
    }
  };
  