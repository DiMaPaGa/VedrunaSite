import React, { useState } from 'react';
import { View, TextInput, Text, TouchableOpacity, StyleSheet, Image, ScrollView } from 'react-native';

const RegisterFirebaseScreen = ({ navigation }) => {
  // Definimos los estados de los campos del formulario
  const [nick, setNick] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [secondLastName, setSecondLastName] = useState('');

  // Función para manejar el registro
  const handleRegister = () => {
    if (!nick || !firstName || !lastName || !secondLastName) {
      alert('Por favor, complete todos los campos.');
      return;
    }

    // Aquí iría la lógica de Firebase para registrar al usuario
    console.log('Register:', nick, firstName, lastName, secondLastName);
    
    // Después de registrar exitosamente, redirigimos a la pantalla de Login
    navigation.navigate('LoginFirebaseScreen'); // Redirigimos a Login después de un registro exitoso
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
    {/* Imagen al inicio */}
    <Image
      source={require('../../assets/formulario.png')}
      style={styles.image}
      resizeMode="contain"
    />

    {/* Título */}
    <Text style={styles.title}>Completar los siguientes campos:</Text>

    {/* Campos del formulario */}
    <View style={styles.inputGroup}>
      <TextInput
        style={styles.input}
        placeholder="Introduzca su nick"
        placeholderTextColor="#FFFFFF"
        value={nick}
        onChangeText={setNick}
      />
      <View style={styles.inputLine} />
    </View>

    <View style={styles.inputGroup}>
      <TextInput
        style={styles.input}
        placeholder="Introduzca su nombre"
        placeholderTextColor="#FFFFFF"
        value={firstName}
        onChangeText={setFirstName}
      />
      <View style={styles.inputLine} />
    </View>

    <View style={styles.inputGroup}>
      <TextInput
        style={styles.input}
        placeholder="Introduzca su primer apellido"
        placeholderTextColor="#FFFFFF"
        value={lastName}
        onChangeText={setLastName}
      />
      <View style={styles.inputLine} />
    </View>

    <View style={styles.inputGroup}>
      <TextInput
        style={styles.input}
        placeholder="Introduzca su segundo apellido"
        placeholderTextColor="#FFFFFF"
        value={secondLastName}
        onChangeText={setSecondLastName}
      />
      <View style={styles.inputLine} />
    </View>

    {/* Botón de registro */}
    <TouchableOpacity style={styles.registerButton} onPress={handleRegister}>
      <Text style={styles.registerButtonText}>FINALIZAR</Text>
    </TouchableOpacity>
  </ScrollView>
);
};

const styles = StyleSheet.create({
container: {
  flexGrow: 1,
  backgroundColor: '#23272A',
  alignItems: 'center',
  padding: 20,
},
image: {
  width: 300,
  height: 300,
  marginTop: 20,
},
title: {
  fontSize: 24,
  fontWeight: '700',
  color: '#9FC63B',
  marginTop: 20,
  marginBottom: 30,
  fontFamily: 'Asap Condensed',
  textAlign: 'center',
},
inputGroup: {
  width: '100%',
  marginBottom: 20,
},
input: {
  fontSize: 16,
  fontFamily: 'Rajdhani',
  color: '#FFFFFF',
  paddingVertical: 10,
},
inputLine: {
  height: 1,
  backgroundColor: '#FFFFFF',
  marginTop: 5,
},
registerButton: {
  width: '60%',
  paddingVertical: 12,
  marginTop: 30,
  alignItems: 'center',
  borderWidth: 2,
  borderColor: '#9FC63B',
  borderRadius: 8,
  backgroundColor: 'transparent',
},
registerButtonText: {
  color: '#DFDFDF',
  fontSize: 18,
  fontWeight: '700',
  fontFamily: 'Asap Condensed',
},
});

export default RegisterFirebaseScreen;
