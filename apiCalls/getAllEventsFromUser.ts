import { SERVER_IP } from "@env";

export const getAllEventsFromUser = async (userId: number) => {
    try {
        const response = await fetch(`http://${SERVER_IP}:3000/getEventsByUserId/${userId}`);
        if (!response.ok) {
            throw new Error("Failed to fetch user events");
        }
        const data = await response.json();
        return { data, error: null };
    } catch (error: any) {
        console.error("Error:", error);
        return { data: null, error: "Error fetching user events" };
    }
};