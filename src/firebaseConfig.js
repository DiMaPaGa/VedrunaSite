import { initializeApp } from "firebase/app";
import { getAuth, initializeAuth, getReactNativePersistence } from "firebase/auth";
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: "AIzaSyBZkXabwPgzk_tDuX-YmzQQ8C-tQKpeQYM",
  authDomain: "vedrunasite-ff1bd.firebaseapp.com",
  projectId: "vedrunasite-ff1bd",
  storageBucket: "vedrunasite-ff1bd.firebasestorage.app",
  messagingSenderId: "1029790457556",
  appId: "1:1029790457556:web:f680c5896bdad917a2a541"
};

// Inicializa Firebase
const app = initializeApp(firebaseConfig);


const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage), 
});

export { auth };
