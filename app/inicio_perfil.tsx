import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';

export default function InicioPerfil(){
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const handleAuth = () => {
        if (isLogin) {
            // Lógica para iniciar sesión
            console.log('Iniciar sesión con', email, password);
        } else {
            // Lógica para registrar
            if (password === confirmPassword) {
                console.log('Registrar con', email, password);
            } else {
                console.log('Las contraseñas no coinciden');
            }
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>{isLogin ? 'Iniciar Sesión' : 'Registro'}</Text>
            <TextInput
                style={styles.input}
                placeholder="Correo Electrónico"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
            />
            <TextInput
                style={styles.input}
                placeholder="Contraseña"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
            />
            {!isLogin && (
                <TextInput
                    style={styles.input}
                    placeholder="Confirmar Contraseña"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry
                />
            )}
            <Button title={isLogin ? 'Iniciar Sesión' : 'Registrar'} onPress={handleAuth} />
            <Button
                title={isLogin ? '¿No tienes una cuenta? Regístrate' : '¿Ya tienes una cuenta? Inicia Sesión'}
                onPress={() => setIsLogin(!isLogin)}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        padding: 16,
    },
    title: {
        fontSize: 24,
        marginBottom: 16,
        textAlign: 'center',
    },
    input: {
        height: 40,
        borderColor: 'gray',
        borderWidth: 1,
        marginBottom: 12,
        paddingHorizontal: 8,
    },
});