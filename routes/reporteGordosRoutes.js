const express = require('express');
const router = express.Router();
const { generarExcelProductor } = require('../controllers/reporteGordosController');

router.post('/reporte-productor', generarExcelProductor);

module.exports = router;