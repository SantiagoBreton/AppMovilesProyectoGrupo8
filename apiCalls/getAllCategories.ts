
export const getAllCategories = async () => {
    try {
        const response = await fetch(`http://${process.env.EXPO_PUBLIC_SERVER_IP}:3000/getAllCategories`);
        if (!response.ok) {
            throw new Error("Failed to fetch categories");
        }
        const data = await response.json();
        
        return { data, error: null };
    } catch (error: any) {
        console.error("Error:", error);
        return { data: null, error: "Error fetching categories" };
    }
};