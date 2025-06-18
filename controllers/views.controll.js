const db = require('../config/db');

exports.createViews = async (req, res) => {
    const { projectId } = req.body;

    // Obtener la IP del cliente de forma más precisa
    const ipAddress = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

    console.log("🔍 Registro de vista recibido:", { projectId, ipAddress });

    // Validar que se envíe el ID
    if (!projectId) {
        return res.status(400).json({ msg: 'El ID del proyecto es requerido' });
    }

    try {
        // Verificar si el proyecto existe
        const [projects] = await db.query("SELECT id FROM projects WHERE id = ?", [projectId]);

        if (projects.length === 0) {
            return res.status(404).json({ message: `No existe el proyecto con id ${projectId}. Verifica que esté creado.` });
        }

        // Insertar la vista
        const [result] = await db.query(
            "INSERT INTO views (project_id, ip_address) VALUES (?, ?)",
            [projectId, ipAddress]
        );

        res.status(201).json({
            message: "Vista registrada correctamente",
            insertId: result.insertId
        });

    } catch (error) {
        console.error("❌ Error al registrar vista:", error);
        res.status(500).json({
            message: "Error interno del servidor",
            error: error.message
        });
    }
};

// Retorna los proyectos más vistos (top 5 por defecto)
exports.getMostViewedProjects = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT p.id, p.title, COUNT(v.id) AS views
      FROM projects p
      JOIN views v ON p.id = v.project_id
      GROUP BY p.id, p.title
      ORDER BY views DESC
      LIMIT 5
    `);
    res.json(rows);
  } catch (error) {
    console.error("Error al obtener proyectos más vistos:", error);
    res.status(500).json({ message: "Error al consultar las vistas" });
  }
};

