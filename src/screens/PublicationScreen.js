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
  Animated,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";


const API_URL = "http://192.168.1.168:8080/proyecto01/publicaciones";
const USER_API_URL = "http://192.168.1.168:8080/proyecto01/users/name";

const { width } = Dimensions.get("window");

const PublicationScreen = ({route}) => {

  const { userNick } = route.params || {};
  console.log('userNick en PublicationScreen: ', userNick);

  const navigation = useNavigation(); 
  
  const [publicaciones, setPublicaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [likes, setLikes] = useState({});
  const scrollY = new Animated.Value(0);

  const fetchPublicaciones = async () => {
    try {
      setLoading(true);
      const response = await fetch(API_URL);
      if (!response.ok) {
        throw new Error("Error al obtener las publicaciones");
      }
      const publicacionesData = await response.json();

      
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
            user_id: publicacion.user_id,
            like: publicacion.like || [],
            comentarios: publicacion.comentarios || [],
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

  const toggleLike = async (publicacionId) => {
    const userId = userNick; 
    const updatedPublicaciones = [...publicaciones];

    const pubIndex = updatedPublicaciones.findIndex((pub) => pub.id === publicacionId);
    const pub = updatedPublicaciones[pubIndex];

    if (pub.like.includes(userId)) {
      // El usuario ya ha dado "Me gusta", lo quitamos
      pub.like = pub.like.filter((like) => like !== userId);
    } else {
      // El usuario no ha dado "Me gusta", lo agregamos
      pub.like.push(userId);
    }

    // Actualizamos el estado de la publicación
    setLikes({
      ...likes,
      [publicacionId]: pub.like.length,
    });

    // Actualizamos la publicación en el backend
    await fetch(`http://192.168.1.168:8080/proyecto01/publicaciones/put/${publicacionId}/${userId}`, {
      method: 'PUT',
    });
  };

  const renderItem = ({ item }) => {
    const daysAgo = Math.floor(
      (new Date() - new Date(item.createdAt)) / (1000 * 60 * 60 * 24)
    );

    // Obtener el número de likes para cada publicación
    const likesCount = likes[item.id] || item.like.length;
    const commentsCount = item.comentarios ? item.comentarios.length : 0;

    return (
    
      <TouchableOpacity
      onPress={() =>
        navigation.navigate("SinglePublication", {
          publicacion: item,
          userNick,
        })
      }
    >
      <View style={styles.card}>
        {/* ...Header y otros componentes*/}
        <View style={styles.headerUserContainer}>
          <Image source={require("../../assets/iconUser.png")} style={styles.avatar} />
          <View style={styles.userTextContainer}>
            <Text style={styles.publishedBy}>Publicado por</Text>
            <Text style={styles.user_id}>{item.user_id}</Text>
            <Text style={styles.timeAgo}>Hace {daysAgo} días</Text>
          </View>
        </View>
        {/* Imagen principal */}
        <Image source={{ uri: item.image_url }} style={styles.image} />
    
        {/* Recuento de Me gusta */}
        <View style={styles.likesContainer}>
          <TouchableOpacity onPress={() => toggleLike(item.id)} style={styles.likeButton}>
            <Image
              source={item.like.includes(userNick) ? require("../../assets/Favorite.png") : require("../../assets/FavoriteBorder.png")}
              style={styles.likeIcon}
            />
          </TouchableOpacity>
          <Text style={styles.likesCount}>{likesCount} Me gusta</Text>
        </View>
    
        {/* Título y descripción */}
        <Text style={styles.title}>{item.titulo}</Text>
        <Text style={styles.comment}>{item.comentario}</Text>
    
        {/* Recuento de comentarios */}
        <Text style={styles.commentsCount}>{commentsCount} comentarios</Text>
      </View>
    </TouchableOpacity>
    
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Encabezado animado */}
      <Animated.View
  style={[
    styles.headerContainer,
    {
      transform: [
        {
          translateY: scrollY.interpolate({
            inputRange: [0, 100],
            outputRange: [0, -120],
            extrapolate: "clamp",
          }),
        },
      ],
    },
  ]}
>
  {/* Contenedor completo para alinear */}
  <View style={styles.headerContent}>
    
    <View style={styles.logoContainer}>
      <Image
        source={require("../../assets/ic_logo 1.png")}
        style={styles.logo}
      />
      
    </View>

    {/* Título centrado */}
    <View style={styles.textContainer}>
      <Text style={styles.nick}>{userNick}</Text>
      <Text style={styles.titleHeader}>VEDRUNA</Text>
    </View>
  </View>
</Animated.View>
  
      {/* Lista de publicaciones */}
      {loading ? (
        <ActivityIndicator size="large" color="#559687" />
      ) : (
        <Animated.FlatList
          data={publicaciones}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
          contentContainerStyle={styles.listContent}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: true }
          )}
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
    height: 120,
    backgroundColor: "#23272A",
    zIndex: 1,
    paddingHorizontal: 18,
    justifyContent: "center",
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 15,
  },
  logoContainer: {
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    width: 50,
    marginLeft: 25,
    marginVertical: 25,

  },
  logo: {
    marginTop: 30,
    width: 60,
    height: 60,
  },
  textContainer: {
    flex: 1,
    alignItems: "left",
  },
  nick: {
    fontFamily: "AsapCondensed-Regular",
    fontSize: 13,
    color: "#FFFFFF",
    marginBottom: 2,
    marginHorizontal: 25,
    marginTop: 30,
  },
  titleHeader: {
    fontFamily: "Signika Negative SC",
    fontSize: 40,
    fontWeight: "700",
    color: "#DFDFDF",
    textAlign: "left",
    marginHorizontal: 25,
  },
  listContent: {
    paddingTop: 118,
    paddingBottom: 20, 
  },
  card: {
    position: "relative", 
    width: width,
    height: 582,
    marginBottom: 10,
    backgroundColor: "#23272A",
    overflow: "hidden",
  },
  headerUserContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0, 
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: "transparent",
    zIndex: 1,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#9FC63B',
    marginRight: 10,
  },
  userTextContainer: {
    flex: 1,
  },
  publishedBy: {
    fontFamily: "AsapCondensed-Regular",
    fontSize: 15,
    color: "#DFDFDF",
  },
  user_id: {
    fontFamily: "AsapCondensed-Regular",
    fontSize: 20,
    fontWeight: "700",
    color: "#DFDFDF",
  },
  timeAgo: {
    fontFamily: "AsapCondensed-Regular",
    fontSize: 11,
    color: "#868686",
  },
  image: {
    width: "100%",
    height: "73.54%",
  },
  title: {
    fontFamily: "AsapCondensed-Regular",
    fontSize: 24,
    fontWeight: "700",
    color: "#9FC63B",
    marginHorizontal: 15,
    marginTop: 10,
    textTransform: "uppercase", 
  },
  likesContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
    marginLeft: 15, 
  },
  likeIcon: {
    width: 20,
    height: 20,
    marginRight: 5,
  },
  likesCount: {
    fontSize: 14,
    color: "gray",
  },
  comment: {
    fontSize: 14,
    textTransform: 'capitalize',
    marginVertical: 5,
    color: "gray",
    marginLeft: 15, 
  },
  commentsCount: {
    fontFamily: "AsapCondensed-Regular",
    fontSize: 11,
    color: "#868686",
    fontWeight: "normal",
    marginLeft: 15, 
  },
});

export default PublicationScreen;