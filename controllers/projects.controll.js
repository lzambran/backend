const db = require('../config/db');
//  Importar el módulo de Cloudinary
const {uploadToCloudinary,deleteFromCloudinary} = require('../utils/uploadToCloudinary');


exports.getProjects = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM projects');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ msg: 'Error al obtener los proyectos', err });
  }
};

exports.getProjectById = async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await db.query('SELECT * FROM projects WHERE id = ?', [id]);

    if (rows.length === 0) {
      return res.status(404).json({ msg: 'Proyecto no encontrado' });
    }

    res.json(rows[0]); // Devuelve solo el objeto del proyecto
  } catch (err) {
    console.error('Error en getProjectById:', err);
    res.status(500).json({ msg: 'Error interno', err: err.message });
  }
};


exports.getProjectLogs = async (req, res) => {
  try {
    const [logs] = await db.query(`
      SELECT id, project_id, title, deleted_by, deleted_at, image_url, action
      FROM project_logs
      ORDER BY deleted_at DESC
    `);

    res.json(logs);
  } catch (err) {
    console.error('Error al obtener historial:', err);
    res.status(500).json({ msg: 'Error al obtener historial', err: err.message });
  }
};

exports.createProject = async (req, res) => {
  try {
    const { title, description, tecnologies, demo_url, code_url } = req.body;

    if (!req.file) {
      return res.status(400).json({ msg: 'Imagen requerida' });
    }

    const uploadResult = await uploadToCloudinary(req.file.buffer, 'imagenes');

    const [result] = await db.query(
      'INSERT INTO projects (title, description, tecnologies, demo_url, code_url, image,image_public_id) VALUES (?, ?, ?, ?, ?, ?,?)',
      [title, description, tecnologies, demo_url, code_url, uploadResult.secure_url,uploadResult.public_id]
    );

    res.json({ msg: 'Proyecto creado', id: result.insertId });
  } catch (err) {
    console.error('Error en createProject:', err);
    res.status(500).json({ msg: 'Error interno', err: err.message });
  }
};

exports.updateProject = async (req, res) => {
  try {
    const { id } = req.params;
    const {title, description, tecnologies, demo_url, code_url } = req.body;

    // TODO::1) BUSCAR EL PROYECTO ANTES DE ACTUALIZAR
    const [rows] = await db.query('SELECT * FROM projects WHERE id = ?',  [id]);
    if(rows.length === 0){
      return res.status(404).json({msg: "Proyecto no encontrado"});
    }

    const idAntiguo = rows[0].image_public_id;

    let imageUrl = null;
    let imagePublicId = null;

    if (req.file){
      // TODO:: 2) ELIMINAR LA IMAGEN ANTERIOR DE CLOUDINARY
      if(idAntiguo){
        await deleteFromCloudinary(idAntiguo);
      }

      // TODO:: 3) SUBIR LA NUEVA IMAGEN A CLOUDINARY
      const uploadResult = await uploadToCloudinary(req.file.buffer, 'imagenes');
      imageUrl = uploadResult.secure_url;
      imagePublicId = uploadResult.public_id;
    }

    // TODO:: 4) ACTUALIZAR EL PROYECTO EN LA BASE DE DATOS

    const query = `
      UPDATE projects SET
        title = ?,
        description = ?,
        tecnologies = ?,
        demo_url = ?,
        code_url = ?${imageUrl ? ', image = ?, image_public_id = ?' : ''}
      WHERE id = ?`;

    const params = [
      title,
      description,
      tecnologies,
      demo_url,
      code_url,
      ...(imageUrl ? [imageUrl, imagePublicId] : []),
      id
    ];

    await db.query(query, params);
    res.json({msg: 'Proyecto actualizado'});
  } catch (err) {
    console.error('Error en updateProject:', err);
    res.status(500).json({ msg: 'Error interno', err: err.message });
    
  }
};


exports.deleteProject = async (req, res) => {
  const { id } = req.params;

  const connection = await db.getConnection(); // ✅ Obtener conexión individual

  try {
    await connection.beginTransaction(); // ✅ Inicia transacción

    // 1. Verificar si el proyecto existe
    const [rows] = await connection.query('SELECT * FROM projects WHERE id = ?', [id]);
    if (rows.length === 0) {
      await connection.rollback();
      connection.release();
      return res.status(404).json({ msg: 'Proyecto no encontrado' });
    }

    const project = rows[0];

    // 2. Insertar en historial
    await connection.query(
      `INSERT INTO project_logs (project_id, title, deleted_by, deleted_at, image_url, action)
       VALUES (?, ?, ?, NOW(), ?, 'deleted')`,
      [project.id, project.title, req.user.id || 0, project.image]
    );

    // 3. Eliminar vistas relacionadas
    await connection.query('DELETE FROM views WHERE project_id = ?', [id]);

    // 4. Eliminar imagen en Cloudinary
    if (project.image_public_id) {
      await deleteFromCloudinary(project.image_public_id);
    }

    // 5. Eliminar el proyecto
    await connection.query('DELETE FROM projects WHERE id = ?', [id]);

    await connection.commit(); // ✅ Confirmar transacción
    res.json({ msg: 'Proyecto eliminado y registrado en historial' });
  } catch (err) {
    await connection.rollback(); // ❌ Revertir si algo falla
    res.status(500).json({ msg: 'Error al eliminar proyecto', error: err.message });
  } finally {
    connection.release(); // ✅ Liberar conexión
  }
};

