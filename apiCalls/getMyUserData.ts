
import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const getMyUserData = async () => {



  try {
    const id = await AsyncStorage.getItem('userId');
    const response = await fetch(`http://${process.env.EXPO_PUBLIC_SERVER_IP}:3000/getUserData/${id}`);
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



