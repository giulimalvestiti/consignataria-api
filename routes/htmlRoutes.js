// routes/htmlRoutes.js
const express = require('express');
const router = express.Router();
const path = require('path');
const { verificarToken, verificarAdmin } = require("../middlewares/authMiddleware");


router.get('/', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../../Front/views/login.html'));
});

router.get('/abmRegister', verificarToken, verificarAdmin, (req, res) => {
    res.sendFile(path.resolve(__dirname, '../../Front/views/abmRegister.html'));
});

router.get('/home', verificarToken, (req, res) => {
    res.sendFile(path.resolve(__dirname, '../../Front/views/home.html'));
});

router.get('/dashboard', verificarToken, (req, res) => {
    res.sendFile(path.resolve(__dirname, '../../Front/views/dashboard.html'));
});

router.get('/productores', verificarToken, (req, res) => {
    res.sendFile(path.resolve(__dirname, '../../Front/views/abmProductores.html'));
});

router.get('/matarifes', verificarToken, (req, res) => {
    res.sendFile(path.resolve(__dirname, '../../Front/views/abmMatarifes.html'));
});

router.get('/transportes', verificarToken, (req, res) => {
    res.sendFile(path.resolve(__dirname, '../../Front/views/abmTransportes.html'));
});

router.get('/planificacion', verificarToken, (req, res) => {
    res.sendFile(path.resolve(__dirname, '../../Front/views/planificacion.html'));
});

router.get('/gordos', verificarToken, (req, res) => {
    res.sendFile(path.resolve(__dirname, '../../Front/views/abmCargasGordos.html'));
});

router.get('/invernadas', verificarToken, (req, res) => {
    res.sendFile(path.resolve(__dirname, '../../Front/views/abmCargasInvernadas.html'));
});



module.exports = router;
