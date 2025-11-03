const mySQL = require("../conexion");

// 🔹 Convierte el tipo de carga a etiqueta legible
const tipoEtiqueta = (tipo) => (tipo === 'gordo' ? 'Faena' : 'Invernada');

/**
 * 📦 GET /api/vencimientos/:idCarga?tipo=gordo|invernada
 * Usado en los ABM de cargas para mostrar los vencimientos de una carga específica
 */
exports.obtenerVencimientosPorCarga = (req, res) => {
  const tipoCarga = req.query.tipo; // "gordo" o "invernada"
  const idCarga = req.params.idCarga; // ID numérico

  const sql = `
    SELECT *
    FROM vencimientos_pago
    WHERE id_carga = ? AND tipo_carga = ?
    ORDER BY idVencimiento ASC
  `;

  mySQL.conexion.query(sql, [idCarga, tipoCarga], (err, results) => {
    if (err) {
      console.error("❌ Error obteniendo vencimientos por carga:", err.sqlMessage || err);
      return res.status(500).send(err);
    }
    res.json(results);
  });
};

/**
 * 📘 GET /api/vencimientos
 * Devuelve todos los vencimientos (faena + invernada),
 * mostrando primero los más próximos y luego los vencidos.
 */
exports.listarTodosOrden = (req, res) => {
  const sql = `
    SELECT 
      v.idVencimiento AS id,
      v.fecha_vencimiento,
      v.tipo_carga,
      v.estado,
      r.nro,

      CASE 
        WHEN v.tipo_carga = 'gordo' THEN p.razón_social
        ELSE pv.razón_social
      END AS productor,

      CASE 
        WHEN v.tipo_carga = 'gordo' THEN m.razón_social
        ELSE pc.razón_social
      END AS contraparte,

      CASE 
        WHEN v.tipo_carga = 'gordo' THEN (cg.monto_total / NULLIF(cnt.total_venc, 0))
        WHEN v.tipo_carga = 'invernada' THEN (ci.monto_total / NULLIF(cnt.total_venc, 0))
      END AS monto_vencimiento,

      CASE 
        WHEN v.fecha_vencimiento >= CURDATE() THEN 0 ELSE 1
      END AS grp

    FROM (
      SELECT 
        vp.*, 
        ROW_NUMBER() OVER (PARTITION BY vp.id_carga ORDER BY vp.fecha_vencimiento ASC) AS nro
      FROM vencimientos_pago vp
    ) r
    JOIN vencimientos_pago v ON v.idVencimiento = r.idVencimiento

    LEFT JOIN (
      SELECT id_carga, tipo_carga, COUNT(*) AS total_venc
      FROM vencimientos_pago
      GROUP BY id_carga, tipo_carga
    ) cnt ON cnt.id_carga = v.id_carga AND cnt.tipo_carga = v.tipo_carga

    LEFT JOIN cargas_gordo cg 
      ON v.tipo_carga = 'gordo' AND v.id_carga = cg.idCargaGordo
    LEFT JOIN cargas_invernada ci 
      ON v.tipo_carga = 'invernada' AND v.id_carga = ci.idCargaInvernada

    LEFT JOIN productores p  ON cg.idProductor          = p.idProductor
    LEFT JOIN matarifes  m   ON cg.idMatarife           = m.idMatarife
    LEFT JOIN productores pv ON ci.idProductorVendedor  = pv.idProductor
    LEFT JOIN productores pc ON ci.idProductorComprador = pc.idProductor

    ORDER BY 
      grp ASC,
      CASE WHEN v.fecha_vencimiento >= CURDATE() THEN v.fecha_vencimiento END ASC,
      CASE WHEN v.fecha_vencimiento <  CURDATE() THEN v.fecha_vencimiento END DESC,
      r.nro ASC
  `;

  mySQL.conexion.query(sql, (error, rows) => {
    if (error) {
      console.error("❌ Error listando vencimientos:", error.sqlMessage || error);
      return res.status(500).json({ error: "Error listando vencimientos" });
    }

    const data = rows.map(r => ({
      id_vencimiento: r.id,
      fecha_vencimiento: r.fecha_vencimiento,
      numero_vencimiento: r.nro,
      tipo_carga: tipoEtiqueta(r.tipo_carga),
      monto: Number(r.monto_vencimiento) || 0,
      productor: r.productor || '',
      contraparte: r.contraparte || '',
      estado: (r.estado || '').toLowerCase() === 'pagado' ? 'Pagado' : 'Pendiente'
    }));

    res.json(data);
  });
};

/**
 * 🔁 PUT /api/vencimientos/:id/estado
 * Cambia el estado entre "Pagado" y "Pendiente"
 */
exports.cambiarEstado = (req, res) => {
  const { id } = req.params;
  const { estado } = req.body;

  if (!['Pagado', 'Pendiente'].includes(estado)) {
    return res.status(400).json({ error: "Estado inválido" });
  }

  const sql = `UPDATE vencimientos_pago SET estado = ? WHERE idVencimiento = ?`;

  mySQL.conexion.query(sql, [estado, id], (err, result) => {
    if (err) {
      console.error("❌ Error actualizando estado de vencimiento:", err.sqlMessage || err);
      return res.status(500).json({ error: "Error actualizando estado" });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Vencimiento no encontrado" });
    }
    res.json({ ok: true, id, estado });
  });
};


