import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { Contador } from "@/components/Contador";
import Tarjeta from "@/components/Tarjeta";

export default function Index() {
  return (

    
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
    <Contador />
    <Tarjeta/>
    </View>
  );
}
