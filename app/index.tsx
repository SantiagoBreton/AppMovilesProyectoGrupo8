import React, { useEffect, useState } from 'react';
import MapView, { Marker, Callout, Circle } from 'react-native-maps';
import { StyleSheet, View, Text, ActivityIndicator } from 'react-native';
import * as Location from 'expo-location';
import { SERVER_IP } from '@env';

export default function Index() {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState<Event[]>([]);

  interface Event {
    id: number,
    name: string,
    date: Date,
    latitude: number,
    longitude: number,
    description: string,
    maxParticipants: number,
    currentParticipants: number,
    userId: number
  }

  useEffect(() => {
    const fetchLocationAndEvents = async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.log('Permission to access location was denied');
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setLocation(location);

      // Fetch events from the server
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
        console.error('Error fetching events:', error);
      }

      setLoading(false);
    };

    fetchLocationAndEvents();
  }, []);

  if (loading) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }

  return (
    <View style={styles.container}>
      {location && (
        <MapView
          style={styles.map}
          showsUserLocation={true}
          initialRegion={{
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            latitudeDelta: 0.005,
            longitudeDelta: 0.005,
          }}
          customMapStyle={[
            {
              elementType: 'geometry',
              stylers: [{ visibility: 'simplified' }],
            },
            {
              elementType: 'labels.icon',
              stylers: [{ visibility: 'off' }],
            },
          ]}
        >
          {events.map(event => (
            <React.Fragment key={event.id}>
              <Marker
                coordinate={{
                  latitude: event.latitude + (Math.random() - 0.5) * (500 / 111000),
                  longitude: event.longitude + (Math.random() - 0.5) * (500 / (111000 * Math.cos(event.latitude * (Math.PI / 180)))),
                }}
                image={require('../assets/images/react-logo.png')}
              >
                <Callout>
                  <View>
                    <Text style={styles.title}>{event.name}</Text>
                    <Text>{event.description}</Text>
                  </View>
                </Callout>
              </Marker>
              <Circle
                key={`circle-${event.id}`} 
                center={{
                  latitude: event.latitude + (Math.random() - 0.5) * (500 / 111000),
                  longitude: event.longitude + (Math.random() - 0.5) * (500 / (111000 * Math.cos(event.latitude * (Math.PI / 180)))),
                }}
                radius={500}
                strokeColor="rgba(0, 255, 0, 0.5)"
                fillColor="rgba(0, 255, 0, 0.2)"
                strokeWidth={2}
              />
            </React.Fragment>
          ))}
        </MapView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: '100%',
    height: '100%',
  },
  title: {
    fontWeight: 'bold',
    fontSize: 16,
  },
});
