import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, ActivityIndicator, Button, Modal, TouchableOpacity, TextInput, TouchableWithoutFeedback, Image, Pressable } from 'react-native';
import MapView, { Marker, Circle } from 'react-native-maps';
import { useLocation } from '../hooks/useLocation';
import { getAllEvents } from '@/apiCalls/getAllEvents';
import { useEventContext } from '@/context/eventContext';
import { subscribeToEvent } from '@/apiCalls/subscribeToAnEvent';
import Ionicons from '@expo/vector-icons/Ionicons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Float } from 'react-native/Libraries/Types/CodegenTypes';
import { debounce, set } from "lodash";
import { getCategoryBackgroundColor, getCategoryImage, categoryName } from '@/constants/CategoryColor';
import EventDetailModal from '@/components/EventDetailModal';

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
  const [proximityFilter, setProximityFilter] = useState<number>(50);
  const { events, loading, eventsError } = getAllEvents(
    trigger,
    proximityFilter,
    location?.coords.latitude ?? 0,
    location?.coords.longitude ?? 0
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { refreshEvents } = useEventContext();
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<EventWithId | null>(null); // Selected event state
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [nameFilter, setNameFilter] = useState<string>('');
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [filteredEvents, setFilteredEvents] = useState(events);
  const [hasFetchedEvents, setHasFetchedEvents] = useState(false);
  const [categoryNames, setCategoryNames] = useState<string[]>(categoryName);
  const [isCategoryModalVisible, setIsCategoryModalVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    if (location) {
      refreshEvents();
      setHasFetchedEvents(true);
    }
  }, [location]);

  useEffect(() => {
    if (hasFetchedEvents) {
      setFilteredEvents(events);
      setMapLoaded(true);
    }
  }, [events]);

  if (!mapLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF7F50" />
        <Text style={styles.loadingText}>Cargando...</Text>
      </View>
    );
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

  const handleProximityChange = debounce((value: number) => {
    setProximityFilter(value);
    refreshEvents();
  }, 500);

  const handleClearFilters = () => {
    setSelectedDate(null);
    setNameFilter('');
    setProximityFilter(50);
    setSelectedCategory(null);
    setFilteredEvents(events);
    setFilterModalVisible(false);

  };

  const handleDateChange = (event: any, date?: Date) => {
    setShowDatePicker(false);
    if (date) setSelectedDate(date);
  };

  const handleMarkerPress = (event: EventWithId) => {
    setSelectedEvent(event);
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setSelectedEvent(null);
  };

  const handleApplyFilters = () => {
    setFilterModalVisible(false);
    setFilteredEvents(events.filter((event) => {
      const matchesDate =
        selectedDate === null ||
        new Date(event.date).toDateString() === selectedDate.toDateString();
      const matchesName =
        nameFilter === '' ||
        event.name.toLowerCase().includes(nameFilter.toLowerCase());
      const matchesCategory =
        selectedCategory === null ||
        event.category.name === selectedCategory;

      return matchesDate && matchesName && matchesCategory;
    }));
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
                pinColor={getCategoryBackgroundColor(event)}

                coordinate={{
                  latitude: event.latitude + event.latitudeOffset,
                  longitude: event.longitude + event.longitudeOffset
                }}
                onPress={() => handleMarkerPress(event)}
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
                strokeColor={`${getCategoryBackgroundColor(event)}80`} // Borde con opacidad
                fillColor={`${getCategoryBackgroundColor(event)}60`}
                strokeWidth={2}
              />
            </React.Fragment>
          ))}
        </MapView>
      )}

      {selectedEvent && (
        <EventDetailModal
          eventDetails={selectedEvent}
          visible={modalVisible}
          onClose={handleCloseModal}
          showSuscribe={true}
        />
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
                    onChangeText={(value) => handleProximityChange(Number(value))}
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
                <TouchableOpacity
                  style={styles.inputGroup}
                  onPress={() => setIsCategoryModalVisible(true)}
                >
                  <Text style={styles.inputLabel}>Category</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Filter by Category"
                    value={selectedCategory || 'All'}
                    editable={false}
                    placeholderTextColor="#aaa"
                  />
                </TouchableOpacity>
                <Modal
                  visible={isCategoryModalVisible}
                  animationType="slide"
                  transparent={true}
                  onRequestClose={() => setIsCategoryModalVisible(false)}
                >
                  <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                      <Text style={styles.modalTitle2}>Seleccionar Categoría</Text>
                      {categoryName.map((category) => (
                        <TouchableOpacity
                          key={category}
                          style={styles.modalOption}
                          onPress={() => { setSelectedCategory(category); setIsCategoryModalVisible(false) }}
                        >
                          <Text style={styles.modalOptionText}>{category}</Text>
                        </TouchableOpacity>
                      ))}
                      <Pressable
                        style={styles.closeButton}
                        onPress={() => setIsCategoryModalVisible(false)}
                      >
                        <Text style={styles.closeButtonText}>Cerrar</Text>
                      </Pressable>
                    </View>
                  </View>
                </Modal>

                {/* Buttons */}
                <View style={styles.buttonGroup}>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.applyButton]}
                    onPress={() => handleApplyFilters()}
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
    width: 50,
    height: 50,
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
    marginTop: 20,
    padding: 10,
    backgroundColor: '#FF3B30',
    borderRadius: 12,
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
  modalTitle2: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#007AFF',
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
  closeButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
},
  modalOption: {
    paddingVertical: 10,
    width: '100%',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 12,
    width: '80%',
    alignItems: 'center',
  },
  modalOptionText: {
    fontSize: 16,
    color: '#333',
  },

});