import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Modal,
  Alert,
  Button,
  ScrollView,
} from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import MapView, { Circle, Marker } from 'react-native-maps';
import { Float } from 'react-native/Libraries/Types/CodegenTypes';
import * as Location from 'expo-location';
import { getEventByName } from '@/apiCalls/getEventByName';
import { getUserByName } from '@/apiCalls/getUserByName';

export default function Busqueda() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Event[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isDetailsModalVisible, setIsDetailsModalVisible] = useState(false);
  const [eventDetails, setEventDetails] = useState<Event | null>(null);
  const [eventLocation, setEventLocation] = useState<string | null>(null);
  const [isMapVisible, setMapVisible] = useState(false);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);

  interface Event {
    id: number;
    name: string;
    date: Date;
    latitude: Float;
    longitude: Float;
    description: string;
    maxParticipants: number;
    currentParticipants: number;
    userId: number;
};

interface User {
    id: number;
    name: string;
    email: string;
};

  const handleShowMap = () => setMapVisible(true);
  const handleCloseMap = () => setMapVisible(false);

    const handleEventSearch = async () => {
        setIsSearching(true);
        try {
            if (query.length === 0) {
                setResults([]);
                setFilteredEvents([]);
                return;
            }
            const filteredResults = await getEventByName(query);
            setResults(filteredResults.data);
            setFilteredEvents(filteredResults.data);
        } catch (error) {
            console.error('Error fetching events:', error);
            Alert.alert('Error', 'Failed to fetch events');
        } finally {
            setIsSearching(false);
        }
    }

    const handleUserSearch = async () => {
        setIsSearching(true);
        try {
            if (query.length === 0) {
                setResults([]);
                setFilteredUsers([]);
                return;
            }
            const filteredResults = await getUserByName(query);
            setResults(filteredResults.data);
            setFilteredUsers(filteredResults.data);
        } catch (error) {
            console.error('Error fetching users:', error);
            Alert.alert('Error', 'Failed to fetch users');
        } finally {
            setIsSearching(false);
        }
    }

  const handleDetailsEvent = async (item: Event) => {
    try {
        const addresses = await Location.reverseGeocodeAsync({
            latitude: item.latitude,
            longitude: item.longitude,
        });

        const location =
            addresses.length > 0
                ? `${addresses[0].city}, ${addresses[0].region}, ${addresses[0].country}`
                : 'Address not found';

        setEventDetails(item);
        setEventLocation(location);
        setIsDetailsModalVisible(true);
    } catch (error) {
        console.error('Error fetching address:', error);
        Alert.alert('Error', 'Failed to fetch event details');
    }
};

  const renderEventResult = ({ item }: { item: Event }) => (
    <TouchableOpacity
    style={styles.eventCard}
    onPress={() => handleDetailsEvent(item)}
>
    <Text style={styles.eventName}>{item.name}</Text>
    <Text>
        {item.date ? new Date(item.date).toLocaleDateString() : 'Fecha no disponible'}
    </Text>
    <Text>{item.description}</Text>

    <View style={styles.detailButton}>
        <Button title="Detalles" onPress={() => handleDetailsEvent(item)} />
    </View>
</TouchableOpacity>
  );

  const renderUserResult = ({ item }: { item: User }) => (
        <View style={styles.resultCard}>
            <FontAwesome5 name="user" size={24} color="#FF7F50" style={styles.resultIcon} />
            <View>
                <Text style={styles.resultTitle}>{item.name}</Text>
                <Text style={styles.resultType}>{item.email}</Text>
            </View>
        </View>);

