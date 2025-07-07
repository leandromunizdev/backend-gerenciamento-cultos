const express = require('express');
const router = express.Router();
const configuracaoController = require('../controllers/configuracaoController');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

router.get('/', configuracaoController.obter);
router.put('/', configuracaoController.atualizar);
router.post('/backup', configuracaoController.gerarBackup);
router.get('/sistema/status', configuracaoController.statusSistema);
router.get('/logs', configuracaoController.obterLogs);

module.exports = router;

