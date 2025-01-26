export const updateProfile = async (userId: number, newName: string, newEmail: string) => {
    try {
        // Ensure the date is converted to ISO format
        const response = await fetch(`http://${process.env.EXPO_PUBLIC_SERVER_IP}:3000/updateEvent/${userId}/${newName}/${newEmail}`, {
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