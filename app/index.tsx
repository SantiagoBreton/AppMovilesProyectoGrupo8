import React, { useState } from 'react';
import { StyleSheet, View, Text, ActivityIndicator, Button, Modal } from 'react-native';
import MapView, { Marker, Circle } from 'react-native-maps';
import { useLocation } from '../hooks/useLocation';
import { allEvents } from '@/apiCalls/getAllEvents';
import { useEventContext } from '@/context/eventContext';
import { subscribeToEvent } from '@/apiCalls/subscribeToAnEvent';

export default function Index() {
  const { location, locationError } = useLocation();
  const { trigger } = useEventContext();
  const { events, loading, eventsError } = allEvents(trigger);
  
  const [modalVisible, setModalVisible] = useState(false); // Modal visibility state
  const [selectedEvent, setSelectedEvent] = useState<{ id: string; name: string; description: string; date: string; currentParticipants: number; maxParticipants: number; latitude: number; longitude: number; } | null>(null); // Selected event state

  if (loading) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }

  const handleSubscribe = async (eventId: number) => {
    subscribeToEvent(eventId);
    console.log('Subscribing to eventds:', eventId);
  };

  const handleMarkerPress = (event: { id: string; name: string; description: string; date: string; currentParticipants: number; maxParticipants: number; latitude: number; longitude: number; }) => {
    setSelectedEvent(event);
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setSelectedEvent(null);
  };

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
          {events.map((event) => (
            <React.Fragment key={event.id}>
              <Marker
                coordinate={{
                  latitude: event.latitude + (Math.random() - 0.5) * (500 / 111000),
                  longitude: event.longitude + (Math.random() - 0.5) * (500 / (111000 * Math.cos(event.latitude * (Math.PI / 180)))) 
                }}
                onPress={() => handleMarkerPress(event)} 
              />
              <Circle
                key={`circle-${event.id}`} 
                center={{
                  latitude: event.latitude + (Math.random() - 0.5) * (500 / 111000),
                  longitude: event.longitude + (Math.random() - 0.5) * (500 / (111000 * Math.cos(event.latitude * (Math.PI / 180)))) 
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

      {selectedEvent && (
        <Modal
          transparent={true}
          visible={modalVisible}
          animationType="slide"
          onRequestClose={handleCloseModal}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalCard}>
              <Text style={styles.cardTitle}>{selectedEvent.name}</Text>
              <Text style={styles.cardDescription}>{selectedEvent.description}</Text>
              <Text style={styles.cardDetails}>Date: {new Date(selectedEvent.date).toLocaleDateString()}</Text>
              <Text style={styles.cardDetails}>
                Participants: {selectedEvent.currentParticipants}/{selectedEvent.maxParticipants}
              </Text>
              <View style={styles.buttonContainer}>
                <Button
                  title="Subscribe"
                  color="#FF7F50"
                  onPress={() => handleSubscribe(Number(selectedEvent.id))} // Log subscription
                />
                <Button
                  title="Close"
                  color="#FF6347"
                  onPress={handleCloseModal} // Close the modal
                />
              </View>
            </View>
          </View>
        </Modal>
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
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 1000, // Ensure the modal appears above other elements
  },
  modalCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    width: 250,
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333',
  },
  cardDescription: {
    fontSize: 14,
    marginBottom: 10,
    color: '#555',
  },
  cardDetails: {
    fontSize: 12,
    color: '#777',
    marginBottom: 5,
  },
  buttonContainer: {
    marginTop: 10,
    width: '100%',
  },
});
