const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User, createUser } = require('../models/user.model');


exports.register = async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ msg: "Faltan ddatos" });
    }

    try {
        const existingUser = await User(username);
        if (existingUser) {
            return res.status(400).json({ msg: "El usuario ya existe" });
        }
        const hashedPassword = bcrypt.hashSync(password, 10);
        const userId = await createUser(username, hashedPassword);

        return res.status(200).json({ msg: "Usuario registrado exitosamente", userId });
    } catch (err) {
        return res.status(500).json({ msg: "Errror al crear el usuario", error: err.message });
    }
}


exports.login =  async(req, res) => {
    const { username, password } = req.body;

    try {
        const user = await User(username);

        if (!user){
            return res.status(400).json({msg: "El usuario no existe"});
        }

        const isMatch = bcrypt.compareSync(password, user.password);

        if (!isMatch){
            return res.status(400).json({msg: "Contraseña incorrecta"});
        }

        const token = jwt.sign({ id: user.id, username: user.username, role: user.role}, process.env.JWT_SECRET, {expiresIn: '1h'});

        res.json({
            token,
            username: user.username,
            id: user.id,
            role: user.role,
            message: "Inicio de sesion exitoso"
        });
    } catch (err) {
        return res.satatus(500).json({msg: "Error all inciar sesion", error: err.message});
    }
};