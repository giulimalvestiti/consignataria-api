const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middlewares/authMiddleware');


// Login público
router.post("/login", authController.login);

// Logout (requiere estar logueado para tener la cookie a limpiar, opcional protegerlo)
router.post("/logout", authMiddleware.verificarToken, authController.logout);

// Verificar token (útil para ping/health del token)
router.get("/verify", authMiddleware.verificarToken, authController.verify);

// Quién soy (id, usuario, rol) -> para mostrar/ocultar ítems del menú en el front
router.get("/me", authMiddleware.verificarToken, (req, res) => {
  res.json({
    id: req.usuario.id,
    usuario: req.usuario.usuario,
    rol: req.usuario.rol
  });
});

module.exports = router;
