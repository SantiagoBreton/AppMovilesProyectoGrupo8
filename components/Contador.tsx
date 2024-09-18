import { useState } from "react";
import { Pressable, Text, View } from "react-native";
    
function Contador() {
    const[contador, setContador] = useState(0)
    const incrementar = ()=>{setContador(prev => prev+1)}
    const decrementar = ()=>{setContador(prev => (prev-1 < 0)? 0: prev-1) }

    return(
        <View>
            <Text>Contador: {contador}</Text>
            <Pressable onPress = {incrementar}>
                <Text>Incrementar</Text>
            </Pressable>
            <Pressable onPress = {decrementar}>
                <Text>Decrementar</Text>
            </Pressable>
        </View>
    )
   
}

export {Contador}