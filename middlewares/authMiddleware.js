const jwt = require("jsonwebtoken");
const SECRET_KEY = process.env.SECRET_KEY;

exports.verificarToken = (req, res, next) => {
  const token =
    req.cookies.token ||
    (req.headers.authorization && req.headers.authorization.split(" ")[1]);

  if (!token) {
    // 🔹 Si es un fetch desde el frontend (pedidos AJAX)
    if (req.xhr || req.headers.accept?.includes("application/json")) {
      return res.status(401).json({ status: false, msg: "Token no proporcionado" });
    }

    // 🔹 Si es un acceso directo desde el navegador
    return res.redirect("/");
  }

  jwt.verify(token, SECRET_KEY, (err, decoded) => {
    if (err) {
      return res.status(403).json({ status: false, msg: "Token inválido o expirado" });
    }
    req.usuario = decoded;
    next();
  });
};

