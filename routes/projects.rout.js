const express = require('express');
const jwt = require('jsonwebtoken');
const upload = require('../middlewares/upload');
const router = express.Router();
const isAdmin = require('../middlewares/isAdmin');

const {getProjects,createProject, updateProject,deleteProject,getProjectLogs,getProjectById} = require('../controllers/projects.controll');


// Midddleware para verificar el token
const verifyToken = (req, res, next) => {
    const token = req.headers['authorization'];

    if (!token) return res.status(403).json({ msg: 'Token requerido' });

    try {
        const decoded = jwt.verify(token.split(' ')[1], process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(401).json({ msg: 'Token inválido' });
    }
};


router.get('/', getProjects);
router.post('/', verifyToken,isAdmin, upload.single('image'), createProject);
router.put('/:id', verifyToken,isAdmin, upload.single('image'), updateProject);
router.delete('/:id', verifyToken,isAdmin, deleteProject);
router.get('/project-logs',verifyToken,isAdmin, getProjectLogs);
router.get('/:id', getProjectById); 


// router.get('/', verifyToken);


module.exports = router;