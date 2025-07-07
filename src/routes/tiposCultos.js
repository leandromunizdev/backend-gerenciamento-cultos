const express = require('express');
const { authenticate, authorize } = require('../middleware/auth');
const {
  listarTiposCultos,
  criarTipoCulto,
  atualizarTipoCulto
} = require('../controllers/tiposCultosController');

const router = express.Router();

router.use(authenticate);

/**
 * @swagger
 * tags:
 *   name: Tipos de Cultos
 *   description: Gerenciamento de tipos de cultos
 */

router.get('/',
  authorize(['read_cultos', 'manage_cultos', 'admin_sistema']),
  listarTiposCultos
);

router.post('/',
  authorize(['manage_cultos', 'admin_sistema']),
  criarTipoCulto
);

router.put('/:id',
  authorize(['manage_cultos', 'admin_sistema']),
  atualizarTipoCulto
);

module.exports = router;

