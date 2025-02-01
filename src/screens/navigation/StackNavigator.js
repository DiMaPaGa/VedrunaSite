import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginFirebaseScreen from '../LoginFirebaseScreen';  
import RegisterFirebaseScreen from '../RegisterFirebaseScreen'; 
import HomeScreen from '../HomeScreen';
import SinglePublicationScreen from '../SinglePublicationScreen'; 


const Stack = createNativeStackNavigator();


const StackNavigator = () => {
  return (
    <Stack.Navigator initialRouteName="LoginFirebaseScreen">
      <Stack.Screen name="LoginFirebaseScreen" component={LoginFirebaseScreen} options={{ headerShown: false }} />
      <Stack.Screen name="RegisterFirebaseScreen" component={RegisterFirebaseScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
      <Stack.Screen name="SinglePublication" component={SinglePublicationScreen} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
};

export default StackNavigator;
