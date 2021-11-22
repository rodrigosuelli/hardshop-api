const express = require('express');
const productsController = require('../controllers/productsController');

const router = express.Router();

router.get('/', productsController.index);

router.get('/:id', productsController.show);

router.post('/', productsController.create);

router.put('/:id', productsController.update);

router.delete('/:id', productsController.delete);

module.exports = router;
