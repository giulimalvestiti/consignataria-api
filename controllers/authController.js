const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");
const mySQL = require("../conexion");
const SECRET_KEY = process.env.SECRET_KEY;


exports.login = async (req, res) => {
    const { usuario, contraseña } = req.body;
    if (!usuario || !contraseña) {
        return res.status(400).send("Usuario y/o contraseña no pueden estar vacíos");
    }
    mySQL.conexion.query(
        "SELECT * FROM usuarios WHERE usuario = ?",
        [usuario],
        async (error, resultados) => {
            if (error) {
                console.error("Error en la consulta:", error);
                return res.status(500).send("Error en el servidor");
            }
            if (resultados.length === 0) {
                return res.status(401).send("Usuario y/o contraseña incorrectos");
            }
            const usuarioDB = resultados[0];
            const contraseñaCorrecta = await bcryptjs.compare(contraseña, usuarioDB.contraseña);
            if (!contraseñaCorrecta) {
                return res.status(401).send("Usuario y/o contraseña incorrectos");
            }
            const token = jwt.sign(
                { id: usuarioDB.id, 
                  usuario: usuarioDB.usuario,
                  rol: usuarioDB.rol },
                SECRET_KEY,
                { expiresIn: "1h" }
            );
            res.cookie("token", token, {
                httpOnly: true,  //evita q la cookie sea leida con javascript
                secure: process.env.NODE_ENV === "production",  //aca solo viaja por HTTPS
                sameSite: "Strict" //otra capa de seguridad
            });
            return res.send("Login Correcto");
        }
    );
};

exports.logout = (req, res) => {
    res.clearCookie("token");
    return res.send("Sesión cerrada");
};

exports.verify = (req, res) => {
    if (!req.usuario) {
        return res.status(401).send("No autorizado");
    }
    res.json({ 
        id: req.usuario.id, 
        usuario: req.usuario.usuario,
        rol: req.usuario.rol 
    });
};
