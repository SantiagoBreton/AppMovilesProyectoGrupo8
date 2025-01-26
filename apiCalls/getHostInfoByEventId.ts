export const getHostInfoByEventId = async (eventId: number) => {
    if (!eventId) return { data: null};
    try {
        const response = await fetch(`http://${process.env.EXPO_PUBLIC_SERVER_IP}:3000/getHostInfoByEventId/${eventId}`);

        if (!response.ok) { 
            throw new Error("Failed to fetch user info");
        }
        const data = await response.json();
        return { data, error: null };
    } catch (error) {}
}