const express = require("express");  //framework para crear API, creo una instancia de express
const cors = require("cors"); //la API permite peticiones desde otros dominios, ej front
const path = require("path");  //para rutas de archivo
const cookieParser = require('cookie-parser');  //manejo de cookiess
const dotenv = require('dotenv'); //variables de entorno

dotenv.config();

const app = express(); //creo una isntancia de express

// Middlewares globales
app.use(cors({
  origin: [
    "http://localhost:3001", 
    "https://consignataria-front.onrender.com"
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'] // Permite cabeceras adicionales
}));
 //permite que el servidor reciba solicitudes de otros orígenes.
app.use(express.json()); //transforma una peticion entrante JSON en un objeto JS accesible
app.use(cookieParser()); //permite leer y trabajar con las cookies

//esto sirve para que cuando presiono la flecha del navegador no me vuelva al menu o sea desabilita el cache
app.use((req, res, next) => {
    res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.set('Pragma', 'no-cache'); 
    res.set('Expires', '0');
    next();
  });
  

// Archivos estáticos (funciona tanto en local como en Render/Railway)
const publicPath = path.resolve(__dirname, '../Front/public');
app.use(express.static(publicPath));



// Importar las rutas
const htmlRoutes = require('./routes/htmlRoutes');
const usuariosRoutes = require('./routes/usuariosRoutes');
const authRoutes = require('./routes/authRoutes');
const productorRoutes = require('./routes/productorRoutes');
const matarifeRoutes = require('./routes/matarifeRoutes');
const transporteRoutes = require('./routes/transporteRoutes');
const eventoRoutes = require('./routes/eventoRoutes');
const gordosRoutes = require('./routes/gordosRoutes');
const invernadasRoutes = require('./routes/invernadasRoutes');
const vencimientosRoutes = require("./routes/vencimientosRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");

// Usar las rutas
app.use('/', htmlRoutes);
app.use('/api/usuarios', usuariosRoutes);
app.use('/api', authRoutes);
app.use('/api/productores', productorRoutes);
app.use('/api/matarifes', matarifeRoutes);
app.use('/api/transportes', transporteRoutes);
app.use('/api/eventos', eventoRoutes);
app.use('/api/gordos', gordosRoutes);
app.use('/api/invernadas', invernadasRoutes);
app.use('/api/vencimientos', vencimientosRoutes);
app.use('/api/dashboard', dashboardRoutes);



const PORT = process.env.PORT || 3001; // Usa el puerto del .env o 3001 por defecto
app.listen(PORT, () => {
    console.log("Servidor en línea");
    console.log(`Corriendo en: http://localhost:${PORT}`);
});
