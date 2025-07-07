const express = require('express');
const router = express.Router();
const escalasController = require('../controllers/escalasController');
const { authenticate } = require('../middleware/auth');

/**
 * @swagger
 * /api/escalas/estatisticas:
 *   get:
 *     summary: Obter estatísticas de escalas
 *     tags: [Escalas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: data_inicio
 *         schema:
 *           type: string
 *           format: date
 *         description: Data de início do período
 *       - in: query
 *         name: data_fim
 *         schema:
 *           type: string
 *           format: date
 *         description: Data de fim do período
 *     responses:
 *       200:
 *         description: Estatísticas de escalas
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                     por_status:
 *                       type: array
 *                     por_funcao:
 *                       type: array
 */
router.get('/estatisticas', authenticate, escalasController.estatisticas);


/**
 * @swagger
 * components:
 *   schemas:
 *     Escala:
 *       type: object
 *       required:
 *         - pessoa_id
 *         - funcao_id
 *         - culto_id
 *         - data_escala
 *       properties:
 *         id:
 *           type: integer
 *           description: ID único da escala
 *         pessoa_id:
 *           type: integer
 *           description: ID da pessoa escalada
 *         funcao_id:
 *           type: integer
 *           description: ID da função na escala
 *         culto_id:
 *           type: integer
 *           description: ID do culto
 *         data_escala:
 *           type: string
 *           format: date-time
 *           description: Data e hora da escala
 *         observacoes:
 *           type: string
 *           description: Observações sobre a escala
 *         status_id:
 *           type: integer
 *           description: ID do status da escala
 *         data_confirmacao:
 *           type: string
 *           format: date-time
 *           description: Data de confirmação da escala
 *         criado_por:
 *           type: integer
 *           description: ID do usuário que criou a escala
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *         deletedAt:
 *           type: string
 *           format: date-time
 *           nullable: true
 *       example:
 *         id: 1
 *         pessoa_id: 1
 *         funcao_id: 1
 *         culto_id: 1
 *         data_escala: "2024-01-15T19:00:00.000Z"
 *         observacoes: "Primeira vez na função"
 *         status_id: 1
 *         criado_por: 1
 *
 *     EscalaInput:
 *       type: object
 *       required:
 *         - pessoa_id
 *         - funcao_id
 *         - culto_id
 *         - data_escala
 *       properties:
 *         pessoa_id:
 *           type: integer
 *           description: ID da pessoa a ser escalada
 *         funcao_id:
 *           type: integer
 *           description: ID da função na escala
 *         culto_id:
 *           type: integer
 *           description: ID do culto
 *         data_escala:
 *           type: string
 *           format: date-time
 *           description: Data e hora da escala
 *         observacoes:
 *           type: string
 *           description: Observações sobre a escala
 *       example:
 *         pessoa_id: 1
 *         funcao_id: 1
 *         culto_id: 1
 *         data_escala: "2024-01-15T19:00:00.000Z"
 *         observacoes: "Primeira vez na função"
 */

/**
 * @swagger
 * /api/escalas:
 *   get:
 *     summary: Listar escalas
 *     tags: [Escalas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Número da página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Itens por página
 *       - in: query
 *         name: busca
 *         schema:
 *           type: string
 *         description: Busca por observações
 *       - in: query
 *         name: data_inicio
 *         schema:
 *           type: string
 *           format: date
 *         description: Data de início do filtro
 *       - in: query
 *         name: data_fim
 *         schema:
 *           type: string
 *           format: date
 *         description: Data de fim do filtro
 *       - in: query
 *         name: funcao_id
 *         schema:
 *           type: integer
 *         description: Filtrar por função
 *       - in: query
 *         name: status_id
 *         schema:
 *           type: integer
 *         description: Filtrar por status
 *       - in: query
 *         name: pessoa_id
 *         schema:
 *           type: integer
 *         description: Filtrar por pessoa
 *       - in: query
 *         name: culto_id
 *         schema:
 *           type: integer
 *         description: Filtrar por culto
 *     responses:
 *       200:
 *         description: Lista de escalas
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Escala'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     pages:
 *                       type: integer
 */
router.get('/', authenticate, escalasController.listar);

/**
 * @swagger
 * /api/escalas/{id}:
 *   get:
 *     summary: Obter escala por ID
 *     tags: [Escalas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da escala
 *     responses:
 *       200:
 *         description: Dados da escala
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Escala'
 *       404:
 *         description: Escala não encontrada
 */
router.get('/:id', authenticate, escalasController.obter);

/**
 * @swagger
 * /api/escalas:
 *   post:
 *     summary: Criar nova escala
 *     tags: [Escalas]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/EscalaInput'
 *     responses:
 *       201:
 *         description: Escala criada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Escala'
 *                 message:
 *                   type: string
 *       400:
 *         description: Dados inválidos ou conflito
 *       404:
 *         description: Pessoa, função ou culto não encontrado
 */
router.post('/', authenticate, escalasController.criar);

/**
 * @swagger
 * /api/escalas/{id}:
 *   put:
 *     summary: Atualizar escala
 *     tags: [Escalas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da escala
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/EscalaInput'
 *     responses:
 *       200:
 *         description: Escala atualizada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Escala'
 *                 message:
 *                   type: string
 *       400:
 *         description: Dados inválidos ou escala não pode ser editada
 *       404:
 *         description: Escala não encontrada
 */
router.put('/:id', authenticate, escalasController.atualizar);

/**
 * @swagger
 * /api/escalas/{id}:
 *   delete:
 *     summary: Excluir escala
 *     tags: [Escalas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da escala
 *     responses:
 *       200:
 *         description: Escala excluída com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       400:
 *         description: Escala não pode ser excluída
 *       404:
 *         description: Escala não encontrada
 */
router.delete('/:id', authenticate, escalasController.excluir);

/**
 * @swagger
 * /api/escalas/{id}/confirmar:
 *   patch:
 *     summary: Confirmar escala
 *     tags: [Escalas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da escala
 *     responses:
 *       200:
 *         description: Escala confirmada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Escala'
 *                 message:
 *                   type: string
 *       404:
 *         description: Escala não encontrada
 */
router.patch('/:id/confirmar', authenticate, escalasController.confirmar);

/**
 * @swagger
 * /api/escalas/{id}/cancelar:
 *   patch:
 *     summary: Cancelar escala
 *     tags: [Escalas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da escala
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               motivo:
 *                 type: string
 *                 description: Motivo do cancelamento
 *     responses:
 *       200:
 *         description: Escala cancelada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Escala'
 *                 message:
 *                   type: string
 *       404:
 *         description: Escala não encontrada
 */
router.patch('/:id/cancelar', authenticate, escalasController.cancelar);

/**
 * @swagger
 * /api/escalas/pessoa/{pessoa_id}:
 *   get:
 *     summary: Listar escalas por pessoa
 *     tags: [Escalas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: pessoa_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da pessoa
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Número da página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Itens por página
 *       - in: query
 *         name: status_id
 *         schema:
 *           type: integer
 *         description: Filtrar por status
 *     responses:
 *       200:
 *         description: Lista de escalas da pessoa
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Escala'
 *                 pagination:
 *                   type: object
 */
router.get('/pessoa/:pessoa_id', authenticate, escalasController.listarPorPessoa);

module.exports = router;

