export const unsubscribeUserFromAnEvent = async (userId: number, eventId: number) => {
  try {
    const response = await fetch(`http://${process.env.EXPO_PUBLIC_SERVER_IP}:3000/unsubscribeUserFromEvent/${userId}/${eventId}`, {
      method: 'DELETE',
    });

    if (response.ok) {
      const data = await response.json();
      console.log('Event deleted successfully:', data);
      return data;
    } else {
      throw new Error('Failed to delete event');
    }
  } catch (error) {
    console.error('Error deleting event:', error);
    throw error;
  }
};
