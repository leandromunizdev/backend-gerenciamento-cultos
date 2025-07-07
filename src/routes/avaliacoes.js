const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const avaliacoesController = require('../controllers/avaliacoesController');

/**
 * @swagger
 * tags:
 *   name: Avaliações
 *   description: Endpoints para gerenciamento de avaliações públicas
 */

router.post('/publica', avaliacoesController.criarPublica);
router.get('/criterios', avaliacoesController.listarCriterios);

router.use(authenticate);

router.get('/', avaliacoesController.listar);
router.get('/estatisticas', avaliacoesController.estatisticas);
router.get('/:id', avaliacoesController.obter);
router.delete('/:id', avaliacoesController.excluir);

module.exports = router;

