const mySQL = require("../conexion");
const bcryptjs = require('bcryptjs');

//Traigo los usuarios para mostrarlos en la tabla
exports.listar = (req, res) => {
  const sql = `
    SELECT id, usuario, nomb_ape, email, COALESCE(rol,'usuario') AS rol
    FROM usuarios
    ORDER BY id DESC
  `;
  mySQL.conexion.query(sql, (err, rows) => {
    if (err) {
      console.error('Error listando usuarios:', err);
      return res.status(500).send('Error listando usuarios');
    }
    res.json(rows);
  });
};

exports.crear = async (req, res) => {
  try {
    const { nombre, email, usuario, contraseña, rol } = req.body;
    if (!nombre || !email || !usuario || !contraseña) {
      return res.status(400).send('Datos incompletos');
    }
    if (/\s/.test(usuario)) {
      return res.status(400).send('El usuario no debe contener espacios');
    }

    // Solo admin puede elegir rol, sino forzamos "usuario"
    const rolAsignado = req.user?.rol === 'admin' ? (rol || 'usuario') : 'usuario';

    // validar contraseña como en login
    const PASS_RE = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (!PASS_RE.test(contraseña)) {
      return res.status(400).send('Contraseña inválida');
    }

    const existeSql = 'SELECT 1 FROM usuarios WHERE usuario=? OR email=?';
    mySQL.conexion.query(existeSql, [usuario, email], async (e, r) => {
      if (e) return res.status(500).send('Error verificando usuario');
      if (r.length) return res.status(400).send('Usuario o email ya existen');

      const hash = await bcryptjs.hash(contraseña, 8);
      const ins = 'INSERT INTO usuarios SET ?';
      const data = { usuario, contraseña: hash, email, nomb_ape: nombre, rol: rolAsignado };
      mySQL.conexion.query(ins, data, (err2) => {
        if (err2) {
          console.error('Error insertando usuario:', err2);
          return res.status(500).send('Error creando usuario');
        }
        res.send('Usuario creado');
      });
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error en el servidor');
  }
};


//Edito un usuario
exports.editar = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, email, usuario, rol, contraseña } = req.body;

    const fields = [];
    const values = [];

    if (nombre != null) { fields.push('nomb_ape=?'); values.push(nombre); }
    if (email  != null) { fields.push('email=?'); values.push(email); }
    if (usuario!= null) { fields.push('usuario=?'); values.push(usuario); }

    // ✅ ahora siempre permite actualizar rol
    if (rol) {
      fields.push('rol=?'); 
      values.push(rol);
    }

    if (contraseña) {
      const PASS_RE = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
      if (!PASS_RE.test(contraseña)) {
        return res.status(400).send('Contraseña inválida');
      }
      const hash = await bcryptjs.hash(contraseña, 8);
      fields.push('contraseña=?'); values.push(hash);
    }

    if (!fields.length) return res.send('Sin cambios');

    const sql = `UPDATE usuarios SET ${fields.join(', ')} WHERE id=?`;
    values.push(id);

    mySQL.conexion.query(sql, values, (err) => {
      if (err) {
        console.error('Error actualizando usuario:', err);
        return res.status(500).send('Error actualizando usuario');
      }
      res.send('Usuario actualizado');
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error en el servidor');
  }
};


//Borro un usuario
exports.borrar = (req, res) => {
  const { id } = req.params;
  mySQL.conexion.query('DELETE FROM usuarios WHERE id=?', [id], (err) => {
    if (err) {
      console.error('Error eliminando usuario:', err);
      return res.status(500).send('Error eliminando usuario');
    }
    res.send('Usuario eliminado');
  });
};
