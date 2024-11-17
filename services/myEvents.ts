import { SERVER_IP } from "@env";
import { useEffect, useState } from "react";

export const myEvents = (id: number) => {
    const [myEvents, setMyEvents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [eventsError, setEventsError] = useState<string | null>(null);
  
    useEffect(() => {
      const getEventsByUserId = async (id: number) => {
        try {
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
  
      if (id) {
        getEventsByUserId(id);
      }
    }, [id]);
  
    return { myEvents, loading, eventsError }; // Return state and loading/error status
  };
  