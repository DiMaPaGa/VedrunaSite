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
  Button,
} from "react-native";
import { useNavigation } from "@react-navigation/native";

const COMMENT_API_URL = "http://192.168.1.168:8080/proyecto01/comentarios/put";
const POST_LIKE_API_URL = "http://192.168.1.168:8080/proyecto01/publicaciones/put";

const SinglePublicationScreen = ({ route }) => {
  const navigation = useNavigation();
  const { publicacion, userNick } = route.params;
  
  const [comentarios, setComentarios] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [likes, setLikes] = useState(publicacion.like.length); // Contador de likes
  const [userLiked, setUserLiked] = useState(publicacion.like.includes(userNick)); 
  const [nuevoComentario, setNuevoComentario] = useState("");
  const [isActiveCancelar, setIsActiveCancelar] = useState(false); // Estado para el botón Cancelar
  const [isActivePublicar, setIsActivePublicar] = useState(false); // Estado para el botón Publicar

  useEffect(() => {
    fetchComentarios();
  }, []);

  const fetchComentarios = async () => {
    try {
      const response = await fetch(`http://192.168.1.168:8080/proyecto01/comentarios/${publicacion.id}`);
      if (!response.ok) {
        throw new Error("Error al obtener los comentarios");
      }
      const data = await response.json();
      setComentarios(data);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleAgregarComentario = async () => {
    if (nuevoComentario.trim().length === 0) return;

    try {
      const response = await fetch(COMMENT_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idPublicacion: publicacion.id,
          user_id: userNick,
          comentario: nuevoComentario,
        }),
      });

      if (!response.ok) {
        throw new Error("Error al publicar el comentario");
      }

      setNuevoComentario("");
      setModalVisible(false);
      fetchComentarios(); // Actualizar los comentarios
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const toggleLike = async () => {
    try {
      const response = await fetch(
        `http://192.168.1.168:8080/proyecto01/publicaciones/put/${publicacion.id}/${userNick}`, 
        { method: "PUT" }
      );
  
      if (!response.ok) {
        throw new Error("Error al actualizar el 'Me gusta'");
      }
  
      // Actualizar estado local después de la respuesta del servidor
      setUserLiked(!userLiked);
      setLikes(userLiked ? likes - 1 : likes + 1);
    } catch (error) {
      console.error("Error en toggleLike:", error);
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.commentItem}>
      <Image source={require("../../assets/iconUser.png")} style={styles.avatar} />
      <View style={styles.commentText}>
        <Text style={styles.commentUser}>{item.user_id}</Text>
        <Text style={styles.commentContent}>{item.comentario}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Botón para regresar */}
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
        <Image source={require("../../assets/return.png")} style={styles.backIcon} />
      </TouchableOpacity>

      {/* Contenido desplazable */}
      <FlatList
        ListHeaderComponent={
          <>
            {/* Información de la publicación */}
            <View style={styles.headerUserContainer}>
              <Image source={require("../../assets/iconUser.png")} style={styles.avatar} />
              <View style={styles.userTextContainer}>
                <Text style={styles.publishedBy}>Publicado por</Text>
                <Text style={styles.user_id}>{publicacion.user_id}</Text>
              </View>
            </View>

            <View style={styles.publicationContent}>
              <Image source={{ uri: publicacion.image_url }} style={styles.publicationImage} />

              {/* Sección de "Me gusta" */}
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

              {/* Título y descripción */}
              <View style={styles.publicationText}>
                <Text style={styles.title}>{publicacion.titulo}</Text>
                <Text style={styles.description}>{publicacion.comentario}</Text>
              </View>
              <Text style={styles.timeAgo}>
                Hace {Math.floor((new Date() - new Date(publicacion.createdAt)) / (1000 * 60 * 60 * 24))} días
              </Text>
            </View>

            {/* Título de los comentarios */}
            <Text style={styles.commentsTitle}>COMENTARIOS</Text>
          </>
        }
        data={comentarios}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        ListEmptyComponent={<Text style={styles.noComments}>No hay comentarios</Text>}
        contentContainerStyle={{ paddingBottom: 100 }} // Asegura que el contenido no se oculte por el botón
      />

      {/* Botón para agregar comentario */}
      <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.addCommentButton}>
        <Image source={require("../../assets/anadirMensaje.png")} style={styles.addCommentIcon} />
      </TouchableOpacity>

      {/* Modal para agregar comentario */}
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
              onPressIn={() => setIsActiveCancelar(true)} // Cuando el usuario toca el botón
              onPressOut={() => setIsActiveCancelar(false)} // Cuando el usuario deja de tocar
              onPress={() => setModalVisible(false)} // Acción al presionar el botón
              style={[styles.button, isActiveCancelar && styles.buttonActive]} // Cambiar el estilo si está activo
            >
              <Text style={styles.buttonText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPressIn={() => setIsActivePublicar(true)} // Cuando el usuario toca el botón
              onPressOut={() => setIsActivePublicar(false)} // Cuando el usuario deja de tocar
              onPress={handleAgregarComentario} // Acción al presionar el botón
              style={[styles.button, isActivePublicar && styles.buttonActive]} // Cambiar el estilo si está activo
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
    padding: 10 
  },
  backButton: { 
    position: "absolute", 
    top: 40, 
    left: 20, 
    zIndex: 10 
  },
  backIcon: { 
    width: 20, 
    height: 30, 
    color: "#9FC63B" 
  },
  headerUserContainer: {
    flexDirection: "row",
    marginBottom: 20,
    paddingVertical: 20,
    paddingHorizontal: "20%",
    alignItems: "center",
  },
  avatar: { 
    width: 50, 
    height: 50, 
    borderRadius: 100,
    borderWidth: 3, 
    borderColor: "#9FC63B",
    marginRight: 20 
  },
  userTextContainer: { 
    flex: 1 
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
  },
  publicationImage: { 
    width: "100%", 
    height: 300,
    resizeMode: "cover"
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
    fontFamily: "AsapCondensed-Regular"
  },
  commentItem: { 
    flexDirection: "row", 
    marginBottom: 30, 
    alignItems: "center" 
  },
  commentText: { 
    flex: 1 ,
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
    bottom: 20,
    right: 20,
    backgroundColor: "#9FC63B",
    borderRadius: 100,
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
    backgroundColor: "#23272A", // Fondo oscuro del modal
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#9FC63B", // Borde verde
    padding: 20,
    justifyContent: "space-between", 
  },

  modalTitle: { 
    fontSize: 18, 
    color: "#9FC63B", 
    fontFamily: "Rajdhani", // Fuente de Figma para el título
    marginTop: "10%",
  },

  input: { 
    height: "50%", 
    borderColor: "#868686", 
    borderRadius: 10, 
    padding: 10, 
    color: "#DFDFDF", // Color de texto
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
    backgroundColor: "#23272A", // Fondo del botón
    borderColor: "#23272A",
    borderWidth: 2, 
    padding: 10, 
    borderRadius: 5,
    alignItems: 'center', 
    marginVertical: 10,
    width: '45%', // Ajuste del tamaño
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
    color: "#DFDFDF", // Color de texto en los botones
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
