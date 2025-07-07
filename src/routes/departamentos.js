const express = require('express');
const router = express.Router();
const departamentosController = require('../controllers/departamentosController');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

/**
 * @swagger
 * tags:
 *   name: Departamentos
 *   description: Gerenciamento de departamentos
 */

/**
 * @swagger
 * /api/departamentos:
 *   get:
 *     summary: Listar departamentos
 *     tags: [Departamentos]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de departamentos retornada com sucesso
 *       401:
 *         description: Token de acesso inválido
 *       500:
 *         description: Erro interno do servidor
 */
router.get('/', departamentosController.listar);

/**
 * @swagger
 * /api/departamentos/{id}:
 *   get:
 *     summary: Obter departamento por ID
 *     tags: [Departamentos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do departamento
 *     responses:
 *       200:
 *         description: Departamento retornado com sucesso
 *       404:
 *         description: Departamento não encontrado
 *       401:
 *         description: Token de acesso inválido
 *       500:
 *         description: Erro interno do servidor
 */
router.get('/:id', departamentosController.obter);

module.exports = router;

