
export const getUserRating = async (userId: number) => {
    try {
        const response = await fetch(`http://${process.env.EXPO_PUBLIC_SERVER_IP}:3000/getUserRating/${userId}`);
        if (!response.ok) {
            throw new Error("Failed to fetch user rating");
        }
        const data = await response.json();
        return { data, error: null };
    } catch (error: any) {
        console.error("Error:", error);
        return { data: null, error: "Error fetching user rating" };
    }
};