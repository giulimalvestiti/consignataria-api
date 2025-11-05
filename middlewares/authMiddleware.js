const jwt = require("jsonwebtoken");
const SECRET_KEY = process.env.SECRET_KEY;

// ✅ Middleware general de autenticación
exports.verificarToken = (req, res, next) => {
  const token =
    req.cookies.token ||
    (req.headers.authorization && req.headers.authorization.split(" ")[1]);

  if (!token) {
    // 🔹 Si el frontend llama desde fetch, devolvemos JSON
    if (req.xhr || req.headers.accept?.includes("application/json")) {
      return res
        .status(401)
        .json({ status: false, msg: "Token no proporcionado" });
    }

    // 🔹 Si es una vista (por ejemplo, acceso directo al dashboard), redirige
    return res.redirect("/");
  }

  jwt.verify(token, SECRET_KEY, (err, decoded) => {
    if (err) {
      return res
        .status(403)
        .json({ status: false, msg: "Token inválido o expirado" });
    }
    req.usuario = decoded;
    next();
  });
};

// ✅ Middleware para restringir a administradores
exports.verificarAdmin = (req, res, next) => {
  if (!req.usuario || req.usuario.rol !== "admin") {
    return res
      .status(403)
      .json({ status: false, msg: "Acceso denegado: se requiere rol administrador" });
  }
  next();
};
