import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Image, Text, View, StyleSheet } from 'react-native';
import PublicationScreen from './PublicationScreen';
import SettingsScreen from './SettingsScreen';

const Tab = createBottomTabNavigator();

const CustomTabBarIcon = ({ focused, activeIcon, inactiveIcon, label }) => (
  <View style={styles.iconContainer}>
    <Image
      source={focused ? activeIcon : inactiveIcon}
      style={styles.icon}
    />
    <Text
      style={[styles.iconLabel, focused ? styles.iconLabelActive : styles.iconLabelInactive]}
      numberOfLines={1}
      ellipsizeMode="tail"
    >
      {label || ''}
    </Text>
  </View>
);

const HomeScreen = ({ navigation }) => {
  const handleLogout = () => {
    // Aquí es donde puedes realizar el logout y navegar a la pantalla de login
    console.log('Logout ejecutado');
    navigation.navigate('LoginFirebaseScreen');
  };

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarShowLabel: false,
        headerShown: false,
        tabBarStyle: styles.tabBar,
      }}
    >
      <Tab.Screen
        name="Publicaciones"
        component={PublicationScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <CustomTabBarIcon
              focused={focused}
              activeIcon={require('../../assets/publicaciones.png')}
              inactiveIcon={require('../../assets/publicacionesgris.png')}
              label="Publicaciones"
            />
          ),
        }}
      />
      
        <Tab.Screen
    name="Salir"
    component={() => null} // Un componente vacío
    options={{
      tabBarIcon: ({ focused }) => (
        <CustomTabBarIcon
          focused={focused}
          activeIcon={require('../../assets/add.png')}
          inactiveIcon={require('../../assets/addgris.png')}
          label="Salir"
        />
      ),
    }}
    listeners={{
      tabPress: (e) => {
        e.preventDefault(); // Prevenir la navegación automática
        handleLogout(); // Ejecutar el logout
      },
    }}
  />

      <Tab.Screen
        name="Ajustes"
        component={SettingsScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <CustomTabBarIcon
              focused={focused}
              activeIcon={require('../../assets/ajustes.png')}
              inactiveIcon={require('../../assets/ajustesgris.png')}
              label="Ajustes"
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#23272A',
    height: 75,
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    borderTopWidth: 0, // Elimina el borde superior del navbar si lo hubiera
    paddingTop: 10, // Ajuste de espacio arriba para centrar el contenido
  },
  iconContainer: {
    flexDirection: 'column', // Coloca el icono y el texto en columna
    justifyContent: 'center', // Centra verticalmente
    alignItems: 'center', // Centra horizontalmente
    height: 50, // Altura consistente para el contenedor
  },
  icon: {
    width: 24,
    height: 24,
    marginBottom: 2, // Espacio entre el icono y el texto
  },
  iconLabel: {
    fontFamily: 'Asap Condensed',
    fontStyle: 'normal',
    fontWeight: '400',
    fontSize: 11,
    lineHeight: 13,
    textAlign: 'center',
    width: 60, // Ancho fijo para mantener el texto alineado
  },
  iconLabelActive: {
    color: '#9FC63B',
  },
  iconLabelInactive: {
    color: '#868686',
  },
});

export default HomeScreen;

