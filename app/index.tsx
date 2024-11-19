import React, { useState } from 'react';
import { StyleSheet, View, Text, ActivityIndicator, Button, Modal, TouchableOpacity, TextInput } from 'react-native';
import MapView, { Marker, Circle } from 'react-native-maps';
import { useLocation } from '../hooks/useLocation';
import { allEvents } from '@/apiCalls/getAllEvents';
import { useEventContext } from '@/context/eventContext';
import { subscribeToEvent } from '@/apiCalls/subscribeToAnEvent';
import Ionicons from '@expo/vector-icons/Ionicons';
import DateTimePicker from '@react-native-community/datetimepicker';

export default function Index() {
  const { location, locationError } = useLocation();
  const { trigger } = useEventContext();
  const { events, loading, eventsError } = allEvents(trigger);
  const [errorMessage, setErrorMessage] = useState<string | null>(null); // Mensaje de error
  const {refreshEvents} = useEventContext();
  const [modalVisible, setModalVisible] = useState(false); // Modal visibility state
  const [selectedEvent, setSelectedEvent] = useState<{ id: string; name: string; description: string; date: string; currentParticipants: number; maxParticipants: number; latitude: number; longitude: number; } | null>(null); // Selected event state
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [nameFilter, setNameFilter] = useState<string>('');
  const [proximityFilter, setProximityFilter] = useState<number>(50000);
  const [filterModalVisible, setFilterModalVisible] = useState(false); 
  const [showDatePicker, setShowDatePicker] = useState(false);

  if (loading) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }

  const handleSubscribe = async (eventId: number) => {
    try {
      await subscribeToEvent(eventId);
      console.log('Successfully subscribed to event:', eventId);
      handleCloseModal(); // Cerrar el modal después de una suscripción exitosa
      refreshEvents(); // Actualizar la lista de eventos
    } catch (error: any) {
      setErrorMessage(error.message || 'Que lastima, no te has podido subscribir Zorra.');
    }
  };






  const getDistanceFromLatLonInKm = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number => {
    const R = 6371;
    const deg2rad = (deg: number): number => deg * (Math.PI / 180);
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(lat1)) *
        Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const filteredEvents = events.filter((event) => {
    const matchesDate =
      selectedDate === null ||
      new Date(event.date).toDateString() === selectedDate.toDateString();
    const matchesName =
      nameFilter === '' ||
      event.name.toLowerCase().includes(nameFilter.toLowerCase());
    const matchesProximity =
      location &&
      getDistanceFromLatLonInKm(
        location.coords.latitude,
        location.coords.longitude,
        event.latitude,
        event.longitude
      ) <= proximityFilter;

    return matchesDate && matchesName && matchesProximity;
  });

  const handleClearFilters = () => {
    setSelectedDate(null);
    setNameFilter('');
    setProximityFilter(5);
    setFilterModalVisible(false);
  };

  const handleDateChange = (event: any, date?: Date) => {
    setShowDatePicker(false);
    if (date) setSelectedDate(date);
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
          {filteredEvents.map((event) => (
            <React.Fragment key={event.id}>
              <Marker
                coordinate={{
                  latitude: event.latitude + event.latitudeOffset,
                  longitude: event.longitude + event.longitudeOffset
                }}
                onPress={() => handleMarkerPress(event)} 
              />
              <Circle
                key={`circle-${event.id}`} 
                center={{
                  latitude: event.latitude + event.latitudeOffset,
                  longitude: event.longitude + event.longitudeOffset 
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
      {errorMessage && (
    <Modal
      transparent={true}
      visible={!!errorMessage}
      animationType="fade"
      onRequestClose={() => setErrorMessage(null)} // Cerrar el modal al presionar fuera
    >
      <View style={styles.errorModalContainer}>
        <View style={styles.errorModalCard}>
          <Text style={styles.errorTitle}>¡Cuidado!</Text>
          <Text style={styles.errorDescription}>{errorMessage}</Text>
          <Button
            title="Cerrar"
            color="#FF6347"
            onPress={() => setErrorMessage(null)} // Cerrar el modal de error
          />
        </View>
      </View>
    </Modal>
    
    
  )}
    <TouchableOpacity
        style={styles.lupaContainer}
        onPress={() => setFilterModalVisible(true)}
      >
        <Ionicons name="search" size={30} color="black" />
      </TouchableOpacity>

      {/* Filter Modal */}
      <Modal
        transparent={true}
        visible={filterModalVisible}
        animationType="slide"
        onRequestClose={() => setFilterModalVisible(false)}
      >
        <View style={styles.filterModalContainer}>
          <View style={styles.filterModal}>
            <Text style={styles.modalTitle}>Filters</Text>

            {/* Date Picker */}
            <Button title="Select Date" onPress={() => setShowDatePicker(true)} />
            {showDatePicker && (
              <DateTimePicker
                value={selectedDate || new Date()}
                mode="date"
                display="default"
                onChange={handleDateChange}
              />
            )}
            {selectedDate && (
              <Text style={styles.selectedDateText}>
                Selected Date: {selectedDate.toDateString()}
              </Text>
            )}

            {/* Name Filter */}
            <TextInput
              style={styles.input}
              placeholder="Filter by Name"
              value={nameFilter}
              onChangeText={setNameFilter}
            />

            {/* Proximity Filter */}
            <TextInput
              style={styles.input}
              placeholder="Proximity (km)"
              value={String(proximityFilter)}
              onChangeText={(value) => setProximityFilter(Number(value))}
              keyboardType="numeric"
            />

            {/* Buttons */}
            <View style={styles.buttonGroup}>
              <Button
                title="Apply Filters"
                onPress={() => setFilterModalVisible(false)}
              />
              <Button
                title="Clear Filters"
                color="red"
                onPress={handleClearFilters}
              />
            </View>
          </View>
        </View>
      </Modal>
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
  filterModalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  selectedDateText: { fontSize: 14, marginBottom: 10 },
  filterModal: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    width: '80%',
  },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  errorModalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 1000,
  },
  errorModalCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    width: 300,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 5,
  },
  buttonGroup: {
    marginTop: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  input: {
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    marginBottom: 15,
    padding: 8,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#B22222',
  },
  errorDescription: {
    fontSize: 14,
    textAlign: 'center',
    color: '#555',
    marginBottom: 15,
  },
  lupaContainer: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 1000,
  },
  
});
