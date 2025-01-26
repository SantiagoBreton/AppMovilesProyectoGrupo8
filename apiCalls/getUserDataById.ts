export const getUserDataById = async (userId: number) => {

  try {
    const response = await fetch(`http://${process.env.EXPO_PUBLIC_SERVER_IP}:3000/getUserData/${userId}`);
    const responseText = await response.text(); // Get the response text

    if (response.ok) {
      const data = JSON.parse(responseText);
      return data;
    } else {
      const errorData = JSON.parse(responseText); // Parse the error response text as JSON
      throw new Error(errorData.error || 'Failed to fetch user data');
    }
  } catch (error: any) {
    console.error("Error:", error);
    return { data: null, error: "Error fetching event" };
  }
};



