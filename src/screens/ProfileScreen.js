import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, FlatList, Alert  } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { auth } from '../firebaseConfig';
import { signOut ,onAuthStateChanged } from "firebase/auth";
import * as ImagePicker from 'expo-image-picker';
import { API_HOST } from '@env';

const ProfileScreen = ({ route }) => {
  const { UserId } = route.params;
  const [viewLikes, setViewLikes] = useState(false);
  const [posts, setPosts] = useState([]);
  const [likedPosts, setLikedPosts] = useState([]);
  const [profileImage, setProfileImage] = useState(null);
  const [email, setEmail] = useState('Cargando...');
  const [nick, setNick] = useState('Cargando...');
  const [showLogout, setShowLogout] = useState(false);
  
  const navigation = useNavigation();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setEmail(user ? user.email : 'Correo no disponible');
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = () => {
    signOut(auth)
      .then(() => {
        navigation.replace('LoginFirebaseScreen');
      })
      .catch((error) => {
        Alert.alert(error, 'No se pudo cerrar sesión.');
      });
  };

  const fetchUserData = useCallback(async () => {
    try {
      const userResponse = await fetch(`${API_HOST}/proyecto01/users/${UserId}`);
      const userData = await userResponse.json();

      if (!userData || !userData.nick) {
        setNick("Desconocido");
        return;
      }
      
      setNick(userData.nick);
      setProfileImage(userData.profile_picture || null);
  
      const postsResponse = await fetch(`${API_HOST}/proyecto01/publicaciones/user/${userData.nick}`);
      const postsData = await postsResponse.json();
      
      if (Array.isArray(postsData)) {
        setPosts(postsData.reverse());
      }
  
      
      const likedPostsResponse = await fetch(`${API_HOST}/proyecto01/publicaciones/liked/${userData.nick}`);
      const likedPostsData = await likedPostsResponse.json();
  
      if (Array.isArray(likedPostsData)) {
        setLikedPosts(likedPostsData.reverse());
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudieron cargar los datos.');
    }
  }, [UserId]);

  useEffect(() => {
    const focusListener = navigation.addListener('focus', fetchUserData);
    return focusListener;
  }, [navigation, fetchUserData]);

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  useEffect(() => {
    const getPermissions = async () => {
      await ImagePicker.requestCameraPermissionsAsync();
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    };
    getPermissions();
  }, []);

  const handleImagePick = async () => {
    Alert.alert(
      'Selecciona una opción',
      '¿Deseas elegir una imagen de la galería o tomar una nueva foto?',
      [
        {
          text: 'Galería',
          onPress: async () => {
            const result = await ImagePicker.launchImageLibraryAsync({
              mediaTypes: ImagePicker.MediaTypeOptions.Images,
              allowsEditing: true,
              quality: 1,
            });
            if (!result.canceled) {
              setProfileImage(result.assets[0].uri);
              await uploadImageToCloudinary(result.assets[0].uri);
            }
          },
        },
        {
          text: 'Cámara',
          onPress: async () => {
            const result = await ImagePicker.launchCameraAsync({
              allowsEditing: true,
              quality: 1,
            });
            if (!result.canceled) {
              setProfileImage(result.assets[0].uri);
              await uploadImageToCloudinary(result.assets[0].uri);
            }
          },
        },
        {
          text: 'Cancelar',
          style: 'cancel',
        },
      ],
      { cancelable: true }
    );
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
      const imageUrl = data.secure_url;


      await updateProfileImage(imageUrl);
    } catch (error) {
    }
  };


  const updateProfileImage = async (imageUrl) => {
    try {
      const response = await fetch(`${API_HOST}/proyecto01/users/${UserId}`, {
        method: 'PUT', 
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ profile_picture: imageUrl }),
      });

      if (response.ok) {
        setProfileImage(imageUrl);
      } else {
        Alert.alert('Error', 'No se pudo actualizar la imagen del perfil.');
      }
    } catch (error) {
      Alert.alert('Error', 'Ocurrió un error al actualizar la imagen.');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
      <TouchableOpacity onPress={handleImagePick}>
        <Image
          source={profileImage ? { uri: profileImage } : require('../../assets/iconUser.png')}
          style={styles.profileImage}
        />
      </TouchableOpacity>
        <View style={styles.stats}>
          <Text style={styles.statNumber}>{posts.length}</Text>
          <Text style={styles.statLabel}>Publicaciones</Text>
        </View>
        <View style={styles.stats}>
          <Text style={styles.statNumber}>200</Text>
          <Text style={styles.statLabel}>Seguidores</Text>
        </View>
        <View style={styles.stats}>
          <Text style={styles.statNumber}>150</Text>
          <Text style={styles.statLabel}>Siguiendo</Text>
        </View>
      </View>

      <TouchableOpacity onPress={() => setShowLogout(!showLogout)}>
        <Text style={styles.username}>{nick}</Text>
      </TouchableOpacity>
      {showLogout && (
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Cerrar sesión</Text>
        </TouchableOpacity>
      )}
      <Text style={styles.email}>{email}</Text>

      <View style={styles.filterButtons}>
        <TouchableOpacity onPress={() => setViewLikes(false)}>
          <Image source={require('../../assets/ViewPub.png')} style={[styles.icon, !viewLikes && styles.activeIcon]} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setViewLikes(true)}>
          <Image source={require('../../assets/PubGustan.png')} style={[styles.icon, viewLikes && styles.activeIcon]} />
        </TouchableOpacity>
      </View>

      {/* Aseguramos que FlatList ocupe el espacio disponible para permitir el desplazamiento */}
      <FlatList
        data={viewLikes ? likedPosts : posts}
        numColumns={3}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => navigation.navigate('SinglePublication', { publicacion: item, userNick: nick })}>
            <Image source={{ uri: item.image_url }} style={styles.postImage} />
          </TouchableOpacity>
        )}
        contentContainerStyle={styles.flatListContentContainer}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#323639', 
    padding: 10 
  },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-around', 
    paddingVertical: 20 
  },
  profileImage: { 
    width: 80,
    height: 80,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: '#9FC63B' 
  },
  stats: { 
    alignItems: 'center' 
  },
  statNumber: { 
    fontSize: 18, 
    fontWeight: 'bold', 
    color: '#DFDFDF'
  },
  statLabel: { 
    fontSize: 12, 
    color: '#868686' 
  },
  username: { 
    textAlign: 'left',
    paddingHorizontal: "5%", 
    fontSize: 20, 
    fontWeight: 'bold', 
    color: '#9FC63B' 
  },
  email: { 
    textAlign: 'left',
    paddingHorizontal: "5%", 
    fontSize: 14, 
    color: '#868686',
    textDecorationLine: 'underline',
     
  },
  filterButtons: { 
    flexDirection: 'row', 
    justifyContent: 'center', 
    marginVertical: 10 
  },
  icon: { 
    width: 30, 
    height: 30, 
    marginHorizontal: 20 
  },
  postImage: { 
    width: 120, 
    height: 120, 
    margin: 2,
    borderWidth: 1,
    borderColor: '#DFDFDF' 
  },
  activeIcon: { 
    tintColor: '#9FC63B' 
  },
  flatListContentContainer: {
    paddingBottom: "15%",
  },
  logoutButton: { 
    backgroundColor: '#ff4d4d', 
    padding: 10, 
    borderRadius: 5, 
    marginTop: 10, 
    alignSelf: 'center' 
  },
  logoutText: { 
    color: '#DFDFDF', 
    fontSize: 16, 
    fontWeight: 'bold' 
  }
});

export default ProfileScreen;








