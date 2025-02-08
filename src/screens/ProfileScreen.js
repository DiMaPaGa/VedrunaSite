import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, FlatList, Alert  } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { auth } from '../firebaseConfig';
import { signOut ,onAuthStateChanged } from "firebase/auth";
import * as ImagePicker from 'expo-image-picker';

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

  console.log("📌 route.params en ProfileScreen:", route.params);
  console.log("✅ Recibido en ProfileScreen -> userNick:", route.params?.userNick);
  console.log("✅ Recibido en ProfileScreen -> UserId:", route.params?.UserId);

  if (!route.params?.UserId) {
    console.error("🚨 ERROR: No se recibió UserId en ProfileScreen.");
  }

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
        console.error('Error al cerrar sesión:', error);
        Alert.alert('Error', 'No se pudo cerrar sesión.');
      });
  };

  const fetchUserData = async () => {
    try {
      if (!UserId) {
        console.error("🚨 ERROR: UserId no recibido en ProfileScreen.");
        return;
      }
  
      console.log(`🔍 Fetching user data from: http://192.168.1.168:8080/proyecto01/users/${UserId}`);
      
      const userResponse = await fetch(`http://192.168.1.168:8080/proyecto01/users/${UserId}`);
      if (!userResponse.ok) throw new Error(`⚠️ Error HTTP ${userResponse.status}`);
      
      const userData = await userResponse.json();
      console.log("✅ Usuario obtenido:", userData);
      
      if (!userData || !userData.nick) {
        console.error("❌ No se encontró el nick del usuario.");
        setNick("Desconocido");
        return;
      }
      
      setNick(userData.nick);
      setProfileImage(userData.profile_picture || null);
  
      console.log(`🔍 Fetching posts for nick: ${userData.nick}`);
      
      const postsResponse = await fetch(`http://192.168.1.168:8080/proyecto01/publicaciones/user/${userData.nick}`);
      if (!postsResponse.ok) throw new Error(`⚠️ Error HTTP ${postsResponse.status}`);
      
      const postsData = await postsResponse.json();
      console.log("✅ Publicaciones obtenidas:", postsData);
      
      if (Array.isArray(postsData)) {
        const reversedPosts = postsData.reverse();
        setPosts(reversedPosts);
  
        // 💡 Asegurar que el filtro de "me gusta" no falle si `like` es undefined
        const liked = reversedPosts.filter(post => Array.isArray(post.like) && post.like.includes(userData.nick));
        setLikedPosts(liked);
      } else {
        console.error("❌ La respuesta de publicaciones no es un array:", postsData);
      }
      
    } catch (error) {
      console.error("🚨 Error en fetchUserData:", error);
    }
  };

  // Usamos el addListener para recargar las publicaciones cuando el usuario regrese a la pantalla de perfil
  useEffect(() => {
    const focusListener = navigation.addListener('focus', () => {
      // Se ejecuta cada vez que la pantalla se enfoca (cuando regresas a ella)
      fetchUserData(); // Recargar publicaciones
    });

    // Limpiar el listener cuando se desmonte el componente
    return () => focusListener();
  }, [navigation]);

  useEffect(() => {
    if (!UserId) {
      console.error("🚨 ERROR: UserId no recibido en ProfileScreen.");
      return;
    }
    
    fetchUserData();
  }, [UserId]);

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

  // Subir imagen a Cloudinary
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
      console.log('Imagen subida:', imageUrl);

      // Actualizamos el perfil del usuario en la base de datos
      await updateProfileImage(imageUrl);
    } catch (error) {
      console.error('Error al subir la imagen:', error);
    }
  };

  // Actualizar imagen de perfil en la base de datos
  const updateProfileImage = async (imageUrl) => {
    try {
      const response = await fetch(`http://192.168.1.168:8080/proyecto01/users/${UserId}`, {
        method: 'PUT', // Usamos PUT para actualizar el usuario
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ profile_picture: imageUrl }),
      });

      if (response.ok) {
        console.log('Imagen de perfil actualizada');
        setProfileImage(imageUrl); // Actualizamos la imagen localmente
      } else {
        Alert.alert('Error', 'No se pudo actualizar la imagen del perfil.');
      }
    } catch (error) {
      console.error('Error al actualizar imagen:', error);
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
          <Image source={require('../../assets/addgris.png')} style={[styles.icon, !viewLikes && styles.activeIcon]} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setViewLikes(true)}>
          <Image source={require('../../assets/Favorite.png')} style={[styles.icon, viewLikes && styles.activeIcon]} />
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
        contentContainerStyle={styles.flatListContentContainer} // Agregar un estilo para el contenido de FlatList
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#323639', padding: 10 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', paddingVertical: 20 },
  profileImage: { width: 80, height: 80, borderRadius: 50 },
  stats: { alignItems: 'center' },
  statNumber: { fontSize: 18, fontWeight: 'bold', color: '#FFF' },
  statLabel: { fontSize: 12, color: '#868686' },
  username: { textAlign: 'center', fontSize: 20, fontWeight: 'bold', color: '#FFF' },
  email: { textAlign: 'center', fontSize: 14, color: '#868686' },
  filterButtons: { flexDirection: 'row', justifyContent: 'center', marginVertical: 10 },
  icon: { width: 30, height: 30, marginHorizontal: 20 },
  postImage: { width: 120, height: 120, margin: 2 },
  activeIcon: { tintColor: '#000' },
  flatListContentContainer: {
    paddingBottom: "15%", // Aumentamos el padding en la parte inferior para dar espacio a la barra de navegación
  },
  logoutButton: { backgroundColor: '#ff4d4d', padding: 10, borderRadius: 5, marginTop: 10, alignSelf: 'center' },
  logoutText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});

export default ProfileScreen;








