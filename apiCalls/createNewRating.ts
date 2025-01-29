interface Rating {
    
    ratingUserId: number;
    userId: number;
    comment: string;
    rating: number;
    
}

export const createNewRating = async (rating: Rating) => {
    try {
        const response = await fetch(`http://${process.env.EXPO_PUBLIC_SERVER_IP}:3000/createNewUserRating`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(rating),
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to create rating');
        }
        const newRating = await response.json();
        
        return true; // Return success if rating is created
    } catch (error) {
        console.error('Error creating rating:', error);
        return false; // Return failure if an error occurred
    }
}