return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <Text style={styles.header}>Buscar Eventos o Usuarios</Text>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.input}
          placeholder="Escribe el nombre del evento o usuario..."
          placeholderTextColor="#A9A9A9"
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={() => {
            handleEventSearch();
            handleUserSearch();
          }}
        />
        <TouchableOpacity
          style={styles.searchButton}
          onPress={() => {
            handleEventSearch();
            handleUserSearch();
          }}
        >
          <FontAwesome5 name="search" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {isSearching ? (
        <Text style={styles.loadingText}>Buscando...</Text>
      ) : (
        <ScrollView>
          {/* Events Section */}
          <Text style={styles.sectionHeader}>Eventos</Text>
          <FlatList
            data={filteredEvents}
            renderItem={renderEventResult}
            keyExtractor={(item) => item.id.toString()}
            ListEmptyComponent={<Text style={styles.noResultsText}>No se encontraron eventos.</Text>}
          />

          {/* Users Section */}
          <Text style={styles.sectionHeader}>Usuarios</Text>
          <FlatList
            data={filteredUsers}
            renderItem={renderUserResult}
            keyExtractor={(item) => item.id.toString()}
            ListEmptyComponent={<Text style={styles.noResultsText}>No se encontraron usuarios.</Text>}
          />
        </ScrollView>
      )}
            <Modal
                visible={isDetailsModalVisible}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setIsDetailsModalVisible(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        {eventDetails && (
                            <>
                                <Text style={styles.modalTitle}>{eventDetails.name}</Text>
                                <Text style={styles.modalText}>
                                    Descripción: {eventDetails.description}
                                </Text>
                                <Text style={styles.modalText}>
                                    Fecha: {new Date(eventDetails.date).toLocaleDateString()}
                                </Text>
                                <Text style={styles.modalText}>Ubicación: {eventLocation}</Text>
                                <Text style={styles.modalText}>
                                    Participantes: {eventDetails.currentParticipants}/
                                    {eventDetails.maxParticipants}
                                </Text>
                                <TouchableOpacity
                                    style={styles.locationButton}
                                    onPress={handleShowMap}
                                >
                                    <Text style={styles.locationButtonText}>Ver en el Mapa</Text>
                                </TouchableOpacity>
                            </>
                        )}
                        <TouchableOpacity
                            style={styles.closeButton}
                            onPress={() => setIsDetailsModalVisible(false)}
                        >
                            <Text style={styles.closeButtonText}>Cerrar</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* Map Modal */}
            <Modal
                visible={isMapVisible}
                transparent={true}
                animationType="fade"
                onRequestClose={handleCloseMap}
            >
                <View style={styles.mapModalContainer}>
                    <View style={styles.mapModalContent}>
                        <MapView
                            style={styles.map}
                            initialRegion={{
                                latitude: (eventDetails?.latitude ?? 0) + 0.004, // Offset latitude
                                longitude: (eventDetails?.longitude ?? 0) + 0.004, // Offset longitude
                                latitudeDelta: 0.015,
                                longitudeDelta: 0.015,
                            }}
                        >
                          <Circle //cambiar a marker para que se vea el punto
                              center={{
                                  latitude: (eventDetails?.latitude ?? 0) + 0.001, // Offset latitude
                                  longitude: (eventDetails?.longitude ?? 0) + 0.001, // Offset longitude
                              }}
                              radius={500}
                              strokeColor="rgba(0, 255, 0, 0.5)"
                              fillColor="rgba(0, 255, 0, 0.2)"
                              strokeWidth={2}
                                //title={eventDetails?.name ?? ''}
                                //description={eventDetails?.description ?? ''}
                            />
                        </MapView>
                        <TouchableOpacity
                            style={styles.closeMapButton}
                            onPress={handleCloseMap}
                        >
                            <Text style={styles.closeMapButtonText}>Cerrar Mapa</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    padding: 16,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF7F50',
    textAlign: 'center',
    marginBottom: 20,
  },
  sectionHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FF7F50',
    marginTop: 10,
    marginBottom: 5,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  input: {
    flex: 1,
    height: 50,
    borderWidth: 1,
    borderColor: '#FF7F50',
    borderRadius: 25,
    paddingHorizontal: 16,
    fontSize: 16,
    backgroundColor: '#ffffff',
  },
  searchButton: {
    marginLeft: 10,
    backgroundColor: '#FF7F50',
    borderRadius: 25,
    padding: 12,
  },
  loadingText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#808080',
    marginTop: 20,
  },
  noResultsText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#808080',
    marginTop: 20,
  },
  resultCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#f9f9f9',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#FF7F50',
  },
  resultIcon: {
    marginRight: 16,
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF7F50',
  },
  resultType: {
    fontSize: 14,
    color: '#808080',
  },
  locationButton: {
    marginTop: 15,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#4CAF50',
    borderRadius: 5,
},
buttonContainer: {
    flexDirection: 'row',        // Alineación de los botones en fila
    justifyContent: 'space-between', // Espaciado entre los botones
    marginBottom: 20,            // Margen abajo para separar de la lista
},
actionButtons: {
    marginTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
},
detailButton: {
    marginTop: 10,
    flexDirection: 'row',
    width: '100%', // Make the button container take full width of the card
    justifyContent: 'center', // Center the button within the container
},
eventCard: {
    padding: 15,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    marginBottom: 10,
    borderColor: '#FF7F50',
    borderWidth: 1,
},
locationButtonText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    fontWeight: 'bold',
},
eventName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF7F50',
},
closeMapButton: {
    position: 'absolute',
    bottom: 10,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#f44336',
    borderRadius: 5,
},
closeMapButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
},
buttonWrapper: {
    width: '45%',               // Controla el ancho de cada botón
},
mapModalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
},
mapModalContent: {
    width: '90%',
    height: '60%',
    backgroundColor: '#fff',
    borderRadius: 10,
    overflow: 'hidden',
    alignItems: 'center',
},
map: {
    width: '100%',
    height: '100%',
},
modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent background
},
modalContent: {
    width: '80%',
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
},
modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FF7F50',
    marginBottom: 10,
    textAlign: 'center',
},
modalText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 10,
},
closeButton: {
    marginTop: 20,
    alignSelf: 'center',
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#FF7F50',
    borderRadius: 5,
},
closeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
}
});