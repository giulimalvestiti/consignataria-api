const mySQL = require("../conexion");

// helpers
const num = v => (v === '' || v == null) ? null : Number(String(v).replace(',', '.'));
const bit = v => v ? 1 : 0;


// Obtener todas las cargas invernada
exports.obtenerCargasInvernada = (req, res) => {
  const sql = `
    SELECT 
      c.idCargaInvernada,
      c.fecha_carga,
      c.idProductorVendedor,
      c.idProductorComprador,
      c.idTransporte,
      pv.razón_social AS productor_vendedor,
      pc.razón_social AS productor_comprador,
      t.razón_social AS transporte,
      c.kilogramos_bruto,
      c.kilogramos_tara,
      c.kilogramos_neto,
      c.porcentaje_desbaste,
      c.neto_con_desbaste,
      c.precio_al_vendedor,
      c.machos,
      c.hembras,
      c.total_animales,
      c.descripcion,
      c.monto_total,
      c.monto_total_con_iva,
      c.precio_al_comprador,
      c.porcentaje_comision_comprador,
      c.porcentaje_comision_vendedor,
      c.ganancia_comision_comprador,
      c.ganancia_comision_vendedor,
      c.porcentaje_comision_intermediario,
      c.ganancia_en_precio,
      c.ganancia_total,
      c.iva_vendedor,
      c.iva_comprador,
      c.cheque_fisico_vendedor,
      c.cheque_fisico_comprador,
      c.cheque_electronico_vendedor,
      c.cheque_electronico_comprador,
      c.transferencia_vendedor,
      c.transferencia_comprador,
      c.efectivo_vendedor,
      c.efectivo_comprador,
      c.gastos_transporte,
      c.gastos_comision_intermediario,
      c.monto_a_pagar_comprador,
      c.monto_a_pagar_comprador_con_iva
    FROM cargas_invernada c
    LEFT JOIN productores pv ON c.idProductorVendedor = pv.idProductor
    LEFT JOIN productores pc ON c.idProductorComprador = pc.idProductor
    LEFT JOIN transportes t ON c.idTransporte = t.idTransporte
  `;
  mySQL.conexion.query(sql, (error, filas) => {
    if (error) return res.status(500).send(error);
    res.send(filas);
  });
};


// Crear carga invernada
exports.crearCargaInvernada = (req, res) => {
  const d = req.body;

  const sql = `
    INSERT INTO cargas_invernada (
      idProductorVendedor, idProductorComprador, idTransporte, fecha_carga,
      kilogramos_bruto, kilogramos_tara, porcentaje_desbaste,
      precio_al_vendedor, machos, hembras, descripcion,
      precio_al_comprador, porcentaje_comision_comprador, porcentaje_comision_vendedor,
      porcentaje_comision_intermediario,
      cheque_electronico_vendedor, cheque_electronico_comprador, cheque_fisico_vendedor, cheque_fisico_comprador,
      transferencia_vendedor, transferencia_comprador,
      gastos_transporte
    )
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
  `;

const values = [
  num(d.idProductorVendedor),        // 1
  num(d.idProductorComprador),       // 2
  num(d.idTransporte),               // 3
  d.fecha_carga || null,             // 4
  num(d.kilogramos_bruto),           // 5
  num(d.kilogramos_tara),            // 6
  num(d.porcentaje_desbaste),        // 7
  num(d.precio_al_vendedor),         // 8
  num(d.machos) ?? 0,                // 9
  num(d.hembras) ?? 0,               // 10
  (d.descripcion?.trim() || null),   // 11
  num(d.precio_al_comprador),        // 12
  num(d.porcentaje_comision_comprador), // 13
  num(d.porcentaje_comision_vendedor),  // 14
  num(d.porcentaje_comision_intermediario), // 15
  num(d.cheque_electronico_vendedor), // 16
  num(d.cheque_electronico_comprador), // 17
  num(d.cheque_fisico_vendedor),      // 18
  num(d.cheque_fisico_comprador),     // 19
  num(d.transferencia_vendedor),      // 20
  num(d.transferencia_comprador),     // 21
  num(d.gastos_transporte) ?? 0       // 22
];


  mySQL.conexion.query(sql, values, (error, results) => {
    if (error) {
      console.error('Insert cargas_invernada ERROR:', error.sqlMessage, '\nSQL:', sql, '\nVALUES length:', values.length, '\nVALUES:', values);
      return res.status(500).json({ error: error.sqlMessage || String(error) });
    }

    const id = results.insertId;

    // Vencimientos
    let vencimientos = Array.isArray(d.fechas_vencimiento) ? d.fechas_vencimiento : [];
    if (vencimientos.length === 0) return res.json({ success: true, id });

    const insertVto = `
      INSERT INTO vencimientos_pago (tipo_carga, id_carga, fecha_vencimiento)
      VALUES ?
    `;
    const vtoData = vencimientos.filter(Boolean).map(v => ['invernada', id, v]);
    if (vtoData.length === 0) return res.json({ success: true, id });

    mySQL.conexion.query(insertVto, [vtoData], (err2) => {
      if (err2) {
        console.error('Insert vencimientos ERROR:', err2.sqlMessage, '\nSQL:', insertVto, '\nVALUES:', vtoData);
        return res.status(500).json({ error: err2.sqlMessage || String(err2) });
      }
      res.json({ success: true, id });
    });
  });
};


