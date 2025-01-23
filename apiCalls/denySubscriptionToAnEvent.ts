import { router } from "expo-router";

export const denySubscriptionToAnEvent = async (eventId: number, userId: number) => {
    try {
        const response = await fetch(`http://${process.env.EXPO_PUBLIC_SERVER_IP}:3000/denySubscriptionToAnEvent/${eventId}/${userId}`, {
            method: 'DELETE',
        });

        if (response.ok) {
            const data = await response.json();
            console.log('User denied to event:', data);
            router.push('/eventos')
            return data;
        } else {
            throw new Error('Failed to deny subscription to event');
        }
    } catch (error) {
        console.error('Error denying subscription to event:', error);
        throw error;
    }
}