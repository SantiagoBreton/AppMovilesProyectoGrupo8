import { useState, useEffect } from 'react';

export const getPendingRequestedEvents = (userId: number | null) => {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [eventsError, setEventsError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEvents = async () => {
      if (userId === null) {
        setEventsError('User ID is null');
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`http://${process.env.EXPO_PUBLIC_SERVER_IP}:3000/getPendingRequestedEvents/${userId}`);

        if (!response.ok) {
          throw new Error(`Failed to get events: ${response.statusText}`);
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
  }, [userId]); // Dependency array now includes userId instead of trigger

  return { events, loading, eventsError };
};