const { conexion } = require("../conexion");

// === KPIs (tarjetas) ===
exports.getKPIs = (req, res) => {
  const sql = `
    SELECT 'gananciaMensual' AS tipo, SUM(ganancia_total) AS total 
    FROM cargas_gordo 
    WHERE MONTH(fecha_carga) = MONTH(CURDATE()) AND YEAR(fecha_carga) = YEAR(CURDATE())
    UNION ALL
    SELECT 'gananciaMensual', SUM(ganancia_total) 
    FROM cargas_invernada 
    WHERE MONTH(fecha_carga) = MONTH(CURDATE()) AND YEAR(fecha_carga) = YEAR(CURDATE())
    UNION ALL
    SELECT 'gananciaAnual', SUM(ganancia_total) 
    FROM cargas_gordo 
    WHERE YEAR(fecha_carga) = YEAR(CURDATE())
    UNION ALL
    SELECT 'gananciaAnual', SUM(ganancia_total) 
    FROM cargas_invernada 
    WHERE YEAR(fecha_carga) = YEAR(CURDATE())
    UNION ALL
    SELECT 'totalCargasMensual', COUNT(*) 
    FROM cargas_gordo 
    WHERE MONTH(fecha_carga) = MONTH(CURDATE()) AND YEAR(fecha_carga) = YEAR(CURDATE())
    UNION ALL
    SELECT 'totalCargasMensual', COUNT(*) 
    FROM cargas_invernada 
    WHERE MONTH(fecha_carga) = MONTH(CURDATE()) AND YEAR(fecha_carga) = YEAR(CURDATE())
    UNION ALL
    SELECT 'totalCargasAnual', COUNT(*) 
    FROM cargas_gordo 
    WHERE YEAR(fecha_carga) = YEAR(CURDATE())
    UNION ALL
    SELECT 'totalCargasAnual', COUNT(*) 
    FROM cargas_invernada 
    WHERE YEAR(fecha_carga) = YEAR(CURDATE())
  `;

  // Ejecutamos la consulta SQL
  conexion.query(sql, (error, results) => {
    if (error) return res.status(500).send(error); // si hay error, respondemos con 500

    // Creamos un objeto inicial con los KPIs en cero
    const data = {
      gananciaMensual: 0,     // suma de ganancias de gordo + invernada del mes
      gananciaAnual: 0,       // suma de ganancias de gordo + invernada del año
      totalCargasMensual: 0,  // cantidad de cargas (gordo + invernada) en el mes
      totalCargasAnual: 0     // cantidad de cargas (gordo + invernada) en el año
    };

    // Iteramos los resultados de la consulta
    results.forEach(r => {
      // Sumamos cada total según el tipo (gananciaMensual, gananciaAnual, etc.)
      data[r.tipo] += r.total || 0;  
      // r.tipo = el alias definido ('gananciaMensual', 'totalCargasAnual', etc.)
      // r.total = el valor calculado (puede ser NULL, por eso usamos || 0)
    });

    // Enviamos el objeto final como JSON al frontend
    res.json(data);
  });
};





// === Ganancias Mensuales (con ?year=YYYY y 12 meses) ===
exports.getGananciasMensuales = (req, res) => {
  // Año solicitado o actual
  const year = Number(req.query.year) || new Date().getFullYear();

  // Tabla de meses 1..12 para asegurar 12 puntos siempre
  const sql = `
    WITH meses AS (
      SELECT 1 AS mes UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4
      UNION ALL SELECT 5 UNION ALL SELECT 6 UNION ALL SELECT 7 UNION ALL SELECT 8
      UNION ALL SELECT 9 UNION ALL SELECT 10 UNION ALL SELECT 11 UNION ALL SELECT 12
    ),
    datos AS (
      SELECT MONTH(fecha_carga) AS mes, ganancia_total AS total
      FROM cargas_gordo
      WHERE YEAR(fecha_carga) = ?
      UNION ALL
      SELECT MONTH(fecha_carga) AS mes, ganancia_total AS total
      FROM cargas_invernada
      WHERE YEAR(fecha_carga) = ?
    )
    SELECT m.mes, COALESCE(SUM(d.total), 0) AS total
    FROM meses m
    LEFT JOIN datos d ON d.mes = m.mes
    GROUP BY m.mes
    ORDER BY m.mes;
  `;

  conexion.query(sql, [year, year], (error, results) => {
    if (error) return res.status(500).send(error);

    const mesesEspanol = [
      "Enero","Febrero","Marzo","Abril","Mayo","Junio",
      "Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"
    ];

    // Evitar cache (por si el fetch del front no lo fuerza)
    res.set('Cache-Control', 'no-store');

    res.json({
      year,
      meses: results.map(r => mesesEspanol[r.mes - 1]),
      valores: results.map(r => Number(r.total) || 0)
    });
  });
};





