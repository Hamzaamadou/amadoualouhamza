const jwt = require('jsonwebtoken');

// Middleware pour protéger les routes Admin / SuperAdmin
module.exports = function (req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Accès refusé : token manquant' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'aha_secret');

    // Vérifier que le rôle est admin ou superadmin
    if (!decoded.role || !['admin', 'superadmin'].includes(decoded.role)) {
      return res.status(403).json({ message: 'Accès réservé aux administrateurs' });
    }

    req.user = decoded; // injecte l’utilisateur décodé dans req
    next();
  } catch (err) {
    console.error('Token invalide :', err.message);
    return res.status(401).json({ message: 'Token invalide' });
  }
};