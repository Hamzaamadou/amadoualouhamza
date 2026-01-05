import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAVEegZbxULRjRM0et27ArF4yNAKOhd3G4",
  authDomain: "vente-de-mega.firebaseapp.com",
  projectId: "vente-de-mega",
  storageBucket: "vente-de-mega.firebasestorage.app",
  messagingSenderId: "203808293368",
  appId: "1:203808293368:web:be6d7ba13899133da9960d",
  measurementId: "G-02JWLSJRNN"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// DATA
const offersData = {
    'Airtel': { jour: [{p:'100F', v:'25Mo', b:'+25Mo', cost:85}, {p:'500F', v:'600Mo', b:'+600Mo', cost:420}], promo: [{p:'450F', v:'600Mo', b:'+600Mo', cost:400}] },
    'Moov': { jour: [{p:'100F', v:'35Mo', b:'+35Mo', cost:80}], promo: [{p:'900F', v:'1.2Go', b:'+1.2Go', cost:810}] },
    'Zamani': { jour: [{p:'500F', v:'600Mo', b:'+600Mo', cost:440}] },
    'Niger Telecom': { jour: [{p:'200F', v:'150Mo', b:'+150Mo', cost:160}] }
};

let currentBalance = 0;
let currentUser = null;
let selectedOp = "";
let selectedOffer = {};
let stats = { count: 0, profit: 0 };

// AUTH UI
window.togglePass = (id) => { const el = document.getElementById(id); el.type = el.type === 'password' ? 'text' : 'password'; };
window.switchView = (id) => { 
    document.getElementById('login-card').classList.toggle('hidden', id !== 'login-card');
    document.getElementById('register-card').classList.toggle('hidden', id !== 'register-card');
};

// FIREBASE ACTIONS
window.handleRegister = async () => {
    const email = document.getElementById('reg-email').value;
    const pass = document.getElementById('reg-pass').value;
    try {
        const res = await createUserWithEmailAndPassword(auth, email, pass);
        await setDoc(doc(db, "users", res.user.uid), { balance: 0 });
        alert("Compte créé !");
    } catch (e) { alert(e.message); }
};

window.handleLogin = async () => {
    const email = document.getElementById('log-email').value;
    const pass = document.getElementById('log-pass').value;
    try { await signInWithEmailAndPassword(auth, email, pass); } catch (e) { alert(e.message); }
};

onAuthStateChanged(auth, async (user) => {
    if (user) {
        currentUser = user;
        const snap = await getDoc(doc(db, "users", user.uid));
        currentBalance = snap.data().balance || 0;
        updateUI();
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