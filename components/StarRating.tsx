import { FontAwesome } from "@expo/vector-icons";
import { View } from "react-native";

export const StarRating: React.FC<{ rating: number, size?: number }> = ({ rating, size = 24 }) => {
    const totalStars = 5;
    const filledStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = totalStars - filledStars - (hasHalfStar ? 1 : 0);

    return (
        <View style={{ flexDirection: 'row' }}>
            {Array.from({ length: filledStars }).map((_, index) => (
                <FontAwesome key={`filled-${index}`} name="star" size={size} color="#FFD700" />
            ))}
            {hasHalfStar && <FontAwesome name="star-half" size={size} color="#FFD700" />}
            {Array.from({ length: emptyStars }).map((_, index) => (
                <FontAwesome key={`empty-${index}`} name="star-o" size={size} color="#FFD700" />
            ))}
        </View>
    );
};
