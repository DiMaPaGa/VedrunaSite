import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import StackNavigator from './src/screens/navigation/StackNavigator';
import FontLoader from './src/FontLoader'; 



export default function App() {
  return (
    <FontLoader>
      <NavigationContainer>
        <StackNavigator />
      </NavigationContainer>
    </FontLoader>
  );
}