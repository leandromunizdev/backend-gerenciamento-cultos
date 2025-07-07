const express = require('express');
const router = express.Router();
const cargosController = require('../controllers/cargosController');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);
/**
 * @swagger
 * tags:
 *   name: Cargos
 *   description: Gerenciamento de cargos eclesiásticos
 */

/**
 * @swagger
 * /api/cargos:
 *   get:
 *     summary: Listar cargos eclesiásticos
 *     tags: [Cargos]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de cargos retornada com sucesso
 *       401:
 *         description: Token de acesso inválido
 *       500:
 *         description: Erro interno do servidor
 */
router.get('/', cargosController.listar);

/**
 * @swagger
 * /api/cargos/{id}:
 *   get:
 *     summary: Obter cargo por ID
 *     tags: [Cargos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do cargo
 *     responses:
 *       200:
 *         description: Cargo retornado com sucesso
 *       404:
 *         description: Cargo não encontrado
 *       401:
 *         description: Token de acesso inválido
 *       500:
 *         description: Erro interno do servidor
 */
router.get('/:id', cargosController.obter);

module.exports = router;

