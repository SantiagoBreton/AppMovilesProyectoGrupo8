import { SERVER_IP } from "@env";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Float } from "react-native/Libraries/Types/CodegenTypes";


interface Event {
    name: String;
    date: Date;
    latitude: Float;
    longitude: Float;
    description: String;
    maxParticipants: number;
    currentParticipants: number;
    userId: number;
};

export const createEvent = async function createEvent(event: Event) {
    try {
        const response = await fetch(`http://${SERVER_IP}:3000/createEvent`, {
            method: 'POST',
            headers: {
            'Content-Type': 'application/json',
            },
        body: JSON.stringify(event),
    });
   
    if (!response.ok) {
        throw new Error('Failed to create event');
    }
    
    const newEvent = await response.json();
    console.log('User created:', newEvent);
    
    } catch (error) {
    console.error('Error creating user:', error);
    }
};