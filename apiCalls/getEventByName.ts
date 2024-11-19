import { SERVER_IP } from "@env";

export const getEventByName = async (eventName: string) => {
    try {
        const response = await fetch(`http://${SERVER_IP}:3000/getEventByPartialName/${eventName}`);
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