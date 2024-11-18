import { SERVER_IP } from "@env";
import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const myEvents = () => {
    const [myEvents, setMyEvents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [eventsError, setEventsError] = useState<string | null>(null);
  
    useEffect(() => {
      const getEventsByUserId = async () => {
        try {
          const id = await AsyncStorage.getItem('userId');
          const response = await fetch(`http://${SERVER_IP}:3000/getEventsByUserId/${id}`);
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
      
    });
  
    return { myEvents, loading, eventsError }; // Return state and loading/error status
  };
  