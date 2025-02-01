// src/components/FontLoader.js
import React, { useState, useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import * as Font from 'expo-font'; // Importa expo-font

const loadFonts = async () => {
  await Font.loadAsync({
    'AsapCondensed-Regular': require('../assets/fonts/AsapCondensed-Regular.ttf'),
    'AsapCondensed-Bold': require('../assets/fonts/AsapCondensed-Bold.ttf'),
    'AsapCondensed-Light': require('../assets/fonts/AsapCondensed-Light.ttf'),
    'AsapCondensed-Medium': require('../assets/fonts/AsapCondensed-Italic.ttf'),
  });
};

const FontLoader = ({ children }) => {
  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    loadFonts().then(() => setFontsLoaded(true));
  }, []);

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return children;
};

export default FontLoader;
