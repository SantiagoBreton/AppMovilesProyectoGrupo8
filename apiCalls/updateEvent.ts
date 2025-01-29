
// Function to delete event by id
export const updateEvent = async (eventId: number, newName: string, newDescription: string, newDate:Date, newTime: string  ) => {
    try {
        // Ensure the date is converted to ISO format
        const response = await fetch(`http://${process.env.EXPO_PUBLIC_SERVER_IP}:3000/updateEvent/${eventId}/${newName}/${newDescription}/${newDate}/${newTime}`, {
            method: 'GET', // Replace with 'PUT' if you're following REST conventions
        });

        if (response.ok) {
            const data = await response.json();
            
            return data;
        } else {
            throw new Error('Failed to update event');
        }
    } catch (error) {
        console.error('Error updating event:', error);
        throw error;
    }
};
