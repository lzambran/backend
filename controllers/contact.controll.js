const db = require('../config/db');

exports.getContacts = async (req, res) => {
    try {
        const [contact] = await db.query('SELECT * FROM contact');
        res.json(contact);
    } catch (error) {
        res.status(500).json({ msg: 'Error al obtener los contactos', error });
    }
};

exports.createContact = async (req, res) => {
    try {
        const { nombres, correo, telefono, mensaje } = req.body || {};

        if (!nombres || !correo || !telefono  || !mensaje ) {
            return res.status(400).json({ msg: 'Todos los campos son obligatorios' });
        }

        const [result] = await db.query('INSERT INTO contact (nombres, correo, telefono, mensaje) VALUES (?,?,?,?)',
            [nombres, correo, telefono, mensaje]);
        res.json({ msg: 'Contacto creado correctamente', id: result.insertId });
    } catch (error) {
        console.error('Error en createContact:', error);
        res.status(500).json({ msg: 'Error al crear el contacto', error });
    }
}