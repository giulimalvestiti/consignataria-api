const express = require("express");
const router = express.Router();
const dashboardController = require("../controllers/dashboardController");

// KPIs principales
router.get("/kpis", dashboardController.getKPIs);

// Gráficas
router.get("/ganancias-mensuales", dashboardController.getGananciasMensuales);
router.get("/cargas-mensuales", dashboardController.getCargasMensuales);
router.get("/distribucion-tipos", dashboardController.getDistribucionTipos);
router.get('/anios', dashboardController.getAniosConCargas);
router.get("/topRindes", dashboardController.getTopRindes);

// Vencimientos próximos
router.get("/vencimientos", dashboardController.getVencimientos);
//Vencimientos sin pagar, asi hago la notificacion
router.get("/vencimientos-vencidos", dashboardController.getVencimientosVencidos);

module.exports = router;
