const express = require('express');
const router = express.Router();

const {createViews,getMostViewedProjects} = require('../controllers/views.controll');


// router.get('/', getContacts);
router.post('/', createViews);
router.get('/most-view',getMostViewedProjects);


module.exports = router;