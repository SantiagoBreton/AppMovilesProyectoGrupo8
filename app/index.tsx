import React from 'react';
import { StyleSheet, View, Text, ActivityIndicator } from 'react-native';
import MapView, { Marker,Callout, Circle } from 'react-native-maps';
import { useLocation } from '../hooks/useLocation';
import { useEvents } from '../hooks/useAllEvents';

export default function Index() {
  const { location, locationError } = useLocation();
  const { events, loading, eventsError } = useEvents();

  if (loading) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }

  const getRandomOffset = (latitude: number, longitude: number, radius: number) => {

  }

  return (
    <View style={styles.container}>
      {locationError && <Text>{locationError}</Text>}
      {eventsError && <Text>{eventsError}</Text>}
      {location && (
        <MapView
          style={styles.map}
          initialRegion={{
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          }}
        >
          {events.map(event => (
            <React.Fragment key={event.id}>
              <Marker
                coordinate={{
                  latitude: event.latitude + (Math.random() - 0.5) * (500 / 111000),
                  longitude: event.longitude + (Math.random() - 0.5) * (500 / (111000 * Math.cos(event.latitude * (Math.PI / 180)))),
                }}
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