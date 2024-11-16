import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Animated, Keyboard, TouchableWithoutFeedback } from 'react-native';
import { SERVER_IP } from '@env';

export default function InicioPerfil() {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [userName, setUsername] = useState('');
    
    // separo los values de las animatciones para cada input
    const emailAnimation = useState(new Animated.Value(1))[0];
    const passwordAnimation = useState(new Animated.Value(1))[0];
    const confirmPasswordAnimation = useState(new Animated.Value(1))[0];

    interface User {
        email: string;
        password: string;
        name: string;
    };

    const handleAuth = () => {
        if (isLogin) {
            console.log('Iniciar sesión con', email, password);
        } else {
            if (password === password) {
                console.log('Registrar con', email, password);
            } else {
                console.log('Las contraseñas no coinciden');
            }
        }
    };




    const createNewUser = async function createUser() {
        const user: User = {
            email: email,
            password: password,
            name: userName,
        };
        try {
            const response = await fetch(`http://${SERVER_IP}:3000/createUser`, {
                method: 'POST',
                headers: {
                'Content-Type': 'application/json',
                },
            body: JSON.stringify(user),
        });
       
        if (!response.ok) {
            throw new Error('Failed to create user');
        }
       
        const newUser = await response.json();
        console.log('User created:', newUser);
        } catch (error) {
        console.error('Error creating user:', error);
        }
    };

    const bounceAnimation = (animation: Animated.Value) => {
        Animated.spring(animation, {
            toValue: 1.05,
            friction: 3,
            tension: 100,
            useNativeDriver: true,
        }).start(() => {
            // Esto lo vuelve a la escala OG
            Animated.spring(animation, {
                toValue: 1,
                friction: 3,
                tension: 100,
                useNativeDriver: true,
            }).start();
        });
    };

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.container}>
                <Text style={styles.title}>{isLogin ? 'Iniciar Sesión' : 'Registro'}</Text>
                <Animated.View style={{ transform: [{ scale: emailAnimation }] }}>
                    <TextInput
                        style={styles.input}
                        placeholder="Correo Electrónico"
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        placeholderTextColor="#A9A9A9"
                        onFocus={() => bounceAnimation(emailAnimation)} //bouncea cuando clicekas en el input
                    />
                </Animated.View>
                <Animated.View style={{ transform: [{ scale: passwordAnimation }] }}>
                    <TextInput
                        style={styles.input}
                        placeholder="Contraseña"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                        placeholderTextColor="#A9A9A9"
                        onFocus={() => bounceAnimation(passwordAnimation)} //bouncea cuando clickeas en el input
                    />
                </Animated.View>
                {!isLogin && (
                    
                    <Animated.View style={{ transform: [{ scale: confirmPasswordAnimation }] }}>
                        <TextInput
                            style={styles.input}
                            placeholder="Nombre De Usuario"
                            value={userName}
                            onChangeText={setUsername}
                            secureTextEntry
                            placeholderTextColor="#A9A9A9"
                            onFocus={() => bounceAnimation(confirmPasswordAnimation)} // bouncea inpt
                        />
                    </Animated.View>
                )}
                <TouchableOpacity style={styles.button} onPress={createNewUser}>
                    <Text style={styles.buttonText }>{isLogin ? 'Iniciar Sesión' : 'Registrar'}</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setIsLogin(!isLogin)}>
                    <Text style={styles.toggleText}>
                        {isLogin ? '¿No tienes una cuenta? Regístrate' : '¿Ya tienes una cuenta? Inicia Sesión'}
                    </Text>
                </TouchableOpacity>
            </View>
        </TouchableWithoutFeedback>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        padding: 16,
        backgroundColor: '#ffffff',
    },
    title: {
        fontSize: 24,
        marginBottom: 16,
        textAlign: 'center',
        color: '#FF7F50', 
    },
    input: {
        height: 50,
        borderColor: '#FF7F50', 
        borderWidth: 1,
        borderRadius: 25, 
        marginBottom: 12,
        paddingHorizontal: 16,
        backgroundColor: '#ffffff',
    },
    button: {
        backgroundColor: '#FF7F50', 
        borderRadius: 25, 
        paddingVertical: 12,
        alignItems: 'center',
        marginVertical: 10,
    },
    buttonText: {
        color: '#ffffff', 
        fontSize: 18,
    },
    toggleText: {
        textAlign: 'center',
        color: '#FF7F50', 
        marginTop: 10,
    },
});
