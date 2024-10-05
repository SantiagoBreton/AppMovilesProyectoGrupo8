import React from 'react';
import MapView, { Marker, Callout } from 'react-native-maps';
import { StyleSheet, View, Text, Modal} from 'react-native';
import { useEffect, useState } from 'react';
import * as Location from 'expo-location';
import { ActivityIndicator } from 'react-native';

export default function Index() {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState([
    // Simulación de eventos con coordenadas e información
    { id: 1, title: 'Evento', description: 'sin control, no se permiten mujeres ni , por favor traer facturas', latitude: 37.78825, longitude: -122.4324 },
    { id: 2, title: 'Evento no , mas bien ', description: 'tiro al blanco con chinos, utilizamos chinos para tiro al blanco, aunque sean amarillos', latitude: 37.78925, longitude: -122.4354 },
  ]);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.log('Permission to access location was denied');
        return;
      }

      let location = await Location.getCurrentPositionAsync({});

      const eventNearby = {
        id: 1,
        title: 'Evento ',
        description: ' sin control, no se permiten mujeres ni  (opcional), por favor traer facturas',
        latitude: location.coords.latitude ,
        longitude: location.coords.longitude ,
      };

      setEvents([eventNearby]);
      setLocation(location);
      setLoading(false);
    })();
  }, []);

  useEffect(() => {
    if (!loading) {
      const timer = setTimeout(() => {
        setModalVisible(true);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [loading]);
  
  if (loading) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }
  
  return (
    <View style={styles.container}>
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(!modalVisible);
        }}
      >
        <View style={styles.modalView}>
          <Text style={styles.modalTitle}>Modal Title</Text>
          <Text>Modal Content</Text>
        </View>
      </Modal>
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
            <Marker
              key={event.id}
              coordinate={{ latitude: event.latitude, longitude: event.longitude }}
            >
              <Callout>
                <View>
                  <Text style={styles.title}>{event.title}</Text>
                  <Text>{event.description}</Text>
                </View>
              </Callout>
            </Marker>
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
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontWeight: 'bold',
    fontSize: 18,
  },
});
