import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Image, Text, View, StyleSheet } from 'react-native';
import PublicationScreen from './PublicationScreen';
import TicketsScreen from './TicketsScreen';
import AddPublicationScreen from './AddPublicationScreen';
import ProfileScreen from './ProfileScreen';

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
      {label || 'sin etiqueta'}
    </Text>
  </View>
);

const HomeScreen = ({route}) => {
  const { userNick, UserId } = route.params || {};
  console.log("✅ userNick en HomeScreen:", userNick);
  console.log("✅ UserId en HomeScreen:", UserId);

  if (!UserId) {
    console.error("🚨 ERROR: UserId no recibido en HomeScreen.");
  }
  return(
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
        initialParams={{ userNick, UserId }} 
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
        name="Add"
        component={AddPublicationScreen}
        initialParams={{ userNick, UserId }} 
        options={{
          tabBarIcon: ({ focused }) => (
            <CustomTabBarIcon
              focused={focused}
              activeIcon={require('../../assets/addg.png')}
              inactiveIcon={require('../../assets/addgris.png')}
              label="Add"
            />
          ),
        }} 
      />

      <Tab.Screen
        name="Ajustes"
        component={TicketsScreen}
        initialParams={{ userNick, UserId }} 
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

      {/* Nueva pestaña de Perfil */}
      <Tab.Screen
        name="Perfil"
        component={ProfileScreen}
        initialParams={{ userNick, UserId }} 
        options={{
          tabBarIcon: ({ focused }) => (
            <CustomTabBarIcon
              focused={focused}
              activeIcon={require('../../assets/addg.png')}
              inactiveIcon={require('../../assets/addgris.png')}
              label="Perfil"
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
    borderTopWidth: 0, 
    paddingTop: 10, 
  },
  iconContainer: {
    flexDirection: 'column', 
    justifyContent: 'center',
    alignItems: 'center', 
    height: 50,
  },
  icon: {
    width: 24,
    height: 24,
    marginBottom: 2, 
  },
  iconLabel: {
    fontFamily: 'AsapCondensed-Regular',
    fontStyle: 'normal',
    fontWeight: '400',
    fontSize: 11,
    lineHeight: 13,
    textAlign: 'center',
    width: 60, 
  },
  iconLabelActive: {
    color: '#9FC63B',
  },
  iconLabelInactive: {
    color: '#868686',
  },
});

export default HomeScreen;