// Editar una carga invernada
exports.editarCargaInvernada = (req, res) => {
  const idCargaInvernada = req.params.idCargaInvernada;

  // Validar cuerpo recibido
  if (!req.body) {
    return res.status(400).send("No se recibió ningún cuerpo de datos");
  }

  // Desestructurar todos los campos que vienen del frontend
  const {
    idProductorVendedor,
    idProductorComprador,
    idTransporte,
    fecha_carga,
    kilogramos_bruto,
    kilogramos_tara,
    porcentaje_desbaste,
    precio_al_vendedor,
    machos,
    hembras,
    descripcion,
    precio_al_comprador,
    porcentaje_comision_comprador,
    porcentaje_comision_vendedor,
    porcentaje_comision_intermediario,
    cheque_fisico_vendedor,
    cheque_fisico_comprador,
    cheque_electronico_vendedor,
    cheque_electronico_comprador,
    transferencia_vendedor,
    transferencia_comprador,
    gastos_transporte,
    fechas_vencimiento = [] // 👈 nuevo array opcional
  } = req.body;


  // Query para actualizar sin tocar columnas generadas
  const sql = `
    UPDATE cargas_invernada SET
      idProductorVendedor = ?, 
      idProductorComprador = ?, 
      idTransporte = ?, 
      fecha_carga = ?, 
      kilogramos_bruto = ?, 
      kilogramos_tara = ?, 
      porcentaje_desbaste = ?, 
      precio_al_vendedor = ?, 
      machos = ?, 
      hembras = ?, 
      descripcion = ?, 
      precio_al_comprador = ?, 
      porcentaje_comision_comprador = ?, 
      porcentaje_comision_vendedor = ?, 
      porcentaje_comision_intermediario = ?,
      cheque_fisico_vendedor = ?, 
      cheque_fisico_comprador = ?, 
      cheque_electronico_vendedor = ?, 
      cheque_electronico_comprador = ?, 
      transferencia_vendedor = ?, 
      transferencia_comprador = ?,
      gastos_transporte = ?
    WHERE idCargaInvernada = ?
  `;

  const values = [
    idProductorVendedor,
    idProductorComprador,
    idTransporte,
    fecha_carga,
    kilogramos_bruto,
    kilogramos_tara,
    porcentaje_desbaste,
    precio_al_vendedor,
    machos,
    hembras,
    descripcion,
    precio_al_comprador,
    porcentaje_comision_comprador,
    porcentaje_comision_vendedor,
    porcentaje_comision_intermediario,
    cheque_fisico_vendedor,
    cheque_fisico_comprador,
    cheque_electronico_vendedor,
    cheque_electronico_comprador,
    transferencia_vendedor,
    transferencia_comprador,
    gastos_transporte,
    idCargaInvernada
  ];

  // Ejecutar UPDATE
  mySQL.conexion.query(sql, values, (error, results) => {
    if (error) {
      console.error("Error al actualizar carga invernada:", error);
      return res.status(500).send(error);
    }

    // 🧹 Borrar vencimientos previos
    const deleteQuery = `
      DELETE FROM vencimientos_pago
      WHERE tipo_carga = 'invernada' AND id_carga = ?
    `;
    mySQL.conexion.query(deleteQuery, [idCargaInvernada], (errDelete) => {
      if (errDelete) {
        console.error("Error al eliminar vencimientos previos:", errDelete);
        return res.status(500).send(errDelete);
      }

      // Insertar nuevos vencimientos (si existen)
      if (fechas_vencimiento.length > 0) {
        const vencimientosData = fechas_vencimiento.map(f => ["invernada", idCargaInvernada, f]);
        const insertQuery = `
          INSERT INTO vencimientos_pago (tipo_carga, id_carga, fecha_vencimiento)
          VALUES ?
        `;
        mySQL.conexion.query(insertQuery, [vencimientosData], (errInsert) => {
          if (errInsert) {
            console.error("Error insertando nuevos vencimientos:", errInsert);
            return res.status(500).send(errInsert);
          }
          res.json({ message: "Carga invernada actualizada correctamente con vencimientos", results });
        });
      } else {
        res.json({ message: "Carga invernada actualizada correctamente (sin vencimientos)", results });
      }
    });
  });
};


// Eliminar carga invernada
exports.eliminarCargaInvernada = (req, res) => {
  const id = req.params.idCargaInvernada;
  mySQL.conexion.query("DELETE FROM vencimientos_pago WHERE tipo_carga='invernada' AND id_carga=?", [id], (err1) => {
    if (err1) return res.status(500).send(err1);
    mySQL.conexion.query("DELETE FROM cargas_invernada WHERE idCargaInvernada=?", [id], (err2, result) => {
      if (err2) return res.status(500).send(err2);
      res.json(result);
    });
  });
};

