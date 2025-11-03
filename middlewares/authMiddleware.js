const jwt = require("jsonwebtoken");
const SECRET_KEY = process.env.SECRET_KEY;

exports.verificarToken = (req, res, next) => {
    const token = req.cookies.token;
    if (!token) {
        return res.redirect('/');
    }
    jwt.verify(token, SECRET_KEY, (err, decoded) => {
        if (err) {
            return res.status(401).send("Token inválido");
        }
        req.usuario = decoded;
        next();
    });
};

// Middleware para permitir solo a administradores
exports.verificarAdmin = (req, res, next) => {
    if (!req.usuario || req.usuario.rol !== "admin") {
        return res.status(403).send("Acceso denegado: se requiere rol administrador");
    }
    next();
};
