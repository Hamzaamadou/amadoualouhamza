// CONFIGURATION DES OFFRES
const offersData = {
    'Airtel': { 
        jour: [{p:'100F', v:'25Mo', b:'+25Mo', cost:85}, {p:'500F', v:'600Mo', b:'+600Mo', cost:420}], 
        promo: [{p:'450F', v:'600Mo', b:'+600Mo', cost:400}] 
    },
    'Moov': { 
        jour: [{p:'100F', v:'35Mo', b:'+35Mo', cost:80}], 
        promo: [{p:'900F', v:'1.2Go', b:'+1.2Go', cost:810}] 
    },
    'Zamani': { 
        jour: [{p:'500F', v:'600Mo', b:'+600Mo', cost:440}] 
    },
    'Niger Telecom': { 
        jour: [{p:'200F', v:'150Mo', b:'+150Mo', cost:160}] 
    }
};

// ÉTAT DE L'APPLICATION
let currentBalance = parseInt(localStorage.getItem('balance')) || 5000; // Solde par défaut 5000F
let selectedOp = "";
let selectedOffer = {};

// INITIALISATION AU CHARGEMENT
window.onload = () => {
    updateUI();
};

// AUTHENTIFICATION SIMPLIFIÉE (SANS FIREBASE)
window.handleLogin = () => {
    const email = document.getElementById('log-email').value;
    if(email.includes('@')) {
        document.getElementById('auth-container').classList.add('hidden');
        document.getElementById('app-container').classList.remove('hidden');
    } else {
        alert("Veuillez entrer un email valide");
    }
};

window.handleRegister = () => {
    alert("Compte créé avec succès (Mode Local)");
    window.handleLogin();
};

window.switchView = (id) => { 
    document.getElementById('login-card').classList.toggle('hidden', id !== 'login-card');
    document.getElementById('register-card').classList.toggle('hidden', id !== 'register-card');
};

// LOGIQUE BOUTIQUE
window.setOp = (op) => {
    selectedOp = op;
    document.getElementById('offers-section').classList.remove('hidden');
    showType('jour');
};

window.showType = (type) => {
    const grid = document.getElementById('offers-grid');
    grid.innerHTML = "";
    if (offersData[selectedOp] && offersData[selectedOp][type]) {
        offersData[selectedOp][type].forEach(o => {
            const div = document.createElement('div');
            div.className = "offer-card";
            div.innerHTML = `
                <h4>${o.v}</h4>
                <p>${o.p}</p>
                <button onclick="openPay('${o.v}','${o.p}','${o.b}',${o.cost})">ACHETER</button>
            `;
            grid.appendChild(div);
        });
    }
};

window.openPay = (v, p, b, cost) => {
    selectedOffer = { v, p, b, cost };
    document.getElementById('m-desc').innerText = `Forfait ${v} - ${selectedOp}`;
    document.getElementById('m-price').value = p;
    document.getElementById('payment-modal').classList.remove('hidden');
};

window.executePayment = () => {
    const price = parseInt(selectedOffer.p.replace(/\D/g, ''));
    
    if (currentBalance < price) {
        return alert("Solde insuffisant ! Veuillez recharger votre compte.");
    }

    document.getElementById('pay-txt').classList.add('hidden');
    document.getElementById('pay-load').classList.remove('hidden');

    setTimeout(() => {
        currentBalance -= price;
        localStorage.setItem('balance', currentBalance); // Sauvegarde locale
        updateUI();
        alert(`Succès ! Le forfait ${selectedOffer.v} a été activé sur votre ligne.`);
        window.closeModal();
    }, 1500);
};

function updateUI() {
    const displays = ['mini-balance', 'large-balance'];
    displays.forEach(id => {
        const el = document.getElementById(id);
        if(el) el.innerText = currentBalance + " F CFA";
    });
}

window.closeModal = () => {
    document.getElementById('payment-modal').classList.add('hidden');
    document.getElementById('pay-txt').classList.remove('hidden');
    document.getElementById('pay-load').classList.add('hidden');
};

window.togglePass = (id) => { 
    const el = document.getElementById(id); 
    el.type = el.type === 'password' ? 'text' : 'password'; 
};