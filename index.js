const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config();


// const db = require('./config/db');


// TODO: llamando rutas

const authRoutes = require('./routes/auth.rout');
const projectsRoutes = require('./routes/projects.rout');
const contactRoutes = require('./routes/contact.rout');
const viewsRoutes = require('./routes/views.rout');

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));



app.use('/api/auth', authRoutes);
app.use('/api/projects', projectsRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/views', viewsRoutes);



const PORT  = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Sevidor corriendo en el puerto ${PORT}`));