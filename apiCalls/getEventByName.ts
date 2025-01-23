export const getEventByName = async (userId: number, eventName: string) => {
    try {
        console.log(userId, eventName);
        const response = await fetch(`http://${process.env.EXPO_PUBLIC_SERVER_IP}:3000/getEventByPartialName/${userId}/${eventName}`);

        if (!response.ok) { 
            throw new Error("Failed to fetch event");
        }
        const data = await response.json();
        return { data, error: null };
    } catch (error: any) {
        console.error("Error:", error);
        return { data: null, error: "Error fetching event" };
    }
};