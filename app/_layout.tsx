// src/screens/RootLayout.tsx
import { Tabs } from "expo-router";
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';


export default function RootLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#808080', 
        tabBarInactiveTintColor: '#ffffff', 
        tabBarStyle: {
          backgroundColor: '#FF7F50',
          borderTopColor: '#FF7F50',
        },
        headerStyle: {
          backgroundColor: '#FF7F50',
        },
        headerTintColor: '#ffffff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ color, size }) => (
            <FontAwesome5 name="map" size={size} color={color} />
          ),
          title: 'Mapa',
        }}
      />
      <Tabs.Screen
        name="inicio_perfil"
        options={{
          tabBarIcon: ({ color, size }) => (
            <FontAwesome5 name="user-plus" size={size} color={color} />
          ),
          title: 'Inicio Perfil',
        }}
      />
      <Tabs.Screen
        name="perfil"
        options={{
          tabBarIcon: ({ color, size }) => (
            <FontAwesome5 name="user-tie" size={size} color={color} />
          ),
          title: 'Perfil',
        }}
      />

      <Tabs.Screen
        name="eventos"
        options={{
          tabBarIcon: ({ color, size }) => (
            <FontAwesome5 name="plus" size={size} color={color} />
          ),
          title: 'Eventos',
        }}
      />
    </Tabs>
  );
}
