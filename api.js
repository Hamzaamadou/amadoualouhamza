// api.js
import axios from "axios";

// ✅ Déterminer la baseURL selon l'environnement
const BASE_URL = window.location.hostname === "localhost"
  ? "http://localhost:4000"
  : "https://TON-BACKEND.onrender.com";

// Créer l'instance Axios
export const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    // Ajouter le token si présent
    Authorization: 'Bearer ' + localStorage.getItem('token') || ""
  }
});

// Gestion globale des erreurs
api.interceptors.response.use(
  res => res,
  err => {
    console.error("Erreur API:", err.response?.data || err.message);
    return Promise.reject(err);
  }
);

// -------------------- EXEMPLES --------------------

// Récupérer l’historique des commandes pour un utilisateur
export const getOrderHistory = (userId) => {
  return api.get(`/orders/history/${userId}`)
            .then(res => res.data)
            .catch(err => { throw err; });
};

// Envoyer un achat de crédit
export const buyCredit = ({ operator, amount, phone }) => {
  return api.post("/credit/buy", { operator, amount, phone })
            .then(res => res.data)
            .catch(err => { throw err; });
};