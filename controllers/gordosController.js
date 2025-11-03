const mySQL = require("../conexion");

// Obtener todas las cargas gordo
exports.obtenerCargasGordo = (req, res) => {
  const sql = `
    SELECT 
      c.idCargaGordo,
      c.fecha_carga,
      c.fecha_faena,
      c.idProductor,
      c.idMatarife,
      c.idTransporte,
      p.razón_social AS productor,
      m.razón_social AS matarife,
      t.razón_social AS transporte,
      c.kilogramos_bruto,
      c.kilogramos_tara,
      c.kilogramos_neto,
      c.kilogramos_faenado,
      c.porcentaje_desbaste,
      c.neto_con_desbaste,
      c.precio_al_productor,
      c.precio_matarife,
      c.porcentaje_comision,
      c.ganancia_comision,
      c.ganancia_en_precio,
      c.ganancia_total,
      c.monto_total,
      c.ret_ganancia,
      c.iva,
      c.cheque_fisico,
      c.cheque_electronico,
      c.transferencia,
      c.efectivo,
      c.gastos_transporte,
      c.machos,
      c.hembras,
      c.total_animales,
      c.descripcion,
      c.porcentaje_rinde
    FROM cargas_gordo c
    LEFT JOIN productores p ON c.idProductor = p.idProductor
    LEFT JOIN matarifes m ON c.idMatarife = m.idMatarife
    LEFT JOIN transportes t ON c.idTransporte = t.idTransporte
  `;
  mySQL.conexion.query(sql, (error, filas) => {
    if (error) return res.status(500).send(error);
    res.send(filas);
  });
};

// Obtener una carga gordo por ID
exports.obtenerCargaGordo = (req, res) => {
  const sql = "SELECT * FROM cargas_gordo WHERE idCargaGordo = ?";
  mySQL.conexion.query(sql, [req.params.idCargaGordo], (error, fila) => {
    if (error) return res.status(500).send(error);
    res.send(fila);
  });
};

// Crear una nueva carga gordo
exports.crearCargaGordo = (req, res) => {
  const data = {
    idProductor: req.body.idProductor,
    idMatarife: req.body.idMatarife,
    idTransporte: req.body.idTransporte,
    fecha_carga: req.body.fecha_carga,
    fecha_faena: req.body.fecha_faena,
    kilogramos_bruto: req.body.kilogramos_bruto,
    kilogramos_tara: req.body.kilogramos_tara,
    kilogramos_faenado: req.body.kilogramos_faenado,
    porcentaje_desbaste: req.body.porcentaje_desbaste,
    precio_al_productor: req.body.precio_al_productor,
    precio_matarife: req.body.precio_matarife,
    porcentaje_comision: req.body.porcentaje_comision,
    ret_ganancia: req.body.ret_ganancia,
    iva: req.body.iva,
    cheque_fisico: req.body.cheque_fisico,
    cheque_electronico: req.body.cheque_electronico,
    transferencia: req.body.transferencia,
    gastos_transporte: req.body.gastos_transporte,
    machos: req.body.machos,
    hembras: req.body.hembras,
    descripcion: req.body.descripcion
  };

  mySQL.conexion.query("INSERT INTO cargas_gordo SET ?", data, (error, results) => {
    if (error) return res.status(500).send(error);

    const idCargaGordo = results.insertId;
    const vencimientos = req.body.fechas_vencimiento || [];

    if (vencimientos.length === 0) {
      return res.send({ ...data, idCargaGordo });
    }

    // ✔ CORREGIDO: nuevo insert para tabla general de vencimientos
    const vencimientosData = vencimientos.map(fecha => ["gordo", idCargaGordo, fecha]);
    const insertQuery = `
      INSERT INTO vencimientos_pago (tipo_carga, id_carga, fecha_vencimiento)
      VALUES ?
    `;

    mySQL.conexion.query(insertQuery, [vencimientosData], (error2) => {
      if (error2) return res.status(500).send(error2);
      res.send({ ...data, idCargaGordo });
    });
  });
};



