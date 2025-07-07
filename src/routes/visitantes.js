const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const visitantesController = require('../controllers/visitantesController');

/**
 * @swagger
 * tags:
 *   name: Visitantes
 *   description: Endpoints para gerenciamento de visitantes
 */

router.use(authenticate);

router.get('/', visitantesController.listar);
router.get('/estatisticas', visitantesController.estatisticas);
router.get('/:id', visitantesController.obter);
router.post('/', visitantesController.criar);
router.put('/:id', visitantesController.atualizar);
router.delete('/:id', visitantesController.excluir);

module.exports = router;

