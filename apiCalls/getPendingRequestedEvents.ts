import { useState, useEffect } from 'react';
import AsyncStorage from "@react-native-async-storage/async-storage";

export const getPendingRequestedEvents = (trigger: boolean) => {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [eventsError, setEventsError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const userIdString = await AsyncStorage.getItem('userId');
        if (!userIdString) {
          throw new Error('User ID is null');
        }
        const userIdInt = userIdString ? parseInt(userIdString) : null;
        if (userIdInt === null) {
          throw new Error('User ID is null');
        }
        const response = await fetch(`http://${process.env.EXPO_PUBLIC_SERVER_IP}:3000/getPendingRequestedEvents/${userIdInt}`);

        if (!response.ok) {
          throw new Error(`Failed to get events sorrys: ${response.statusText}`);
        }
        const fetchedEvents = await response.json();

        setEvents(Array.isArray(fetchedEvents) ? fetchedEvents : []);
      } catch (error) {
        setEventsError('Error fetching events');
        console.error('Error fetching events:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [trigger]); // Dependency array now includes userId instead of trigger

  return { events, loading, eventsError };
};