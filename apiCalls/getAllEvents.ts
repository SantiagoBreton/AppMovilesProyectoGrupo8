import React, { useState, useEffect } from 'react';
import { useFocusEffect } from '@react-navigation/native';


export const allEvents = (trigger: boolean) => {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [eventsError, setEventsError] = useState<string | null>(null);

  useFocusEffect(
    React.useCallback(() => {
      const fetchEvents = async () => {
        try {
          const response = await fetch(`http://${process.env.EXPO_PUBLIC_SERVER_IP}:3000/getEvents`, {
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
          setEventsError('Error fetching eventsdasda');
          console.error('Error fetching eventsdasd:', error);
        } finally {
          setLoading(false);
        }
      };
  
      fetchEvents();
    }, [trigger])
  );


  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch(`http://${process.env.SERVER_IP}:3000/getEvents`, {
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