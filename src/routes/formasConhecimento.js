const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const formasConhecimentoController = require('../controllers/formasConhecimentoController');

/**
 * @swagger
 * tags:
 *   name: Formas de Conhecimento
 *   description: Endpoints para formas de conhecimento da igreja
 */

router.use(authenticate);

router.get('/', formasConhecimentoController.listar);
router.get('/:id', formasConhecimentoController.obter);

module.exports = router;

