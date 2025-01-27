export const updateProfile = async (userId: number, newName: string, newPassword: string, newDescription: string) => {
    try {
        // Ensure the date is converted to ISO format
        const response = await fetch(`http://${process.env.EXPO_PUBLIC_SERVER_IP}:3000/updateProfile/${userId}/${newName}/${newPassword}/${newDescription}`, {
            method: 'GET', // Replace with 'PUT' if you're following REST conventions
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