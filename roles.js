module.exports.requireRole = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role))
      return res.status(403).json({ message: "Accès refusé" });
    next();
  };
};

const { requireRole } = require("../utils/roles");

router.get("/admin/orders", requireRole("admin","superadmin"), ... );

router.post("/agent/validate", requireRole("agent","admin","superadmin"), ...);