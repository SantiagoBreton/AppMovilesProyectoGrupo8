import { Tabs } from "expo-router";
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';


export default function RootLayout() {
  return (
    <Tabs>
      <Tabs.Screen name="index" />
      <Tabs.Screen options={{
        tabBarIcon: ({ color, size }) => (
        <FontAwesome5 name="user-plus" size={size} color={color} />
        ),
      }}
      name="inicio_perfil" /> 
      <Tabs.Screen options={{
        tabBarIcon: ({ color, size }) => (
        <FontAwesome5 name="user-tie" size={size} color={color} />
        ),
      }} name="perfil" 
      />
      <Tabs.Screen options={{
        tabBarIcon: ({ color, size }) => (
        <FontAwesome5 name="plus" size={size} color={color} />
        ),
      }}name="creacion_evento" /> 
    </Tabs>
    
  );
}