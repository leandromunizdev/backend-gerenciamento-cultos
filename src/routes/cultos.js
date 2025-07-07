const express = require('express');
const { authenticate, authorize } = require('../middleware/auth');
const {
  listarCultos,
  obterCulto,
  criarCulto,
  atualizarCulto,
  excluirCulto,
  atualizarStatusCulto
} = require('../controllers/cultosController');

const router = express.Router();

router.use(authenticate);

/**
 * @swagger
 * tags:
 *   name: Cultos
 *   description: Gerenciamento de cultos
 */

router.get('/',
  authorize(['read_cultos', 'manage_cultos', 'admin_sistema']),
  listarCultos
);

router.get('/:id',
  authorize(['read_cultos', 'manage_cultos', 'admin_sistema']),
  obterCulto
);

router.post('/',
  authorize(['create_cultos', 'manage_cultos', 'admin_sistema']),
  criarCulto
);

router.put('/:id',
  authorize(['update_cultos', 'manage_cultos', 'admin_sistema']),
  atualizarCulto
);

router.delete('/:id',
  authorize(['delete_cultos', 'manage_cultos', 'admin_sistema']),
  excluirCulto
);

router.patch('/:id/status',
  authorize(['update_cultos', 'manage_cultos', 'admin_sistema']),
  atualizarStatusCulto
);

module.exports = router;