// === Cargas Mensuales (con ?year=YYYY y 12 meses) ===
exports.getCargasMensuales = (req, res) => {
  const year = Number(req.query.year) || new Date().getFullYear();

  const sql = `
    WITH meses AS (
      SELECT 1 AS mes UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4
      UNION ALL SELECT 5 UNION ALL SELECT 6 UNION ALL SELECT 7 UNION ALL SELECT 8
      UNION ALL SELECT 9 UNION ALL SELECT 10 UNION ALL SELECT 11 UNION ALL SELECT 12
    ),
    datos AS (
      SELECT MONTH(fecha_carga) AS mes FROM cargas_gordo WHERE YEAR(fecha_carga) = ?
      UNION ALL
      SELECT MONTH(fecha_carga) AS mes FROM cargas_invernada WHERE YEAR(fecha_carga) = ?
    )
    SELECT m.mes, COALESCE(COUNT(d.mes), 0) AS total
    FROM meses m
    LEFT JOIN datos d ON d.mes = m.mes
    GROUP BY m.mes
    ORDER BY m.mes;
  `;

  conexion.query(sql, [year, year], (error, results) => {
    if (error) return res.status(500).send(error);

    const mesesEspanol = [
      "Enero","Febrero","Marzo","Abril","Mayo","Junio",
      "Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"
    ];

    res.set('Cache-Control', 'no-store');
    res.json({
      year,
      meses: results.map(r => mesesEspanol[r.mes - 1]),
      valores: results.map(r => Number(r.total) || 0)
    });
  });
};


// === Distribución por tipo de carga ===
exports.getDistribucionTipos = (req, res) => {
  const sqlGordos = `SELECT COUNT(*) AS total FROM cargas_gordo`;   //cuento todas las filas de cargas_gordo
  const sqlInvernada = `SELECT COUNT(*) AS total FROM cargas_invernada`;  //cuento todas las filas de cargas_invernada

  conexion.query(sqlGordos, (errG, resG) => {
    if (errG) return res.status(500).send(errG);

    conexion.query(sqlInvernada, (errI, resI) => {
      if (errI) return res.status(500).send(errI);

      res.json({
        gordos: resG[0].total || 0,  //si el valor es null mando cero
        invernada: resI[0].total || 0  //si el valor es null mando cero
      });
    });
  });
};




