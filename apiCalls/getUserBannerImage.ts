export const getUserBannerImage = async (userId:number) => {
    try {
        const response = await fetch(
            `http://${process.env.EXPO_PUBLIC_SERVER_IP}:3000/getUserBannerImage/${userId}`
        );

        if (!response.ok) {
            throw new Error('Failed to fetch user banner image');
        }

        const data = await response.json(); // Assuming the backend sends JSON with the image URL or path
        return { data, error: null };
    } catch (error: any) {
        console.error('Error fetching user banner image:', error);
        return { data: null, error: 'Error fetching user banner image' };
    }
};
