import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Animated, Keyboard, TouchableWithoutFeedback } from 'react-native';
import { createNewUser } from '@/apiCalls/createNewUser';
import { loginUser } from '@/apiCalls/loginUser';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuthContext } from '@/context/userLoginContext';  // Updated import

export default function InicioPerfil() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [userName, setUsername] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const { login } = useAuthContext();  // Use login method from context

  const emailAnimation = useState(new Animated.Value(1))[0];
  const passwordAnimation = useState(new Animated.Value(1))[0];
  const confirmPasswordAnimation = useState(new Animated.Value(1))[0];
  interface LoginResponse {
    success: boolean;
    message?: string;  // Optional field for any message returned
  }
  const createUser = async () => {
    const user = { email, password, name: userName, rating: 0 };
    if (validateUser(user)) {
      try {
        const res = await createNewUser(user);

        // Check if user creation was successful before calling login
        if (res) {
          login();  // Only call login if the user creation was successful
        } else {
          setErrorMessage('Error al crear el usuario, por favor inténtalo de nuevo.');
        }
      } catch (error) {
        setErrorMessage('Error al crear el usuario, por favor inténtalo de nuevo.');
      }
    }
  };

  const validateUser = (user: { email: string; password: string; name: string; }) => {
    if (!user.email || !user.password || !user.name) {
      setErrorMessage('Por favor, rellena todos los campos');
      return false;
    }
    if (!user.email.includes('@')) {
      setErrorMessage('Por favor, introduce un correo electrónico válido');
      return false;
    }
    if (user.password.length < 6) {
      setErrorMessage('La contraseña debe tener al menos 6 caracteres');
      return false;
    }
    if (user.password.length > 10) {
      setErrorMessage('La contraseña debe tener como maximo 10 caracteres');
      return false;
    }
    return true;
  };
  
  const loginNewUser = async () => {
    const user = { email, password, name: "" };
  
    try {
      const res = await loginUser(user);  // Now res will contain either 'id' or 'error'
  
      if ('id' in res) {
        // Login successful, handle success
        await AsyncStorage.setItem('userId', res.id.toString());

        login();  // Update the auth context
      } else {
        // Login failed, show the error message
        setErrorMessage(res.error || 'Unknown error occurred');
      }
    } catch (error) {
      setErrorMessage('Error al iniciar sesión, por favor inténtalo de nuevo.');
      console.error('Error logging in:', error);
    }
  };
  
  
  const handlePress = () => {
    setErrorMessage('');  // Reset the error message before trying to log in or register
    if (isLogin) {
      loginNewUser();
    } else {
      createUser();
    }
  };

  const bounceAnimation = (animation: Animated.Value) => {
    Animated.spring(animation, {
      toValue: 1.05,
      friction: 3,
      tension: 100,
      useNativeDriver: true,
    }).start(() => {
      // Return to original scale
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

        {/* Display error message if exists */}
        {errorMessage ? <Text style={styles.errorMessage}>{errorMessage}</Text> : null}

        <Animated.View style={{ transform: [{ scale: emailAnimation }] }}>
          <TextInput
            style={styles.input}
            placeholder="Correo Electrónico"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            placeholderTextColor="#A9A9A9"
            onFocus={() => bounceAnimation(emailAnimation)} // Bounce when input is focused
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
            onFocus={() => bounceAnimation(passwordAnimation)} // Bounce when input is focused
          />
        </Animated.View>

        {!isLogin && (
          <Animated.View style={{ transform: [{ scale: confirmPasswordAnimation }] }}>
            <TextInput
              style={styles.input}
              placeholder="Nombre De Usuario"
              value={userName}
              onChangeText={setUsername}
              placeholderTextColor="#A9A9A9"
              onFocus={() => bounceAnimation(confirmPasswordAnimation)} // Bounce when input is focused
            />
          </Animated.View>
        )}

        <TouchableOpacity style={styles.button} onPress={handlePress}>
          <Text style={styles.buttonText}>{isLogin ? 'Iniciar Sesión' : 'Registrar'}</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setIsLogin(!isLogin)}>
          <Text style={styles.toggleText}>
            {isLogin ? '¿No tienes una cuenta? Regístrate' : '¿Ya tienes una cuenta? Inicia Sesión'}
          </Text>
        </TouchableOpacity>
      </View>
    </TouchableWithoutFeedback>
  );
}

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
  errorMessage: {
    color: 'red',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 10,
  },
});
