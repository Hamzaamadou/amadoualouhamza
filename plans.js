// backend/routes/plans.js
const express = require('express');
const router = express.Router();
const plans = require('../services/internetPlans');

// Récupérer les forfaits par opérateur et durée
router.get('/:operator/:duration', (req, res) => {
  const { operator, duration } = req.params;
  const data = plans[operator]?.[duration];

  if (!data) {
    return res.status(404).json({ message: 'Forfaits non trouvés' });
  }

  res.json(data);
});

module.exports = router;