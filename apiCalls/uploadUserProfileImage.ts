import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

// Define UserProfileImage type
interface UserProfileImage {
    userId: number;
    uri: string;
}


// Modify the uploadUserProfileImage function to send image as FormData
export const uploadUserProfileImage = async (uri: string) =>{
    const formData = new FormData()
    const userId = await AsyncStorage.getItem('userId')
    const file = {
      uri,
      type: 'image/jpeg',
      name: 'profile_picture' + (Math.random())+ '.jpg',
    }
    formData.append('file', file as any)
    formData.append('userId', userId || '');

    return await fetch(`http://${process.env.EXPO_PUBLIC_SERVER_IP}:3000/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'multipart/form-data',
      } as any,
      body: formData,
    })
  }
  
