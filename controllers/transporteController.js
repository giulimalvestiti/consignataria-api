const mySQL = require("../conexion");

exports.obtenerTransportes = (req, res) => {
  mySQL.conexion.query('SELECT * FROM transportes', (error, filas) => {
    if (error) return res.status(500).send(error);
    res.send(filas);
  });
};

exports.obtenerTransporte = (req, res) => {
  mySQL.conexion.query(
    'SELECT * FROM transportes WHERE idTransporte = ?',
    [req.params.idTransporte],
    (error, fila) => {
      if (error) return res.status(500).send(error);
      res.send(fila);
    }
  );
};

exports.crearTransporte = (req, res) => {
  const data = {
    cuit: req.body.cuit,
    razón_social: req.body.razón_social,
    teléfono: req.body.teléfono,
    mail: req.body.mail,
    dirección: req.body.dirección,
    descripción: req.body.descripción
  };
  mySQL.conexion.query("INSERT INTO transportes SET ?", data, (error, results) => {
    if (error) return res.status(500).send(error);
    Object.assign(data, { idTransporte: results.insertId });
    res.send(data);
  });
};

exports.editarTransporte = (req, res) => {
  const idTransporte = req.params.idTransporte;
  const { cuit, razón_social, teléfono, mail, dirección, descripción } = req.body;
  mySQL.conexion.query(
    "UPDATE transportes SET cuit = ?, razón_social = ?, teléfono = ?, mail = ?, dirección = ?, descripción = ? WHERE idTransporte = ?",
    [cuit, razón_social, teléfono, mail, dirección, descripción, idTransporte],
    (error, results) => {
      if (error) return res.status(500).send(error);
      res.send(results);
    }
  );
};

exports.eliminarTransporte = (req, res) => {
  const id = req.params.idTransporte;

  mySQL.conexion.query(
    'DELETE FROM transportes WHERE idTransporte = ?',
    [id],
    (error, result) => {
      if (error) {
        // 🔹 Si MySQL lanza un error por restricción de clave foránea
        if (error.code === 'ER_ROW_IS_REFERENCED_2' || error.errno === 1451) {
          return res
            .status(400)
            .send('No es posible eliminar este transporte porque tiene cargas asignadas.');
        }

        // 🔹 Cualquier otro error inesperado (no se muestra en consola)
        return res.status(500).send('Error eliminando transporte.');
      }

      // 🔹 Si no se eliminó ninguna fila (id inexistente)
      if (result.affectedRows === 0) {
        return res.status(404).send('El transporte no existe.');
      }

      // 🔹 Todo correcto
      res.send('Transporte eliminado correctamente.');
    }
  );
};


