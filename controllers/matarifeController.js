const mySQL = require("../conexion");

exports.obtenerMatarifes = (req, res) => {
  mySQL.conexion.query('SELECT * FROM matarifes', (error, filas) => {
    if (error) return res.status(500).send(error);
    res.send(filas);
  });
};

exports.obtenerMatarife = (req, res) => {
  mySQL.conexion.query(
    'SELECT * FROM matarifes WHERE idMatarife = ?',
    [req.params.idMatarife],
    (error, fila) => {
      if (error) return res.status(500).send(error);
      res.send(fila);
    }
  );
};

exports.crearMatarife = (req, res) => {
  const data = {
    cuit: req.body.cuit,
    razón_social: req.body.razón_social,
    teléfono: req.body.teléfono,
    mail: req.body.mail,
    dirección: req.body.dirección,
    descripción: req.body.descripción
  };
  mySQL.conexion.query("INSERT INTO matarifes SET ?", data, (error, results) => {
    if (error) return res.status(500).send(error);
    Object.assign(data, { idMatarife: results.insertId });
    res.send(data);
  });
};

exports.editarMatarife = (req, res) => {
  const idMatarife = req.params.idMatarife;
  const { cuit, razón_social, teléfono, mail, dirección, descripción } = req.body;
  mySQL.conexion.query(
    "UPDATE matarifes SET cuit = ?, razón_social = ?, teléfono = ?, mail = ?, dirección = ?, descripción = ? WHERE idMatarife = ?",
    [cuit, razón_social, teléfono, mail, dirección, descripción, idMatarife],
    (error, results) => {
      if (error) return res.status(500).send(error);
      res.send(results);
    }
  );
};

exports.eliminarMatarife = (req, res) => {
  const id = req.params.idMatarife;

  mySQL.conexion.query(
    'DELETE FROM matarifes WHERE idMatarife = ?',
    [id],
    (error, result) => {
      if (error) {
        // Si tiene cargas asociadas → no mostrar error técnico en consola
        if (error.code === 'ER_ROW_IS_REFERENCED_2' || error.errno === 1451) {
          return res
            .status(400)
            .send('No es posible eliminar este matarife porque tiene cargas asignadas.');
        }

        // Otros errores (silenciosos también)
        return res.status(500).send('Error eliminando matarife.');
      }

      // Si no se encontró el registro
      if (result.affectedRows === 0) {
        return res.status(404).send('El matarife no existe.');
      }

      // Eliminado correctamente
      res.send('Matarife eliminado correctamente.');
    }
  );
};




