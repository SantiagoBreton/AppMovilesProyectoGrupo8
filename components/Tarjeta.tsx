import { Pressable, StyleSheet, Text, View } from 'react-native'
import React, { useState } from 'react'





const Tarjeta = () => {
  const [estado, setEstado] = useState(false)
  const [nombre, setNombre] = useState("")

  const cambiarNombre= (nuevoNombre: string)=>setNombre(nombre => nuevoNombre)
  const cambiarEstado = ()=> setEstado(estado=> !estado)
  const estilo = estado ? styles.prendido : styles.apagado;
  
  return (
    <View>
      
      <Pressable onPress={cambiarEstado} style={estilo}>
        <Text> {nombre}</Text>
      </Pressable>
    </View>
  )
}



const styles = StyleSheet.create({
  apagado: {
    backgroundColor: 'grey', 
    height: 50,
    width:150,
    borderRadius: 5,
  },
  prendido: {
    backgroundColor: 'green', 
    padding: 10,
    height: 50,
    width:150,
    borderRadius: 5,
  },
});

export default Tarjeta