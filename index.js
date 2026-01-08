const express = require('express');
const app = express();
app.use(express.json());

app.post('/ussd', (req, res) => {
  const { code } = req.body;
  console.log("Composer USSD :", code);

  // Ici tu relies à un auto-dialer Android
  // ou une app USSD Gateway

  res.json({ status: "SENT", code });
});

app.listen(8080, () => {
  console.log("SIM BOX active sur port 8080");
});

app.post('/ussd', (req, res) => {
  try {
    const { code } = req.body;
    if (!code) return res.status(400).json({ error: "Code USSD manquant" });
    
    console.log("Composer USSD :", code);
    
    // Ici ton auto-dialer / gateway
    
    res.json({ status: "SENT", code });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});