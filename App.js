import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import StackNavigator from './src/screens/navigation/StackNavigator'; // Ajusta la ruta si es necesario



export default function App() {
  return (
    <NavigationContainer>
      <StackNavigator />  {/* Usa el StackNavigator aquí */}
    </NavigationContainer>
  );
}