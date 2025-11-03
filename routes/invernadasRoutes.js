const express = require('express');
const router = express.Router();
const invernadasController = require('../controllers/invernadasController');
const { verificarToken } = require("../middlewares/authMiddleware"); // funciona igual con const vt = require..., después vt.verificarToken

// Importás el controlador del Excel
const { generarExcelInvernada } = require('../controllers/reporteInvernadasController');

// Obtener todas las cargas gordo
router.get("/", verificarToken, invernadasController.obtenerCargasInvernada);

// Obtener una carga gordo por ID
router.get("/:idCargaInvernada", verificarToken, invernadasController.obtenerCargasInvernada);

// Crear una nueva carga gordo
router.post("/", verificarToken, invernadasController.crearCargaInvernada);

// Editar una carga gordo
router.put("/:idCargaInvernada", verificarToken, invernadasController.editarCargaInvernada);

// Eliminar una carga gordo
router.delete("/:idCargaInvernada", verificarToken, invernadasController.eliminarCargaInvernada);

// Nueva ruta para generar el Excel
router.post('/reporte', generarExcelInvernada);

module.exports = router;