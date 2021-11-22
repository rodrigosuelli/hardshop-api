const express = require('express');
const ordersController = require('../controllers/ordersController');

const router = express.Router();

router.get('/', ordersController.index);

router.get('/:id', ordersController.show);

router.post('/', ordersController.create);

// router.put('/:id', ordersController.update);

// router.delete('/:id', ordersController.delete);

module.exports = router;
