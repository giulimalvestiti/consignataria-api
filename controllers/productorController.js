const mySQL = require("../conexion");

exports.obtenerProductores = (req, res) => {
    mySQL.conexion.query('SELECT * FROM productores', (error, filas) => {
        if (error) return res.status(500).send(error);
        res.send(filas);
    });
};

exports.obtenerProductor = (req, res) => {
    mySQL.conexion.query(
        'SELECT * FROM productores WHERE idProductor = ?',
        [req.params.idProductor],
        (error, fila) => {
            if (error) return res.status(500).send(error);
            res.send(fila);
        }
    );
};

exports.crearProductor = (req, res) => {
    const data = {
        cuit: req.body.cuit,
        razón_social: req.body.razón_social,
        teléfono: req.body.teléfono,
        mail: req.body.mail,
        dirección: req.body.dirección,
        descripción: req.body.descripción
    };
    mySQL.conexion.query("INSERT INTO productores SET ?", data, (error, results) => {
        if (error) return res.status(500).send(error);
        Object.assign(data, { id: results.insertId });
        res.send(data);
    });
};

exports.editarProductor = (req, res) => {
    const { cuit, razón_social, teléfono, mail, dirección, descripción } = req.body;
    const idProductor = req.params.idProductor;
    mySQL.conexion.query(
        "UPDATE productores SET cuit = ?, razón_social = ?, teléfono = ?, mail = ?, dirección = ?, descripción = ? WHERE idProductor = ?",
        [cuit, razón_social, teléfono, mail, dirección, descripción, idProductor],
        (error, results) => {
            if (error) return res.status(500).send(error);
            res.send(results);
        }
    );
};

exports.eliminarProductor = (req, res) => {
  const id = req.params.idProductor;

  mySQL.conexion.query(
    'DELETE FROM productores WHERE idProductor = ?',
    [id],
    (error, result) => {
      if (error) {
        // Si MySQL lanza un error por restricción de clave foránea
        if (error.code === 'ER_ROW_IS_REFERENCED_2' || error.errno === 1451) {
          return res
            .status(400)
            .send('No es posible eliminar este productor porque tiene cargas asignadas.');
        }

        //  Cualquier otro error inesperado (sin mostrar en consola)
        return res.status(500).send('Error eliminando productor.');
      }

      // Si no se eliminó ninguna fila (id inexistente)
      if (result.affectedRows === 0) {
        return res.status(404).send('El productor no existe.');
      }

      // Todo correcto
      res.send('Productor eliminado correctamente.');
    }
  );
};


