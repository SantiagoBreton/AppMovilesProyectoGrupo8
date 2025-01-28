import { Float } from "react-native/Libraries/Types/CodegenTypes";

interface EventWithId {
    id: number;
    name: string;
    date: Date;
    latitude: Float;
    longitude: Float;
    description: string;
    maxParticipants: number;
    currentParticipants: number;
    time: string;
    category: any;
    userId: number;
};

export const getCategoryBackgroundColor = (event: EventWithId) => {
    if (event?.category?.name === 'Deporte') {
        return '#7FBF6E'; //light green
    }
    if (event?.category?.name === 'Musica') {
        return '#F76D8C'; //light pink
    }
    if (event?.category?.name === 'Arte') {
        return '#65B9D3'; //light blue
    }
    if (event?.category?.name === 'Comida') {
        return '#FF4E50'; //light red
    }
    if (event?.category?.name === 'NetWorking') {
        return '#F9D616'; //light yellow
    }
    if (event?.category?.name === 'Fiesta') {
        return '#F0BB62'; //light orange
    }
    if (event?.category?.name === 'Voluntariado') {
        return '#D2B48C'; //light brown
    }
    return '#fef6f2';
}

export const getCategoryImage = (category: string) => {
    if (category === 'Deporte') {
      return require('../assets/images/sport.png');
    }
    if (category === 'Musica') {
      return require('../assets/images/music.png');
    }
    if (category === 'Arte') {
      return require('../assets/images/art.png');
    }
    if (category === 'Comida') {
      return require('../assets/images/food.png');
    }
    if (category === 'NetWorking') {
      return require('../assets/images/networking.png');
    }
    if (category === 'Fiesta') {
      return require('../assets/images/party.png');
    }
    if (category === 'Voluntariado') {
      return require('../assets/images/volunteer.png');
    }
    return require('../assets/images/ping.png');
  }