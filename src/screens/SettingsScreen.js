import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { signOut } from 'firebase/auth';
import { auth } from '../firebaseConfig';

const SettingsScreen = ({ navigation }) => {
  const handleSignOut = async () => {
    try {
      await signOut(auth); // Cierra la sesión del usuario en Firebase
      Alert.alert('Sesión cerrada', 'Se ha cerrado la sesión correctamente.');
      navigation.replace('LoginFirebaseScreen'); // Redirige al login
    } catch (error) {
      console.error('Error al cerrar sesión:', error.message);
      Alert.alert('Error', 'No se pudo cerrar la sesión. Inténtelo de nuevo.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Ajustes</Text>

      <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
        <Text style={styles.signOutButtonText}>Cerrar Sesión</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#23272A',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#DFDFDF',
    marginBottom: 20,
  },
  signOutButton: {
    backgroundColor: '#9FC63B',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginTop: 20,
  },
  signOutButtonText: {
    color: '#23272A',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default SettingsScreen;

