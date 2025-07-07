const express = require('express');
const router = express.Router();
const funcoesController = require('../controllers/funcoesController');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

router.get('/', funcoesController.listar);
router.get('/:id', funcoesController.obter);
router.post('/', funcoesController.criar);
router.put('/:id', funcoesController.atualizar);
router.delete('/:id', funcoesController.excluir);

module.exports = router;

