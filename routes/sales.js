const express = require('express');
const router = express.Router();
const createSale = require('../controllers/salesController.js');


router.post("/", createSale.createSale);

module.exports = router;