// Editar una carga gordo
exports.editarCargaGordo = (req, res) => {
  const idCargaGordo = req.params.idCargaGordo;

  // Datos generales de la carga
  const {
    idProductor, idMatarife, idTransporte,
    fecha_carga, fecha_faena,
    kilogramos_bruto, kilogramos_tara,
    kilogramos_faenado, porcentaje_desbaste,
    precio_al_productor, precio_matarife,
    porcentaje_comision, ret_ganancia, iva,
    cheque_fisico, cheque_electronico, transferencia, gastos_transporte,
    machos, hembras, descripcion,
    fechas_vencimiento = [] // 👈 nuevo
  } = req.body;

  // Query para actualizar la carga
  const sql = `
    UPDATE cargas_gordo SET
      idProductor = ?, idMatarife = ?, idTransporte = ?,
      fecha_carga = ?, fecha_faena = ?,
      kilogramos_bruto = ?, kilogramos_tara = ?,
      kilogramos_faenado = ?, porcentaje_desbaste = ?,
      precio_al_productor = ?, precio_matarife = ?,
      porcentaje_comision = ?, ret_ganancia = ?, iva = ?,
      cheque_fisico = ?, cheque_electronico = ?, transferencia = ?, gastos_transporte = ?,
      machos = ?, hembras = ?, descripcion = ?
    WHERE idCargaGordo = ?
  `;

  const values = [
    idProductor, idMatarife, idTransporte,
    fecha_carga, fecha_faena,
    kilogramos_bruto, kilogramos_tara,
    kilogramos_faenado, porcentaje_desbaste,
    precio_al_productor, precio_matarife,
    porcentaje_comision, ret_ganancia, iva,
    cheque_fisico, cheque_electronico, transferencia, gastos_transporte,
    machos, hembras, descripcion,
    idCargaGordo
  ];

  // Ejecuta la actualización
  mySQL.conexion.query(sql, values, (error, results) => {
    if (error) return res.status(500).send(error);

    // Primero borra los vencimientos anteriores
   const deleteQuery = `
  DELETE FROM vencimientos_pago
  WHERE tipo_carga = 'gordo' AND id_carga = ?
  `;
    mySQL.conexion.query(deleteQuery, [idCargaGordo], (errDelete) => {
      if (errDelete) return res.status(500).send(errDelete);

      // Si hay nuevas fechas, las inserta
      if (fechas_vencimiento.length > 0) {
        const vencimientosData = fechas_vencimiento.map(fecha => ["gordo", idCargaGordo, fecha]);
        const insertQuery = `
          INSERT INTO vencimientos_pago (tipo_carga, id_carga, fecha_vencimiento)
          VALUES ?
        `;
        mySQL.conexion.query(insertQuery, [vencimientosData], (errInsert) => {
          if (errInsert) return res.status(500).send(errInsert);
          res.send(results);
        });
      } else {
        // Si no hay fechas, responde igual
        res.send(results);
      }
    });
  });
};


// Eliminar una carga gordo
exports.eliminarCargaGordo = (req, res) => {
  const idCargaGordo = req.params.idCargaGordo;

  // Primero elimina los vencimientos asociados
  const borrarVencimientos = `
    DELETE FROM vencimientos_pago 
    WHERE tipo_carga = 'gordo' AND id_carga = ?
  `;

  mySQL.conexion.query(borrarVencimientos, [idCargaGordo], (errorV) => {
    if (errorV) return res.status(500).send(errorV);

    // Luego elimina la carga
    const borrarCarga = "DELETE FROM cargas_gordo WHERE idCargaGordo = ?";
    mySQL.conexion.query(borrarCarga, [idCargaGordo], (errorC, filas) => {
      if (errorC) return res.status(500).send(errorC);
      res.send(filas);
    });
  });
};