// === Vencimientos próximos ===
exports.getVencimientos = (req, res) => {
  const sql = `
    SELECT 
      v.idVencimiento AS id,
      v.fecha_vencimiento,
      v.tipo_carga,
      r.nro,
      CASE 
        WHEN v.tipo_carga = 'gordo' THEN p.razón_social
        ELSE pv.razón_social
      END AS productor,
      CASE 
        WHEN v.tipo_carga = 'gordo' THEN m.razón_social
        ELSE pc.razón_social
      END AS contraparte,
      -- 🔹 Cálculo dinámico del monto: monto_total / cantidad de vencimientos de esa carga
      CASE 
        WHEN v.tipo_carga = 'gordo' THEN (cg.monto_total / NULLIF(cnt.total_venc, 0))
        WHEN v.tipo_carga = 'invernada' THEN (ci.monto_total / NULLIF(cnt.total_venc, 0))
      END AS monto_vencimiento
    FROM (
      SELECT 
        vp.*, 
        ROW_NUMBER() OVER (PARTITION BY vp.id_carga ORDER BY vp.fecha_vencimiento ASC) AS nro
      FROM vencimientos_pago vp
      WHERE vp.fecha_vencimiento >= CURDATE()
    ) r
    JOIN vencimientos_pago v ON v.idVencimiento = r.idVencimiento
    -- 🔹 Contamos cuántos vencimientos tiene cada carga
    LEFT JOIN (
      SELECT id_carga, tipo_carga, COUNT(*) AS total_venc
      FROM vencimientos_pago
      GROUP BY id_carga, tipo_carga
    ) cnt ON cnt.id_carga = v.id_carga AND cnt.tipo_carga = v.tipo_carga
    -- 🔹 Unimos con las tablas de cargas
    LEFT JOIN cargas_gordo cg 
      ON v.tipo_carga = 'gordo' AND v.id_carga = cg.idCargaGordo
    LEFT JOIN cargas_invernada ci 
      ON v.tipo_carga = 'invernada' AND v.id_carga = ci.idCargaInvernada
    -- 🔹 Relaciones con actores
    LEFT JOIN productores p ON cg.idProductor = p.idProductor
    LEFT JOIN matarifes m ON cg.idMatarife = m.idMatarife
    LEFT JOIN productores pv ON ci.idProductorVendedor = pv.idProductor
    LEFT JOIN productores pc ON ci.idProductorComprador = pc.idProductor
    ORDER BY v.fecha_vencimiento ASC
    LIMIT 5
  `;

  conexion.query(sql, (error, results) => {
    if (error) {
      console.error("❌ Error en getVencimientos:", error.sqlMessage);
      return res.status(500).send(error.sqlMessage);
    }
    res.json(results);
  });
};

// === Contador de vencimientos vencidos sin pagar ===
exports.getVencimientosVencidos = (req, res) => {
  const sql = `
    SELECT COUNT(*) AS vencidos_sin_pagar
    FROM vencimientos_pago
    WHERE fecha_vencimiento < CURDATE()
      AND estado = 'pendiente'
  `;

  conexion.query(sql, (error, results) => {
    if (error) {
      console.error("❌ Error en getVencimientosVencidos:", error.sqlMessage);
      return res.status(500).send(error.sqlMessage);
    }

    const total = results[0]?.vencidos_sin_pagar || 0;
    console.log("📊 Vencimientos vencidos sin pagar:", total);
    res.json({ vencidos_sin_pagar: total });
  });
};




// === Años con cargas (gordo o invernada) ===
exports.getAniosConCargas = (req, res) => {
  const sql = `
    SELECT anio
    FROM (
      SELECT YEAR(fecha_carga) AS anio, COUNT(*) AS total
      FROM cargas_gordo
      GROUP BY YEAR(fecha_carga)
      UNION ALL
      SELECT YEAR(fecha_carga) AS anio, COUNT(*) AS total
      FROM cargas_invernada
      GROUP BY YEAR(fecha_carga)
    ) t
    GROUP BY anio
    HAVING SUM(total) > 0
    ORDER BY anio DESC;
  `;

  conexion.query(sql, (error, results) => {
    if (error) return res.status(500).send(error);

    // devuelve algo como { years: [2025, 2024, 2023] }
    res.set('Cache-Control', 'no-store');
    res.json({ years: results.map(r => r.anio) });
  });
};





// === Top 5 Productores con Mejor Promedio de Rinde ===
exports.getTopRindes = (req, res) => {
  const sql = `
    SELECT 
      p.razón_social AS productor,
      ROUND(AVG(sub.porcentaje_rinde), 2) AS promedio_rinde
    FROM (
      SELECT cg.idCargaGordo, cg.idProductor, cg.porcentaje_rinde
      FROM cargas_gordo cg
      JOIN (
        SELECT idCargaGordo, idProductor,
               ROW_NUMBER() OVER (PARTITION BY idProductor ORDER BY fecha_carga DESC) AS fila
        FROM cargas_gordo
      ) ult ON ult.idCargaGordo = cg.idCargaGordo
      WHERE ult.fila <= 3
    ) sub
    JOIN productores p ON p.idProductor = sub.idProductor
    GROUP BY sub.idProductor
    ORDER BY promedio_rinde DESC
    LIMIT 5;
  `;

  conexion.query(sql, (error, results) => {
    if (error) return res.status(500).send(error);
    res.json(results);
  });
};





