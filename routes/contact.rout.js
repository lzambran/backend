const express = require('express');
const router = express.Router();

const {getContacts,createContact} = require('../controllers/contact.controll');


router.get('/', getContacts);
router.post('/', createContact);


module.exports = router;