import React, { useState, useEffect } from "react";
import { View, Text, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity, Image, Dimensions, Animated } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";
import { API_HOST } from '@env';

const API_URL = `${API_HOST}/tickets/user`;

const { width, height } = Dimensions.get("window");

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
      fetchTickets(); 
    });

    return unsubscribe;
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
                inputRange: [0, height * 0.2], 
                outputRange: [0, -height * 0.2], 
                extrapolate: "clamp",
              }),
            }],
          },
        ]}
      >
        <Text style={styles.incidentsTitleText}>INCIDENCIAS</Text>
      </Animated.View>

      {loading ? (
        <ActivityIndicator size="large" color="#9FC63B" />
      ) : (
        <AnimatedFlatList
          data={tickets}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.flatListContent}
          ListFooterComponent={<View style={{ height: height * 0.1 }} />} 
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
    width: width * 0.5, 
    height: height * 0.08, 
    left: width * 0.25, 
    top: height * 0.10,
    lineHeight: height * 0.0,
    display: "flex",
    alignItems: "center",
    textAlign: "justify",
    color: "#9FC63B",
  },
  incidentsTitleText: {
    fontFamily: "AsapCondensed-Bold",
    textTransform: "uppercase", 
    fontSize: width * 0.09,
    color: "#9FC63B",
  },
  ticketCard: {
    backgroundColor: "#323639",
    padding: width * 0.05,
    borderRadius: 20,
    marginBottom: height * 0.02,
    
  },
  ticketTitle: {
    fontFamily: "AsapCondensed-Bold",
    textTransform: "uppercase", 
    fontSize: width * 0.05, 
    lineHeight: height * 0.03,
    color: "#9FC63B", 
    marginHorizontal: 15,
    
  },
  ticketState: {
    fontFamily: "AsapCondensed-Regular",
    textTransform: "uppercase", 
    fontSize: width * 0.04, 
    lineHeight: height * 0.025,
    display: "flex",
    alignItems: "center",
    textAlign: "justify",
    marginHorizontal: 15,
  },
  enTramite: {
    color: "#F19100", 
  },
  denegada: {
    color: "#F10000", 
  },
  solucionado: {
    color: "#9FC63B", 
  },
  createTicketButton: {
    position: "absolute",
    bottom: height * 0.1, 
    right: width * 0.05, 
    backgroundColor: "transparent",
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
    padding: 0,
  },
  createTicketIcon: {
    width: width * 0.3,
    height: width * 0.3,
    borderRadius: width * 0.15, 
  },
  flatListContent: {
    paddingTop: height * 0.15,
    paddingBottom: height * 0.2,
  },
});

export default TicketScreen;





