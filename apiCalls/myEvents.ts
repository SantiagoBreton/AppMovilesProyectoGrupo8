
import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Float } from "react-native/Libraries/Types/CodegenTypes";
interface Event {
    id: number
    name: string;
    date: Date;
    latitude: Float;
    longitude: Float;
    description: string;
    maxParticipants: number;
    currentParticipants: number;
    rating: number;
    time: string;
    category: any;
    userId: number;
};
export const myEvents = (trigger: boolean) => {
    const [myEvents, setMyEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);
    const [eventsError, setEventsError] = useState<string | null>(null);
  
    useEffect(() => {
      const getEventsByUserId = async () => {
        try {
          const id = await AsyncStorage.getItem('userId');
          if (!id) {
            throw new Error('User ID not found');
          }
          const response = await fetch(`http://${process.env.EXPO_PUBLIC_SERVER_IP}:3000/getEventsByUserId/${id}`);
        
          if (response.ok) {
            const data = await response.json();
            
            setMyEvents(data);
          } else {
            throw new Error('Failed to fetch events');
          }
        } catch (error: any) {
          setEventsError('Error fetching events');
          console.error("Error:", error);
        } finally {
          setLoading(false);
        }
      };
  
      getEventsByUserId();
      
    }, [trigger]);
    
  
    return { myEvents, loading, eventsError }; // Return state and loading/error status
  };
  