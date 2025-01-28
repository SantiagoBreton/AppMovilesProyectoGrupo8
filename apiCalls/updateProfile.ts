export const updateProfile = async (userId: number, newName: string, newPassword: string, newDescription: string) => {
    try {
        const queryParams = new URLSearchParams({
            userId: userId.toString(),
            newName,
            newPassword,
            newDescription,
        }).toString();

        const response = await fetch(`http://${process.env.EXPO_PUBLIC_SERVER_IP}:3000/updateProfile?${queryParams}`, {
            method: 'GET',
        });

        if (response.ok) {
            const data = await response.json();
            console.log('Profile updated successfully:', data);
            return data;
        } else {
            throw new Error('Failed to update profile');
        }
    } catch (error) {
        console.error('Error updating profile:', error);
        throw error;
    }
};