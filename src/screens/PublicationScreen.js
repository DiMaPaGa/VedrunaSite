import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Image,
  ActivityIndicator,
  RefreshControl,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const API_URL = "http://192.168.1.168:8080/proyecto01/publicaciones";
const USER_API_URL = "http://192.168.1.168:8080/proyecto01/users/name";

const { width } = Dimensions.get("window");

const PublicationScreen = () => {
  const [publicaciones, setPublicaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchPublicaciones = async () => {
    try {
      setLoading(true);
      const response = await fetch(API_URL);
      if (!response.ok) {
        throw new Error("Error al obtener las publicaciones");
      }
      const publicacionesData = await response.json();

      // Obtener datos de los usuarios
      const publicacionesConUsuarios = await Promise.all(
        publicacionesData.map(async (publicacion) => {
          const userResponse = await fetch(`${USER_API_URL}?id=${publicacion.user_id}`);
          if (!userResponse.ok) {
            throw new Error("Error al obtener los datos del usuario");
          }
          const userData = await userResponse.json();
          const user = userData[0];
          return {
            ...publicacion,
            user_name: user.nombre,
            user_profile_picture: require("../../assets/iconUser.png")

          };
        })
      );

      setPublicaciones(publicacionesConUsuarios);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPublicaciones();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchPublicaciones();
    setRefreshing(false);
  };

  const renderItem = ({ item }) => {
    const daysAgo = Math.floor(
      (new Date() - new Date(item.createdAt)) / (1000 * 60 * 60 * 24)
    );

    return (
      <View style={styles.card}>
        {/* Header con información del usuario */}
        <View style={styles.headerUserContainer}>
          <Image source={{ uri: item.user_profile_picture }} style={styles.avatar} />
          <View style={styles.userTextContainer}>
            <Text style={styles.publishedBy}>Publicado por</Text>
            <Text style={styles.userName}>{item.user_name}</Text>
            <Text style={styles.timeAgo}>Hace {daysAgo} días</Text>
          </View>
        </View>

        {/* Imagen principal */}
        <Image source={{ uri: item.image_url }} style={styles.image} />

        {/* Título y descripción */}
        <Text style={styles.title}>{item.titulo}</Text>
        <Text style={styles.comment}>{item.comentario}</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Encabezado */}
      <View style={styles.headerContainer}>
        <Text style={styles.nick}>Nick del usuario</Text>
        <Text style={styles.titleHeader}>VEDRUNA</Text>
      </View>

      {/* Lista de publicaciones */}
      {loading ? (
        <ActivityIndicator size="large" color="#559687" />
      ) : (
        <FlatList
          data={publicaciones}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
          contentContainerStyle={styles.listContent}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#23272A",
  },
  headerContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    width: width,
    height: 118,
    backgroundColor: "transparent",
    zIndex: 1,
    alignItems: "center",
  },
  nick: {
    fontFamily: "Asap Condensed",
    fontSize: 13,
    color: "#FFFFFF",
    position: "absolute",
    top: "30%",
  },
  titleHeader: {
    fontFamily: "Signika Negative SC",
    fontSize: 55,
    fontWeight: "700",
    color: "#DFDFDF",
    textAlign: "center",
    position: "absolute",
    top: "50%",
  },
  listContent: {
    paddingTop: 118, 
  },
  card: {
    width: width,
    height: 582,
    marginBottom: 10,
    backgroundColor: "#23272A",
  },
  headerUserContainer: {
    height: 83,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  userTextContainer: {
    flex: 1,
  },
  publishedBy: {
    fontFamily: "Asap Condensed",
    fontSize: 15,
    color: "#DFDFDF",
  },
  userName: {
    fontFamily: "Asap Condensed",
    fontSize: 20,
    fontWeight: "700",
    color: "#DFDFDF",
  },
  timeAgo: {
    fontFamily: "Asap Condensed",
    fontSize: 11,
    color: "#868686",
  },
  image: {
    width: "100%",
    height: "73.54%",
  },
  title: {
    fontFamily: "Asap Condensed",
    fontSize: 24,
    fontWeight: "700",
    color: "#9FC63B",
    marginHorizontal: 15,
    marginTop: 10,
  },
  comment: {
    fontFamily: "Asap Condensed",
    fontSize: 13,
    color: "#FFFFFF",
    marginHorizontal: 15,
    marginTop: 5,
    textTransform: "capitalize",
  },
});

export default PublicationScreen;
