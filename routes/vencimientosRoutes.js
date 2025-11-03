const express = require("express");
const router = express.Router();
const vencimientosController = require("../controllers/vencimientosController");

// ABM de cargas (lo de antes)
router.get("/:idCarga", vencimientosController.obtenerVencimientosPorCarga);

// Dashboard - lista todos (orden: próximos primero)
router.get("/", vencimientosController.listarTodosOrden);

// Cambiar estado
router.put("/:id/estado", vencimientosController.cambiarEstado);

module.exports = router;
