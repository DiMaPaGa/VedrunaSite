import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, StyleSheet, Alert, ScrollView } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

const AddPublicationScreen = ({ route }) => {

  const { userNick } = route.params || {};
  console.log('userNick en PublicationScreen: ', userNick)

  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  

  // Seleccionar imagen desde la galería
  const handleImagePick = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  const uploadImageToCloudinary = async (imageUri) => {
    const formData = new FormData();
    formData.append('file', { uri: imageUri, name: 'image.jpg', type: 'image/jpeg' });
    formData.append('upload_preset', 'ml_default');
    formData.append('cloud_name', 'dpqj4thfg');

    try {
      const response = await fetch('https://api.cloudinary.com/v1_1/dpqj4thfg/image/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      console.log('Respuesta de Cloudinary:', data);
      return data.secure_url;
    } catch (error) {
      console.error('Error al subir la imagen:', error);
      throw new Error('Error al subir la imagen');
    }
  };

  const handleCreatePublication = async () => {
    if (!title || !comment) {
      Alert.alert('Error', 'Por favor, completa todos los campos.');
      return;
    }

    setIsLoading(true);

    try {
      let imageUrl = null;

      if (selectedImage) {
        imageUrl = await uploadImageToCloudinary(selectedImage);
        console.log('URL de la imagen:', imageUrl);
      }

      const publicationData = {
        user_id: userNick,
        titulo: title,
        comentario: comment,
        image_url: imageUrl,
      };

      const response = await fetch('http://192.168.1.168:8080/proyecto01/publicaciones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(publicationData),
      });

      if (response.ok) {
        Alert.alert('Éxito', 'Publicación creada con éxito.');
        setTitle('');
        setComment('');
        setSelectedImage(null);
      } else {
        Alert.alert('Error', 'No se pudo crear la publicación.');
      }
    } catch (error) {
      console.error('Error al crear la publicación:', error);
      Alert.alert('Error', 'Ocurrió un error al crear la publicación.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>PUBLICACIÓN</Text>
      <Image source={require('../../assets/addpub.png')} style={styles.imageIcon} />

      <Text style={styles.label}>Título</Text>
      <TextInput
        style={styles.input}
        placeholder="Máx. 40 Caracteres"
        placeholderTextColor="#DFDFDF"
        value={title}
        onChangeText={(text) => text.length <= 40 && setTitle(text)}
      />

      <Text style={styles.label}>Descripción</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="Máx. 250 Caracteres"
        placeholderTextColor="#DFDFDF"
        value={comment}
        onChangeText={(text) => text.length <= 250 && setComment(text)}
        multiline
      />

      <TouchableOpacity style={styles.button} onPress={handleImagePick}>
        <Text style={styles.buttonText}>IMAGEN</Text>
      </TouchableOpacity>

      {selectedImage && (
        <Image source={{ uri: selectedImage }} style={styles.imagePreview} />
      )}

      <TouchableOpacity
        style={[styles.button, isLoading && styles.buttonDisabled]}
        onPress={handleCreatePublication}
        disabled={isLoading}
      >
        <Text style={styles.buttonText}>{isLoading ? 'Creando...' : 'PUBLICAR'}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#23272A',
    padding: 20,
    alignItems: 'center', // Centra el contenido horizontalmente
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
    width: 120, // Más compacto
    height: 120, // Más compacto
    marginBottom: 20,
  },
  label: {
    fontFamily: 'Rajdhani_400Regular',
    color: '#9FC63B',
    fontSize: 16,
    marginBottom: 5,
  },
  input: {
    backgroundColor: '#333',
    color: '#FFFFFF',
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
    width: '100%', // Ocupa todo el ancho disponible
  },
  textArea: {
    height: 80, // Más compacto
  },
  button: {
    backgroundColor: '#23272A',
    borderColor: '#9FC63B',
    borderWidth: 2,
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginVertical: 10,
    width: '50%',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  buttonDisabled: {
    backgroundColor: '#555',
  },
  imagePreview: {
    width: '100%',
    height: 150, // Más compacto
    marginVertical: 10,
    borderRadius: 5,
  },
});

export default AddPublicationScreen;
