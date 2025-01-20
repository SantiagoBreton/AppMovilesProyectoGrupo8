
import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const myData = () => {
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [dataError, setDataError] = useState<string | null>(null);

  useEffect(() => {
    const getData = async () => {
      try {
        const id = await AsyncStorage.getItem('userId');
        const response = await fetch(`http://${process.env.SERVER_IP}:3000/getUserData/${id}`);
        const responseText = await response.text(); // Get the response text

        if (response.ok) {
            const data = JSON.parse(responseText);
          setNombre(data.name);
          setEmail(data.email);
        } else {
          const errorData = JSON.parse(responseText); // Parse the error response text as JSON
          throw new Error(errorData.error || 'Failed to fetch user data');
        }
      } catch (error: any) {
        setDataError(`Error fetching user data: ${error.message}`);
      }
    };

    getData();
  }, []);

  return { nombre, email, dataError };
};