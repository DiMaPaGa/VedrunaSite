import React, { useState } from 'react';
import { View, Text, TextInput, Button, Image, StyleSheet, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

const AddPublicationScreen = () => {
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const userId = '123456'; // Reemplaza con el UID del usuario autenticado

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

  // Crear publicación
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
        user_id: userId,
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
    <View style={styles.container}>
      <Text style={styles.label}>Título</Text>
      <TextInput
        style={styles.input}
        placeholder="Título de la publicación"
        value={title}
        onChangeText={setTitle}
      />
      <Text style={styles.label}>Comentario</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="Escribe tu comentario"
        value={comment}
        onChangeText={setComment}
        multiline
      />
      <Button title="Seleccionar Imagen" onPress={handleImagePick} />
      {selectedImage && (
        <Image source={{ uri: selectedImage }} style={styles.imagePreview} />
      )}
      <Button
        title={isLoading ? 'Creando...' : 'Crear Publicación'}
        onPress={handleCreatePublication}
        disabled={isLoading}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
  },
  textArea: {
    height: 100,
  },
  imagePreview: {
    width: '100%',
    height: 200,
    marginVertical: 10,
  },
});

export default AddPublicationScreen;


