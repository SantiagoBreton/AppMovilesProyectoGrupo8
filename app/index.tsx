import React from 'react';
import MapView from 'react-native-maps';
import { StyleSheet, View } from 'react-native';
import { useEffect, useState } from 'react';
import * as Location from 'expo-location';
import { ActivityIndicator } from 'react-native';

export default function Index() {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.log('Permission to access location was denied');
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setLocation(location);
      setLoading(false);
    })();
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
      userLocationAnnotationTitle="You are here"
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
      />
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
});
