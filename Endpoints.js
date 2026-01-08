router.get("/plans/:operator/:duration", (req, res) => {
  const { operator, duration } = req.params; // airtel, moov, zamani / jour, semaine, mois

  const plans = internetPlans[operator]?.[duration]; // Accès aux forfaits

  if (!plans) return res.status(404).json({ message: "Forfaits non trouvés" });

  res.json(plans); // Retourne les forfaits au frontend
});