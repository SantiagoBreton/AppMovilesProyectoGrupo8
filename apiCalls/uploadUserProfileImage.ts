import AsyncStorage from "@react-native-async-storage/async-storage";

export const uploadUserProfileImage = async (uri: string) => {
  const formData = new FormData()
  const userId = await AsyncStorage.getItem('userId')
  const file = {
    uri,
    type: 'image/jpeg',
    name: 'profile_picture' + (Math.random()) + '.jpg',
  }
  formData.append('file', file as any)
  formData.append('userId', userId || '');

  return await fetch(`http://${process.env.EXPO_PUBLIC_SERVER_IP}:3000/uploadUserImage`, {
    method: 'POST',
    headers: {
      'Content-Type': 'multipart/form-data',
    } as any,
    body: formData,
  })
}

