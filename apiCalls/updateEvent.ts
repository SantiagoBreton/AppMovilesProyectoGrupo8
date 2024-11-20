import { SERVER_IP } from "@env";

// Function to delete event by id
export const updateEvent = async (eventId: number, newName: string, newDescription: string, newDate:Date   ) => {
    try {
        // Ensure the date is converted to ISO format
        const response = await fetch(`http://${SERVER_IP}:3000/updateEvent/${eventId}/${newName}/${newDescription}/${newDate}`, {
            method: 'GET', // Replace with 'PUT' if you're following REST conventions
        });

        if (response.ok) {
            const data = await response.json();
            console.log('Event updated successfully:', data);
            return data;
        } else {
            throw new Error('Failed to update event');
        }
    } catch (error) {
        console.error('Error updating event:', error);
        throw error;
    }
};
