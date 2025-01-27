import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, ActivityIndicator, Button, Modal, TouchableOpacity, TextInput, TouchableWithoutFeedback, Image } from 'react-native';
import MapView, { Marker, Circle } from 'react-native-maps';
import { useLocation } from '../hooks/useLocation';
import { useAllEvents } from '@/apiCalls/getAllEvents';
import { useEventContext } from '@/context/eventContext';
import { subscribeToEvent } from '@/apiCalls/subscribeToAnEvent';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Icon } from 'react-native-elements'
import DateTimePicker from '@react-native-community/datetimepicker';
import { Float } from 'react-native/Libraries/Types/CodegenTypes';
import { get } from 'react-native/Libraries/TurboModule/TurboModuleRegistry';

interface EventWithId {
  id: number;
  name: string;
  date: Date;
  latitude: Float;
  longitude: Float;
  description: string;
  maxParticipants: number;
  currentParticipants: number;
  time: string;
  category: any;
  userId: number;
};



export default function Index() {
  const { location, locationError } = useLocation();
  const { trigger } = useEventContext();
  const { events, loading, eventsError } = useAllEvents(trigger);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { refreshEvents } = useEventContext();
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<{ id: string; name: string; description: string; date: string; currentParticipants: number; maxParticipants: number; latitude: number; longitude: number; } | null>(null); // Selected event state
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [nameFilter, setNameFilter] = useState<string>('');
  const [proximityFilter, setProximityFilter] = useState<number>(50);
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => {
    if (location) {
      setMapLoaded(true);
    }

  }, [location]);

  if (!mapLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF7F50" />
        <Text style={styles.loadingText}>Cargando...</Text>
      </View>
    );
  }
  const getCategoryImage = (category: string) => {
    if (category === 'Deporte') {
      return require('../assets/images/sport.png');
    }
    if (category === 'Musica') {
      return require('../assets/images/music.png');
    }
    if (category === 'Arte') {
      return require('../assets/images/art.png');
    }
    if (category === 'Comida') {
      return require('../assets/images/food.png');
    }
    if (category === 'NetWorking') {
      return require('../assets/images/networking.png');
    }
    if (category === 'Fiesta') {
      return require('../assets/images/party.png');
    }
    if (category === 'Voluntariado') {
      return require('../assets/images/volunteer.png');
    }
    return require('../assets/images/ping.png');
  }
  const getBackgroundColor = (event: EventWithId | null) => {
    if (event?.category?.name === 'Deporte') {
      return '#7FBF6E'; //light green
    }
    if (event?.category?.name === 'Musica') {
      return '#F76D8C'; //light pink
    }
    if (event?.category?.name === 'Arte') {
      return '#65B9D3'; //light blue
    }
    if (event?.category?.name === 'Comida') {
      return '#FF4E50'; //light red
    }
    if (event?.category?.name === 'NetWorking') {
      return '#F9D616'; //light yellow
    }
    if (event?.category?.name === 'Fiesta') {
      return '#F0BB62'; //light orange
    }
    if (event?.category?.name === 'Voluntariado') {
      return '#D2B48C'; //light brown
    }
    return '#fef6f2';
  }

  const handleSubscribe = async (eventId: number) => {
    try {
      await subscribeToEvent(eventId);
      handleCloseModal();
      refreshEvents();
    } catch (error: any) {
      setErrorMessage(error.message || 'Que lastima, no te has podido subscribir.');
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

  const filteredEvents = (events.filter((event) => event.date > new Date().toISOString())).filter((event) => {
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
                pinColor={getBackgroundColor(event)}

                coordinate={{
                  latitude: event.latitude + event.latitudeOffset,
                  longitude: event.longitude + event.longitudeOffset
                }}
                onPress={() => handleMarkerPress(event)}
              // image={require('../assets/images/party_pin_location_map-512.jpg')} //
              // style={styles.markerImage}
              >
                <Image
                  source={getCategoryImage(event.category.name)}
                  style={styles.markerImage}

                
                />
              </Marker>



              <Circle
                key={`circle-${event.id}`}
                center={{
                  latitude: event.latitude + event.latitudeOffset,
                  longitude: event.longitude + event.longitudeOffset
                }}
                radius={500}
                strokeColor={`${getBackgroundColor(event)}80`} // Borde con opacidad
                fillColor={`${getBackgroundColor(event)}60`}
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
              <Text style={styles.modalEventName}>{selectedEvent.name}</Text>
              <Text style={styles.modalEventDescription}>{selectedEvent.description}</Text>
              <View style={styles.modalDetails}>
                <Ionicons name="calendar" size={16} color="#FF7F50" />
                <Text style={styles.modalDetailText}>
                  {new Date(selectedEvent.date).toLocaleDateString()}
                </Text>
              </View>
              <View style={styles.modalDetails}>
                <Ionicons name="people" size={16} color="#FF7F50" />
                <Text style={styles.modalDetailText}>
                  {selectedEvent.currentParticipants}/{selectedEvent.maxParticipants} Participantes
                </Text>
              </View>
              <View style={styles.modalButtonContainer}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.subscribeButton]}
                  onPress={() => handleSubscribe(Number(selectedEvent.id))}
                >
                  <Text style={styles.buttonText}>Quiero ir!</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.closeButton]}
                  onPress={handleCloseModal}
                >
                  <Text style={styles.buttonText}>Close</Text>
                </TouchableOpacity>
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
          onRequestClose={() => setErrorMessage(null)}
        >
          <View style={styles.errorModalContainer}>
            <View style={styles.errorModalCard}>
              <Text style={styles.errorTitle}>¡Cuidado!</Text>
              <Text style={styles.errorDescription}>{errorMessage}</Text>
              <Button
                title="Cerrar"
                color="#FF6347"
                onPress={() => setErrorMessage(null)}
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
        <TouchableWithoutFeedback onPress={() => setFilterModalVisible(false)}>
          <View style={styles.filterModalContainer}>
            <TouchableWithoutFeedback>
              <View style={styles.filterModal}>
                <Text style={styles.modalTitle}>Filters</Text>

                {/* Name Filter */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Event Name</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Filter by Name"
                    value={nameFilter}
                    onChangeText={setNameFilter}
                    placeholderTextColor="#aaa"
                  />
                </View>

                {/* Proximity Filter */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Proximity (km)</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter distance"
                    value={String(proximityFilter)}
                    onChangeText={(value) => setProximityFilter(Number(value))}
                    keyboardType="numeric"
                    placeholderTextColor="#aaa"
                  />
                </View>

                {/* Date Picker */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Select Date</Text>
                  <TouchableOpacity
                    style={styles.datePickerButton}
                    onPress={() => setShowDatePicker(true)}
                  >
                    <Text style={styles.datePickerButtonText}>Choose Date</Text>
                  </TouchableOpacity>
                  {showDatePicker && (
                    <DateTimePicker
                      value={selectedDate || new Date()}
                      mode="date"
                      display="default"
                      onChange={handleDateChange}
                    />
                  )}
                </View>

                {/* Buttons */}
                <View style={styles.buttonGroup}>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.applyButton]}
                    onPress={() => setFilterModalVisible(false)}
                  >
                    <Text style={styles.buttonText}>Apply</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.clearButton]}
                    onPress={handleClearFilters}
                  >
                    <Text style={styles.buttonText}>Clear</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  markerImage: {
    width: 50, // Fixed width
    height: 50, // Fixed height
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
    zIndex: 1000,
  },
  modalCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    width: '90%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 10,
  },
  selectedDateText: { fontSize: 14, marginBottom: 10 },
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
  modalEventName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FF7F50',
    marginBottom: 10,
    textAlign: 'center',
  },
  modalEventDescription: {
    fontSize: 14,
    color: '#555',
    textAlign: 'center',
    marginBottom: 20,
  },
  modalDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 5,
  },
  modalDetailText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 5,
  },
  modalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  subscribeButton: {
    backgroundColor: '#FF7F50',
  },
  closeButton: {
    backgroundColor: '#FF6347',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#333',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  filterModalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.6)",
  },
  filterModal: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 15,
    width: "90%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 15,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#333",
    textAlign: "center",
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 15,
  },
  inputLabel: {
    fontSize: 18,
    fontWeight: "600",
    color: "#666",
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    padding: 10,
    fontSize: 16,
    color: "#333",
    backgroundColor: "#f9f9f9",
  },
  datePickerButton: {
    backgroundColor: "#1E90FF",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  datePickerButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  buttonGroup: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    padding: 10,
    borderRadius: 20,
    marginHorizontal: 5,
    alignItems: "center",
  },
  applyButton: {
    backgroundColor: "#1E90FF",
  },
  clearButton: {
    backgroundColor: "#FF6347",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});