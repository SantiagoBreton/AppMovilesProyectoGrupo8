import { useState, useEffect } from 'react';
import { SERVER_IP } from '@env';

export const allEvents = (trigger: boolean) => {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [eventsError, setEventsError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch(`http://${SERVER_IP}:3000/getEvents`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Failed to get events');
        }

        const fetchedEvents = await response.json();
        setEvents(fetchedEvents); // Set the fetched events to state
      } catch (error) {
        setEventsError('Error fetching events');
        console.error('Error fetching events:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [trigger]);

  return { events, loading, eventsError };
};