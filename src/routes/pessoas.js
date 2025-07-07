const express = require('express');
const router = express.Router();
const pessoasController = require('../controllers/pessoasController');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

router.get('/', pessoasController.listar);
router.get('/estatisticas', pessoasController.estatisticas);
router.get('/:id', pessoasController.obter);
router.post('/', pessoasController.criar);
router.put('/:id', pessoasController.atualizar);
router.delete('/:id', pessoasController.excluir);

module.exports = router;

