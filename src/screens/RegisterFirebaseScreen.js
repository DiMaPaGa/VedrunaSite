import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebaseConfig'; 

const RegisterFirebaseScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [nick, setNick] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [secondLastName, setSecondLastName] = useState('');

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const validateField = (field, value) => {
    let error = '';
    if (!value.trim()) {
      error = 'Este campo es obligatorio.';
    } else if (field === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      error = 'Introduzca un correo válido.';
    } else if (field === 'password' && value.length < 6) {
      error = 'La contraseña debe tener al menos 6 caracteres.';
    } else if (field === 'confirmPassword' && value !== password) {
      error = 'Las contraseñas no coinciden.';
    }
    setErrors((prev) => ({ ...prev, [field]: error }));
  };

  const validateForm = () => {
    const fields = { email, password, confirmPassword, nick, firstName, lastName, secondLastName };
    const newErrors = {};

    Object.entries(fields).forEach(([field, value]) => {
      if (!value.trim()) {
        newErrors[field] = 'Este campo es obligatorio.';
      }
    });

    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden.';
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Introduzca un correo válido.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      console.log('Usuario registrado: ', user);

      
      const usuarioData = {
        nick: nick,
        user_id: user.uid,  
        nombre: firstName,
        apellidos: `${lastName} ${secondLastName}`,
        profile_picture: '', 
      };

       
       const response = await fetch('http://192.168.1.168:8080/proyecto01/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(usuarioData),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Usuario guardado en MongoDB:', data);
        navigation.navigate('LoginFirebaseScreen');  
      } else {
        const errorData = await response.json();
        console.error('Error al guardar usuario:', errorData);
        Alert.alert('Error', 'Hubo un problema al guardar los datos del usuario.');
      }
    } catch (error) {
      const errorCode = error.code;
      const errorMessage = error.message;
      console.error('Error al registrar: ', errorCode, errorMessage);
      Alert.alert('Error de registro', 'Hubo un problema al registrar tu cuenta.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{ flex: 1 }}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <Image
            source={require('../../assets/formulario.png')}
            style={styles.image}
            resizeMode="contain"
          />
          <Text style={styles.title}>Completar los siguientes campos:</Text>

          {/* Correo electrónico */}
          <View style={styles.inputGroup}>
            <TextInput
              style={styles.input}
              placeholder="Correo electrónico"
              placeholderTextColor="#868686"
              value={email}
              onChangeText={setEmail}
              onBlur={() => validateField('email', email)}
            />
            <View style={styles.inputLine} />
          </View>
          {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}

          {/* Contraseña */}
          <View style={styles.inputGroup}>
            <TextInput
              style={styles.input}
              placeholder="Contraseña"
              placeholderTextColor="#868686"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              onBlur={() => validateField('password', password)}
            />
            <View style={styles.inputLine} />
          </View>
          {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}

          {/* Confirmar contraseña */}
          <View style={styles.inputGroup}>
            <TextInput
              style={styles.input}
              placeholder="Confirmar contraseña"
              placeholderTextColor="#868686"
              secureTextEntry
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              onBlur={() => validateField('confirmPassword', confirmPassword)}
            />
            <View style={styles.inputLine} />
          </View>
          {errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword}</Text>}

          {/* Nick */}
          <View style={styles.inputGroup}>
            <TextInput
              style={styles.input}
              placeholder="Introduzca su nick"
              placeholderTextColor="#868686"
              value={nick}
              onChangeText={setNick}
              onBlur={() => validateField('nick', nick)}
            />
            <View style={styles.inputLine} />
          </View>
          {errors.nick && <Text style={styles.errorText}>{errors.nick}</Text>}

          {/* Nombre */}
          <View style={styles.inputGroup}>
            <TextInput
              style={styles.input}
              placeholder="Introduzca su nombre"
              placeholderTextColor="#868686"
              value={firstName}
              onChangeText={setFirstName}
              onBlur={() => validateField('firstName', firstName)}
            />
            <View style={styles.inputLine} />
          </View>
          {errors.firstName && <Text style={styles.errorText}>{errors.firstName}</Text>}

          {/* Primer apellido */}
          <View style={styles.inputGroup}>
            <TextInput
              style={styles.input}
              placeholder="Introduzca su primer apellido"
              placeholderTextColor="#868686"
              value={lastName}
              onChangeText={setLastName}
              onBlur={() => validateField('lastName', lastName)}
            />
            <View style={styles.inputLine} />
          </View>
          {errors.lastName && <Text style={styles.errorText}>{errors.lastName}</Text>}

          {/* Segundo apellido */}
          <View style={styles.inputGroup}>
            <TextInput
              style={styles.input}
              placeholder="Introduzca su segundo apellido"
              placeholderTextColor="#868686"
              value={secondLastName}
              onChangeText={setSecondLastName}
              onBlur={() => validateField('secondLastName', secondLastName)}
            />
            <View style={styles.inputLine} />
          </View>
          {errors.secondLastName && <Text style={styles.errorText}>{errors.secondLastName}</Text>}

          <TouchableOpacity
            style={[styles.button, isLoading && styles.buttonDisabled]}
            onPress={handleRegister}
            disabled={isLoading}
          >
            <Text style={styles.buttonText}>FINALIZAR</Text>
          </TouchableOpacity>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  
  container: {
    flexGrow: 1,
    backgroundColor: '#23272A',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  image: {
    width: 300,
    height: 300,
    marginTop: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#9FC63B',
    marginTop: 20,
    marginBottom: 30,
    fontFamily: 'Asap Condensed',
    textAlign: 'left',
  },
  inputGroup: {
    width: '100%',
    marginBottom: 20,
  },
  input: {
    fontSize: 16,
    fontFamily: 'Rajdhani',
    color: '#868686',
    paddingVertical: 10,
  },
  inputLine: {
    height: 1,
    backgroundColor: '#868686',
    marginTop: 5,
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    marginBottom: 10,
  },
  button: {
    width: '60%',
    paddingVertical: 12,
    marginTop: 30,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#9FC63B',
    borderRadius: 8,
    backgroundColor: 'transparent',
  },
  buttonDisabled: {
    backgroundColor: '#A9A9A9',
    borderColor: '#9FC63B',
  },
  buttonText: {
    color: '#DFDFDF',
    fontSize: 18,
    fontWeight: '700',
    fontFamily: 'Asap Condensed',
  },
});

export default RegisterFirebaseScreen;




