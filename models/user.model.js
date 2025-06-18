const db = require('../config/db');



const User  = async(username) => {
    try {
        const [rows] = await db.query("SELECT * FROM users WHERE username = ?", [username]);
        return rows[0];
    } catch (err) {
        throw new Error("Error al buscar el usuario" + err.message);
    }
};

const createUser = async(username, password) => {
    try {
        const [result] = await db.query("INSERT INTO users (username, password) VALUES (?,?)", [username,password]);
        return result.insertId;
    } catch (err) {
        throw new Error("Error al crear el usuario" + err.message);
    }
}

module.exports = {User, createUser};