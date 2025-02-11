import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Dimensions } from "react-native";
import { API_HOST } from '@env';


const screenWidth = Dimensions.get("window").width;

const API_BASE_URL = `${API_HOST}/proyecto01`;

const SinglePublicationScreen = ({ route }) => {
  const navigation = useNavigation();
  const { publicacion, userNick } = route.params;

  const [comentarios, setComentarios] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [likes, setLikes] = useState(publicacion.like.length);
  const [userLiked, setUserLiked] = useState(publicacion.like.includes(userNick));
  const [nuevoComentario, setNuevoComentario] = useState("");
  const [isActiveCancelar, setIsActiveCancelar] = useState(false);
  const [isActivePublicar, setIsActivePublicar] = useState(false);
  const [userProfilePic, setUserProfilePic] = useState("");

  useEffect(() => {
    fetchComentarios();
    fetchUserProfilePic(publicacion.user_id);
  }, []);

  useEffect(() => {
    // Activar o desactivar el botón de publicar según el comentario
    if (nuevoComentario.trim()) {
      setIsActivePublicar(true);
    } else {
      setIsActivePublicar(false);
    }
  }, [nuevoComentario]);

  const fetchComentarios = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/comentarios/${publicacion.id}`);
      if (!response.ok) throw new Error("Error al obtener los comentarios");
      const data = await response.json();
      setComentarios(data);
    } catch (error) {
      
    }
  };

  const fetchUserProfilePic = async (nick) => {
    try {
        // Obtener el user_id desde el nick
        const userResponse = await fetch(`${API_HOST}/proyecto01/users/nick/${nick}`);
        if (!userResponse.ok) throw new Error("Error al obtener el user_id");

        const userData = await userResponse.json();
        const userId = userData.user_id;

        // Obtener la foto de perfil usando el user_id
        const profileUrl = `${API_HOST}/proyecto01/users/${userId}`;

        const profileResponse = await fetch(profileUrl);
        if (!profileResponse.ok) throw new Error("Error al obtener la foto de perfil");

        const profileData = await profileResponse.json();

        if (profileData.profile_picture) {
          setUserProfilePic({ uri: profileData.profile_picture });
      } else {
          setUserProfilePic(require("../../assets/iconUser.png"));
      }

  } catch (error) {
      setUserProfilePic(require("../../assets/iconUser.png"));
  }
};


  const handleAgregarComentario = async () => {
    if (!nuevoComentario.trim()) return;

    try {
      const response = await fetch(`${API_BASE_URL}/comentarios/put`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idPublicacion: publicacion.id,
          user_id: userNick,
          comentario: nuevoComentario,
        }),
      });

      if (!response.ok) throw new Error("Error al publicar el comentario");

      setNuevoComentario("");
      setModalVisible(false);
      fetchComentarios();
    } catch (error) {
      
    }
  };
  

  const toggleLike = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/publicaciones/put/${publicacion.id}/${userNick}`, {
        method: "PUT",
      });

      if (!response.ok) throw new Error("Error al actualizar el 'Me gusta'");

      setUserLiked(!userLiked);
      setLikes((prevLikes) => (userLiked ? prevLikes - 1 : prevLikes + 1));
    } catch (error) {
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.commentItem}>
      <Image source={userProfilePic} style={styles.commentAvatar} />
      <View style={styles.commentText}>
        <Text style={styles.commentUser}>{item.user_id}</Text>
        <Text style={styles.commentContent}>{item.comentario}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
        <Image source={require("../../assets/return.png")} style={styles.backIcon} />
      </TouchableOpacity>

      <FlatList
        ListHeaderComponent={
          <>
            <View style={styles.headerUserContainer}>
              <Image source={userProfilePic} style={styles.avatar} />
              <View style={styles.userTextContainer}>
                <Text style={styles.publishedBy}>Publicado por</Text>
                <Text style={styles.user_id}>{publicacion.user_id}</Text>
              </View>
            </View>

            <View style={styles.publicationContent}>
              <View style={{ width: screenWidth, backgroundColor: "#9FC63B" , overflow: "hidden" }}>
                <Image source={{ uri: publicacion.image_url }} style={styles.publicationImage} />
              </View>
              <View style={styles.likesContainer}>
                <TouchableOpacity onPress={toggleLike}>
                  <Image
                    source={
                      userLiked
                        ? require("../../assets/Favorite.png")
                        : require("../../assets/FavoriteBorder.png")
                    }
                    style={styles.likeIcon}
                  />
                </TouchableOpacity>
                <Text style={styles.likesText}>{likes} Me gusta</Text>
              </View>

              <View style={styles.publicationText}>
                <Text style={styles.title}>{publicacion.titulo}</Text>
                <Text style={styles.description}>{publicacion.comentario}</Text>
              </View>
              <Text style={styles.timeAgo}>
                Hace {Math.floor((new Date() - new Date(publicacion.createdAt)) / (1000 * 60 * 60 * 24))} días
              </Text>
            </View>

            <Text style={styles.commentsTitle}>COMENTARIOS</Text>
          </>
        }
        data={comentarios}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        ListEmptyComponent={<Text style={styles.noComments}>No hay comentarios</Text>}
        contentContainerStyle={{ paddingBottom: 100, paddingHorizontal: 0 }}
      />

      <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.addCommentButton}>
        <Image source={require("../../assets/anadirMensaje.png")} style={styles.addCommentIcon} />
      </TouchableOpacity>

      <Modal visible={modalVisible} transparent={true} animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Comentarios:</Text>
            <TextInput
              style={styles.input}
              placeholder="Max 500 caracteres"
              maxLength={500}
              multiline
              value={nuevoComentario}
              onChangeText={setNuevoComentario}
              placeholderTextColor="#DFDFDF"
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={[styles.button, isActiveCancelar && styles.buttonActive]}
              >
                <Text style={styles.buttonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleAgregarComentario}
                style={[styles.button, isActivePublicar && styles.buttonActive]}
              >
                <Text style={styles.buttonText}>Publicar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#323639", 
  },
  backButton: { 
    position: "absolute", 
    top: 60, 
    left: 20, 
    zIndex: 10 
  },
  backIcon: { 
    width: 20, 
    height: 30, 
    color: "#9FC63B",
    marginTop: "90%", 
  },
  headerUserContainer: {
    flexDirection: "row",
    marginBottom: 0,
    paddingVertical: 0,
    paddingHorizontal: "20%",
    alignItems: "center",
  },
  avatar: { 
    width: 50, 
    height: 50, 
    borderRadius: 100,
    borderWidth: 3, 
    borderColor: "#9FC63B",
    marginRight: 20,
    marginTop: "30%",
    marginBottom: "5%",
  },
  userTextContainer: { 
    flex: 1,
    marginTop: "30%",
    marginBottom: "7%",
    paddingBottom: 0,
    
  },
  publishedBy: { 
    fontSize: 14, 
    color: "#DFDFDF", 
    fontFamily: "AsapCondensed-Regular"
  },
  user_id: { 
    fontSize: 16, 
    color: "#DFDFDF",
    fontFamily: "AsapCondensed-Bold",
    textTransform: "capitalize" 
  },
  timeAgo: { 
    fontSize: 12, 
    color: "#868686",
    fontFamily: "AsapCondensed-Regular",
    marginLeft: 15,
    marginTop: 10, 
  },
  publicationContent: { 
    marginBottom: 30,
    width: "100%",
    padding: 0,
    margin: 0,

  },
  publicationImage: {
    flex: 1, 
    width: screenWidth, 
    height: 400,
    resizeMode: "cover",
    alignSelf: "stretch",
    borderBottomWidth: 2,
    borderBottomColor: "#9FC63B",
    marginBottom: 3,
  },
  publicationText: { 
    marginTop: 20, 
  },
  title: { 
    fontSize: 24, 
    fontFamily: "AsapCondensed-Bold",
    textTransform: "uppercase", 
    marginHorizontal: 15,
    marginTop: 10,
    color: "#9FC63B"
   },
  description: { 
    fontSize: 16, 
    textTransform: 'capitalize',
    marginVertical: 5,
    color: "#DFDFDF",
    marginLeft: 15, 
  },
  commentsTitle: { 
    fontSize: 20,
    fontFamily: "AsapCondensed-Bold", 
    color: "#9FC63B", 
    marginTop: 10,
    marginHorizontal: 15
  },
  noComments: {
    color: "#868686", 
    fontFamily: "AsapCondensed-Regular",
    marginHorizontal: 15,
    marginTop: 10,
  },
  commentItem: { 
    flexDirection: "row", 
    marginBottom: 20, 
    alignItems: "center",
    paddingHorizontal: 15, 
  },
  commentText: { 
    flex: 1,
    paddingTop: 5, 
  },
  commentUser: { 
    color: "#DFDFDF", 
    fontFamily: "AsapCondensed-Light"
  },
  commentContent: { 
    color: "#868686" 
  },
  addCommentButton: {
    position: "absolute",
    bottom: 80,
    right: 20,
    backgroundColor: "#9FC63B",
    borderRadius: 100,
  },
  commentAvatar: { 
    width: 40, 
    height: 40,
    borderRadius: 100,
    borderWidth: 2,
    borderColor: "#9FC63B",  
    marginRight: 15,  
    marginTop: 5,  
  },

  addCommentIcon: { 
    width: 55, 
    height: 55, 
   },
  modalContainer: { 
    flex: 1, 
    justifyContent: "center", 
    alignItems: "center", 
    backgroundColor: "transparent" },

  modalContent: { 
    position: "absolute",
    width: "90%",
    height: "60%",
    left: "5%",
    right: "5%",
    top: "20%",
    backgroundColor: "#23272A", 
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#9FC63B", 
    padding: 20,
    justifyContent: "space-between", 
  },

  modalTitle: { 
    fontSize: 18, 
    color: "#9FC63B", 
    fontFamily: "Rajdhani", 
    marginTop: "10%",
  },

  input: { 
    height: "50%", 
    borderColor: "#868686", 
    borderRadius: 10, 
    padding: 10, 
    color: "#DFDFDF", 
    fontSize: 16,
    textAlignVertical: "top", 
    backgroundColor: "#323639",
  },

  modalButtons: { 
    flexDirection: "row", 
    justifyContent: "space-around", 
    marginTop: 22 
  },

  button: {
    backgroundColor: "#23272A", 
    borderColor: "#23272A",
    borderWidth: 2, 
    padding: 10, 
    borderRadius: 5,
    alignItems: 'center', 
    marginVertical: 10,
    width: '45%', 
    alignSelf: "center",
  },

  buttonActive: {
    backgroundColor: "#23272A",
    borderColor: "#9FC63B",
    borderWidth: 2,
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginVertical: 10,
    width: '45%',
    alignSelf: "center",
  },

  buttonText: {
    fontSize: 16, 
    color: "#DFDFDF", 
    fontFamily: "AsapCondensed-Bold",
    textTransform: "uppercase", 
  },

  likesContainer: {
    flexDirection: "row", 
    alignItems: "center", 
    marginLeft: 15, 
    marginTop: 10 },

  likeIcon: { 
    width: 20, 
    height: 20, 
    marginRight: 5 },
    
  likesText: { 
    fontSize: 14,
    color: "#DFDFDF" 
  },
});

export default SinglePublicationScreen;
