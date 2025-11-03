const mySQL = require("../conexion");

exports.obtenerEventos = (req, res) => {
  mySQL.conexion.query("SELECT * FROM eventos", (err, results) => {
    if (err) {
      console.error("Error al obtener eventos:", err);
      return res.status(500).json({ error: "Error al obtener eventos" });
    }
    res.json(results);
  });
};

exports.guardarEvento = (req, res) => {
  const { id, title, start, color, description } = req.body;
  
  // Validar campos obligatorios
  if (!title || !start) {
    return res.status(400).json({ error: "El título y la fecha son obligatorios", status: false });
  }
  
  if (id) {
    // Actualizar evento existente
    mySQL.conexion.query(
      "UPDATE eventos SET title=?, start=?, color=?, description=? WHERE id=?",
      [title, start, color, description, id],
      (err) => {
        if (err) {
          console.error("Error al actualizar el evento:", err);
          return res.status(500).json({ error: "Error al actualizar el evento" });
        }
        res.json({ msg: "Evento actualizado", status: true });
      }
    );
  } else {
    // Insertar nuevo evento
    mySQL.conexion.query(
      "INSERT INTO eventos (title, start, color, description) VALUES (?, ?, ?, ?)",
      [title, start, color, description || ""],
      (err) => {
        if (err) {
          console.error("Error al guardar el evento:", err);
          return res.status(500).json({ error: "Error al guardar el evento" });
        }
        res.json({ msg: "Evento guardado", status: true });
      }
    );
  }
};

exports.eliminarEvento = (req, res) => {
  const { id } = req.params;
  
  if (!id) {
    return res.status(400).json({ error: "ID del evento no proporcionado", status: false });
  }
  
  mySQL.conexion.query("DELETE FROM eventos WHERE id = ?", [id], (err) => {
    if (err) {
      console.error("Error al eliminar el evento:", err);
      return res.status(500).json({ error: "Error al eliminar el evento" });
    }
    res.json({ msg: "Evento eliminado", status: true });
  });
};
