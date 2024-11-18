import { SERVER_IP } from '@env';

interface User {
    email: string;
    password: string;
    name: string;
}
export const createNewUser = async (user: User) => {
    try {
        const response = await fetch(`http://${SERVER_IP}:3000/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(user),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to create user');
        }

        const newUser = await response.json();
        console.log('User created:', newUser);
    } catch (error) {
        console.error('Error creating user:', error);
    }
};