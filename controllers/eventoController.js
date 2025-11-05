const mySQL = require("../conexion");

exports.obtenerEventos = (req, res) => {
  mySQL.conexion.query("SELECT * FROM eventos", (err, results) => {
    if (err) {
      console.error("Error al obtener eventos:", err);
      return res.status(500).json({ status: false, msg: "Error al obtener eventos" });
    }
    res.json(results);
  });
};

exports.guardarEvento = (req, res) => {
  const { id, title, start, color, description } = req.body;

  if (!title || !start) {
    return res
      .status(400)
      .json({ status: false, msg: "El título y la fecha son obligatorios" });
  }

  if (id) {
    // 🔹 Actualizar evento existente
    mySQL.conexion.query(
      "UPDATE eventos SET title=?, start=?, color=?, description=? WHERE id=?",
      [title, start, color, description, id],
      (err) => {
        if (err) {
          console.error("Error al actualizar el evento:", err);
          return res
            .status(500)
            .json({ status: false, msg: "Error al actualizar el evento" });
        }
        res.json({ status: true, msg: "Evento actualizado correctamente" });
      }
    );
  } else {
    // 🔹 Crear nuevo evento
    mySQL.conexion.query(
      "INSERT INTO eventos (title, start, color, description) VALUES (?, ?, ?, ?)",
      [title, start, color, description || ""],
      (err) => {
        if (err) {
          console.error("Error al guardar el evento:", err);
          return res
            .status(500)
            .json({ status: false, msg: "Error al guardar el evento" });
        }
        res.json({ status: true, msg: "Evento guardado correctamente" });
      }
    );
  }
};

exports.eliminarEvento = (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res
      .status(400)
      .json({ status: false, msg: "ID del evento no proporcionado" });
  }

  mySQL.conexion.query("DELETE FROM eventos WHERE id = ?", [id], (err) => {
    if (err) {
      console.error("Error al eliminar el evento:", err);
      return res
        .status(500)
        .json({ status: false, msg: "Error al eliminar el evento" });
    }
    res.json({ status: true, msg: "Evento eliminado correctamente" });
  });
};
