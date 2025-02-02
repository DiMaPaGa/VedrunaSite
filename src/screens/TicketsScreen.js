import React, { useState, useEffect } from "react";
import { View, Text, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity, Image, Dimensions, Animated } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";

const API_URL = "http://192.168.1.168:8080/tickets/user";

const { width, height } = Dimensions.get("window"); // Obtener las dimensiones de la pantalla

const TicketScreen = () => {
  const { userNick } = useRoute().params;
  const navigation = useNavigation();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  // Estado para animar el título
  const scrollY = new Animated.Value(0);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/${userNick}`);
      if (!response.ok) {
        throw new Error("Error al obtener los tickets");
      }
      const ticketsData = await response.json();
      setTickets(ticketsData);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userNick) {
      fetchTickets();
    }
  }, [userNick]);

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      fetchTickets();  // Volver a cargar los tickets cuando regrese a esta pantalla
    });

    return unsubscribe; // Limpiar el listener cuando el componente se desmonte
  }, [navigation]);

  const getStateStyle = (state) => {
    switch (state) {
      case "En trámite":
        return styles.enTramite;
      case "Denegada":
        return styles.denegada;
      case "Solucionado":
        return styles.solucionado;
      default:
        return {};
    }
  };

  const renderItem = ({ item }) => {
    return (
      <TouchableOpacity>
        <View style={styles.ticketCard}>
          <Text style={styles.ticketTitle}>{item.titulo}</Text>
          <Text style={[styles.ticketState, getStateStyle(item.estado)]}>{item.estado}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  // Crear un componente animado para el FlatList
  const AnimatedFlatList = Animated.createAnimatedComponent(FlatList);

  return (
    <SafeAreaView style={styles.container}>
      {/* Título "INCIDENCIAS" */}
      <Animated.View
        style={[
          styles.incidentsTitle,
          {
            transform: [{
              translateY: scrollY.interpolate({
                inputRange: [0, height * 0.2], // Ajusta el rango según la altura
                outputRange: [0, -height * 0.2], // El título se mueve hacia arriba
                extrapolate: "clamp", // Limita el movimiento cuando se hace scroll
              }),
            }],
          },
        ]}
      >
        <Text style={styles.incidentsTitleText}>INCIDENCIAS</Text>
      </Animated.View>

      {loading ? (
        <ActivityIndicator size="large" color="#559687" />
      ) : (
        <AnimatedFlatList
          data={tickets}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.flatListContent}
          ListFooterComponent={<View style={{ height: height * 0.1 }} />} // Espacio al final para que el botón no quede cubierto
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: true }
          )}
        />
      )}

      <TouchableOpacity
        style={styles.createTicketButton}
        onPress={() => navigation.navigate("TicketFormScreen", { userNick })}
      >
        <Image
          source={require("../../assets/ticket.png")}
          style={styles.createTicketIcon}
        />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#23272A", padding: width * 0.05 },
  
  incidentsTitle: {
    position: "absolute",
    width: width * 0.5, // 50% del ancho de la pantalla
    height: height * 0.08, // 7% de la altura de la pantalla
    left: width * 0.25, // Centrando el título
    top: height * 0.10, // 5% desde la parte superior
    lineHeight: height * 0.0,
    display: "flex",
    alignItems: "center",
    textAlign: "justify",
    color: "#9FC63B",
  },
  incidentsTitleText: {
    fontFamily: "AsapCondensed-Bold",
    textTransform: "uppercase", 
    fontSize: width * 0.09, // 9% del ancho para el tamaño de la fuente
    color: "#9FC63B",
  },
  ticketCard: {
    backgroundColor: "#323639",
    padding: width * 0.05, // 5% de la anchura para el padding
    borderRadius: 20,
    marginBottom: height * 0.02,
    
  },
  ticketTitle: {
    fontFamily: "AsapCondensed-Bold",
    textTransform: "uppercase", 
    fontSize: width * 0.05, // 8% del ancho para el tamaño del título
    lineHeight: height * 0.03, // 3% de la altura para el line height
    color: "#9FC63B", // 1.5% para el espaciado inferior
    marginHorizontal: 15,
    
  },
  ticketState: {
    fontFamily: "AsapCondensed-Regular",
    textTransform: "uppercase", 
    fontSize: width * 0.04, // 6% del ancho para el tamaño del estado
    lineHeight: height * 0.025, // 2.5% de la altura para el line height
    display: "flex",
    alignItems: "center",
    textAlign: "justify",
    marginHorizontal: 15,
  },
  enTramite: {
    color: "#F19100", // Naranja para 'En trámite'
  },
  denegada: {
    color: "#F10000", // Rojo para 'Denegada'
  },
  solucionado: {
    color: "#9FC63B", // Verde para 'Solucionado'
  },
  createTicketButton: {
    position: "absolute",
    bottom: height * 0.1, // 10% desde el fondo
    right: width * 0.05, // 5% desde la derecha
    backgroundColor: "transparent",
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
    padding: 0,
  },
  createTicketIcon: {
    width: width * 0.3, // 30% del ancho para el icono
    height: width * 0.3, // 30% del ancho para la altura (círculo)
    borderRadius: width * 0.15, // 15% para el borde redondeado
  },
  flatListContent: {
    paddingTop: height * 0.15, // Espacio superior para no solapar el título
    paddingBottom: height * 0.2, // Espacio inferior para no solapar el botón
  },
});

export default TicketScreen;





