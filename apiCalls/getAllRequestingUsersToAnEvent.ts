

export const getAllRequestingUsersToAnEvent = async (eventId: number) => {
    try {
        const response = await fetch(`http://${process.env.EXPO_PUBLIC_SERVER_IP}:3000/getAllRequestingUsersToAnEvent/${eventId}`);
        
        if (!response.ok) {
            throw new Error("Failed to fetch user for event");
        }
        const data = await response.json();
        return { data, error: null };
    } catch (error: any) {
        console.error("Error:", error);
        return { data: null, error: "Error fetching event" };
    }
};