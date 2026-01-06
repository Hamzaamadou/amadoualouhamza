import { initializeApp, getApps } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAVEegZbxULRjRM0et27ArF4yNAKOhd3G4", // Vérifiez bien cette clé dans votre console
  authDomain: "vente-de-mega.firebaseapp.com",
  projectId: "vente-de-mega",
  storageBucket: "vente-de-mega.firebasestorage.app",
  messagingSenderId: "203808293368",
  appId: "1:203808293368:web:be6d7ba13899133da9960d",
  measurementId: "G-02JWLSJRNN"
};

// Initialisation sécurisée
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);
const db = getFirestore(app);

// --- LOGIQUE D'AUTHENTIFICATION ---

window.handleRegister = async () => {
    const email = document.getElementById('reg-email').value;
    const pass = document.getElementById('reg-pass').value;
    if(!email || !pass) return alert("Remplissez tous les champs");

    try {
        const res = await createUserWithEmailAndPassword(auth, email, pass);
        // Initialise le solde à 0 dans Firestore
        await setDoc(doc(db, "users", res.user.uid), { balance: 0 });
        alert("Compte créé avec succès !");
    } catch (e) { 
        console.error(e);
        alert("Erreur d'inscription : " + e.message); 
    }
};

window.handleLogin = async () => {
    const email = document.getElementById('log-email').value;
    const pass = document.getElementById('log-pass').value;
    try { 
        await signInWithEmailAndPassword(auth, email, pass); 
    } catch (e) { 
        alert("Erreur de connexion : " + e.message); 
    }
};

onAuthStateChanged(auth, async (user) => {
    if (user) {
        const snap = await getDoc(doc(db, "users", user.uid));
        if (snap.exists()) {
            currentBalance = snap.data().balance || 0;
            updateUI();
        }
        document.getElementById('auth-container').classList.add('hidden');
        document.getElementById('app-container').classList.remove('hidden');
    }
});

// APP LOGIC
window.setOp = (op) => {
    selectedOp = op;
    document.getElementById('offers-section').classList.remove('hidden');
    showType('jour');
};

window.showType = (type) => {
    const grid = document.getElementById('offers-grid');
    grid.innerHTML = "";
    (offersData[selectedOp][type] || []).forEach(o => {
        const div = document.createElement('div');
        div.className = "offer-card";
        div.innerHTML = `<h4>${o.v}</h4><p>${o.p}</p><button onclick="openPay('${o.v}','${o.p}','${o.b}',${o.cost})">ACHETER</button>`;
        grid.appendChild(div);
    });
};

window.openPay = (v, p, b, cost) => {
    selectedOffer = { v, p, b, cost };
    document.getElementById('m-desc').innerText = `Forfait ${v} - ${selectedOp}`;
    document.getElementById('m-price').value = p;
    document.getElementById('payment-modal').classList.remove('hidden');
};

window.executePayment = async () => {
    const price = parseInt(selectedOffer.p.replace(/\D/g, ''));
    if(document.getElementById('m-method').value === "Solde Aha" && currentBalance < price) return alert("Solde insuffisant");

    document.getElementById('pay-txt').classList.add('hidden');
    document.getElementById('pay-load').classList.remove('hidden');

    setTimeout(async () => {
        if(document.getElementById('m-method').value === "Solde Aha") {
            currentBalance -= price;
            await updateDoc(doc(db, "users", currentUser.uid), { balance: currentBalance });
        }
        stats.count++;
        stats.profit += (price - selectedOffer.cost);
        updateUI();
        alert("Succès ! Forfait activé.");
        window.closeModal();
    }, 2000);
};

function updateUI() {
    document.getElementById('mini-balance').innerText = currentBalance + " F";
    document.getElementById('large-balance').innerText = currentBalance + " F CFA";
}

window.closeModal = () => {
    document.getElementById('payment-modal').classList.add('hidden');
    document.getElementById('pay-txt').classList.remove('hidden');
    document.getElementById('pay-load').classList.add('hidden');
};