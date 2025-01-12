import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";  // Importamos la autenticación

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

// Exporta la instancia de la autenticación
const auth = getAuth(app);

export { auth };
