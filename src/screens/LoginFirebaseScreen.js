import React, { useState, useEffect } from 'react';
import { View, TextInput, Text, TouchableOpacity, StyleSheet, Image, Alert, KeyboardAvoidingView, Platform, ScrollView, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { signInWithEmailAndPassword, onAuthStateChanged } from 'firebase/auth';  // Agregamos onAuthStateChanged
import { auth } from '../firebaseConfig';  // Importamos la configuración de Firebase

const LoginFirebaseScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Verificar si el usuario ya está autenticado
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        navigation.navigate('Home');  // Redirige a Home si ya está autenticado
      }
    });

    return () => unsubscribe();  // Limpiar el listener cuando el componente se desmonte
  }, [navigation]);  // Dependencia de `navigation` para evitar re-renderizados infinitos

  const handleLogin = () => {
    if (!email || !password) {
      Alert.alert('Campos incompletos', 'Por favor, complete ambos campos antes de iniciar sesión.');
      return;
    }

    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        const user = userCredential.user;
        console.log('Login exitoso: ', user);
        navigation.navigate('Home');
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        console.error('Error de autenticación: ', errorCode, errorMessage);
        Alert.alert('Error de inicio de sesión', 'Correo o contraseña incorrectos.');
      });
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.container}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <Image source={require('../../assets/logo.png')} style={styles.logo} />
          <Text style={styles.title}>VEDRUNA EDUCACIÓN</Text>

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Introduzca su correo..."
              placeholderTextColor="#868686"
              value={email}
              onChangeText={setEmail}
            />
          </View>

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Introduzca su contraseña..."
              placeholderTextColor="#868686"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          <TouchableOpacity onPress={() => console.log('¿Olvidaste la contraseña?')} style={styles.forgotPasswordContainer}>
            <Text style={styles.forgotPasswordText}>¿Olvidaste la contraseña?</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, (!email || !password) && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={!email || !password}
          >
            <Text style={styles.buttonText}>Log in</Text>
          </TouchableOpacity>

          <View style={styles.footer}>
            <View style={styles.divider} />
            <TouchableOpacity onPress={() => navigation.navigate('RegisterFirebaseScreen')}>
              <Text style={styles.footerText}>¿No tienes cuenta? <Text style={styles.footerHighlight}>Crear cuenta</Text></Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#23272A',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  logo: {
    width: 243,
    height: 243,
  },
  title: {
    fontSize: 40,
    fontWeight: '700',
    textAlign: 'center',
    color: '#DFDFDF',
    marginBottom: 20,
  },
  inputContainer: {
    width: 312,
    height: 40,
    backgroundColor: '#323639',
    borderRadius: 9,
    justifyContent: 'center',
    marginBottom: 30,
  },
  input: {
    paddingLeft: 10,
    color: '#868686',
    fontSize: 16,
  },
  forgotPasswordContainer: {
    width: '80%',
    alignItems: 'flex-end',
    marginBottom: 50,
  },
  forgotPasswordText: {
    color: '#9FC63B',
    fontSize: 14,
    textAlign: 'right',
  },
  button: {
    width: 312,
    height: 40,
    backgroundColor: '#9FC63B',
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },
  buttonDisabled: {
    backgroundColor: '#6C6C6C',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#23272A',
  },
  footer: {
    position: 'absolute',
    bottom: 20,
    width: '100%',
    alignItems: 'center',
  },
  divider: {
    width: '100%',
    height: 0,
    borderBottomWidth: 2,
    borderColor: '#323639',
    marginBottom: 10,
  },
  footerText: {
    color: '#DFDFDF',
    fontSize: 14,
    textAlign: 'center',
  },
  footerHighlight: {
    color: '#9FC63B',
    fontWeight: 'bold',
  },
});

export default LoginFirebaseScreen;

