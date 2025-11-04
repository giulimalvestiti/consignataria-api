const express = require('express');
const router = express.Router();
const path = require('path');
const { verificarToken, verificarAdmin } = require("../middlewares/authMiddleware");

const viewPath = (file) => path.join(__dirname, '../Front/views', file);

router.get('/', (req, res) => res.sendFile(viewPath('login.html')));
router.get('/abmRegister', verificarToken, verificarAdmin, (req, res) => res.sendFile(viewPath('abmRegister.html')));
router.get('/home', verificarToken, (req, res) => res.sendFile(viewPath('home.html')));
router.get('/dashboard', verificarToken, (req, res) => res.sendFile(viewPath('dashboard.html')));
router.get('/productores', verificarToken, (req, res) => res.sendFile(viewPath('abmProductores.html')));
router.get('/matarifes', verificarToken, (req, res) => res.sendFile(viewPath('abmMatarifes.html')));
router.get('/transportes', verificarToken, (req, res) => res.sendFile(viewPath('abmTransportes.html')));
router.get('/planificacion', verificarToken, (req, res) => res.sendFile(viewPath('planificacion.html')));
router.get('/gordos', verificarToken, (req, res) => res.sendFile(viewPath('abmCargasGordos.html')));
router.get('/invernadas', verificarToken, (req, res) => res.sendFile(viewPath('abmCargasInvernadas.html')));

module.exports = router;

