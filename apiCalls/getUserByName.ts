import { SERVER_IP } from "@env";

export const getUserByName = async (userName: string) => {
    try {
        const response = await fetch(`http://${SERVER_IP}:3000/getUserByPartialName/${userName}`);
        if (!response.ok) {
            throw new Error("Failed to fetch user");
        }
        const data = await response.json();
        return { data, error: null };
    } catch (error: any) {
        console.error("Error:", error);
        return { data: null, error: "Error fetching user" };
    }
};