import React, { useState } from 'react';
import { Text, TextInput, TouchableOpacity, Image, StyleSheet, Alert, ScrollView } from 'react-native';
import { useNavigation, useRoute } from "@react-navigation/native";
import { API_HOST } from '@env';

const TicketFormScreen = () => {
  const { userNick } = useRoute().params || {};
  const navigation = useNavigation();

  const [equipoClase, setEquipoClase] = useState('');
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleCreateTicket = async () => {
    if (!equipoClase || !titulo || !descripcion) {
      Alert.alert('Error', 'Por favor, completa todos los campos.');
      return;
    }

    setIsLoading(true);

    const ticketData = {
      userNick: userNick,
      equipoClase,
      titulo,
      descripcion,
    };

    try {
      const response = await fetch(`${API_HOST}/tickets/crear`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ticketData),
      });

      if (response.ok) {
        Alert.alert('Éxito', 'Incidencia creada con éxito.');
        setEquipoClase('');
        setTitulo('');
        setDescripcion('');
        navigation.goBack();
      } else {
        Alert.alert('Error', 'No se pudo crear la incidencia.');
      }
    } catch (error) {
      Alert.alert('Error', 'Ocurrió un error al crear la incidencia.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>INCIDENCIA</Text>
      <Image source={require('../../assets/addpub.png')} style={styles.imageIcon} />

      <Text style={styles.label}> Nª del Equipo / Clase:</Text>
      <TextInput
        style={styles.input}
        value={equipoClase}
        onChangeText={setEquipoClase}
      />

      <Text style={styles.label}>Título:</Text>
      <TextInput
        style={styles.input}
        placeholder="Máx. 40 Caracteres"
        placeholderTextColor="#DFDFDF"
        value={titulo}
        onChangeText={(text) => text.length <= 40 && setTitulo(text)}
      />

      <Text style={styles.label}>Descripción del problema:</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="Máx. 250 Caracteres"
        placeholderTextColor="#DFDFDF"
        value={descripcion}
        onChangeText={(text) => text.length <= 250 && setDescripcion(text)}
        multiline
      />

      <TouchableOpacity
        style={[styles.button, isLoading && styles.buttonDisabled]}
        onPress={handleCreateTicket}
        disabled={isLoading}
      >
        <Text style={styles.buttonText}>{isLoading ? 'Enviando...' : 'ENVIAR'}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#23272A',
    padding: 25,
    paddingTop: 50,
    alignItems: 'center',
  },
  header: {
    fontFamily: 'Rajdhani_600SemiBold',
    color: '#9FC63B',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  imageIcon: {
    width: 120,
    height: 120,
    marginBottom: "10%",
    marginTop: "8%",
  },
  label: {
    fontFamily: 'Rajdhani_400Regular',
    color: '#9FC63B',
    fontSize: 16,
    marginBottom: "3%",
    alignSelf: 'flex-start',
  },
  input: {
    backgroundColor: '#323639',
    color: '#FFFFFF',
    borderRadius: 5,
    padding: 10,
    marginBottom: "8%",
    width: '100%',
  },
  textArea: {
    height: 180,
    textAlignVertical: 'top', 
  },
  button: {
    backgroundColor: '#23272A',
    borderColor: '#9FC63B',
    borderWidth: 2,
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginVertical: "5%",
    width: '50%',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  buttonDisabled: {
    backgroundColor: '#323639',
  },
});

export default TicketFormScreen;

