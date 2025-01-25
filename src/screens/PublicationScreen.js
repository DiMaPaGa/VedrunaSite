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
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const API_URL = "http://192.168.1.168:8080/proyecto01/publicaciones";
const USER_API_URL = "http://192.168.1.168:8080/proyecto01/users/name";

const { width } = Dimensions.get("window");

const PublicationScreen = ({route}) => {

  const { userNick } = route.params || {};
  console.log('userNick en PublicationScreen: ', userNick);
  
  const [publicaciones, setPublicaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const scrollY = new Animated.Value(0);

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
            user_id: publicacion.user_id,
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

        {/* Título y descripción */}
        <Text style={styles.title}>{item.titulo}</Text>
        <Text style={styles.comment}>{item.comentario}</Text>
      </View>
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
            outputRange: [0, -120], // Desaparece al hacer scroll
            extrapolate: "clamp",
          }),
        },
      ],
    },
  ]}
>
  {/* Contenedor completo para alinear todo */}
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
    justifyContent: "center", // Centra el contenido verticalmente
  },
  headerContent: {
    flexDirection: "row", // Distribuye logo y textos en línea horizontal
    alignItems: "center", // Centra verticalmente los elementos
    justifyContent: "space-between", // Espacio entre logo y textos
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
    flex: 1, // Ocupa el resto del espacio
    alignItems: "left", // Centra el nick y el título horizontalmente
  },
  nick: {
    fontFamily: "Asap Condensed",
    fontSize: 13,
    color: "#FFFFFF",
    marginBottom: 2, // Espacio entre el nick y el título
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
    top: 0, // Ancla en la parte superior
    left: 0,
    right: 0, 
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: "transparent", // Fondo semitransparente para destacar el texto
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
    fontFamily: "Asap Condensed",
    fontSize: 15,
    color: "#DFDFDF",
  },
  user_id: {
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
