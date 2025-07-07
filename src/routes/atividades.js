const express = require('express');
const router = express.Router();
const atividadesController = require('../controllers/atividadesController');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

router.get('/', atividadesController.listar);
router.get('/:id', atividadesController.obter);
router.post('/', atividadesController.criar);
router.put('/:id', atividadesController.atualizar);
router.delete('/:id', atividadesController.excluir);
router.get('/culto/:culto_id', atividadesController.listarPorCulto);

module.exports = router;

