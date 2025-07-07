const express = require('express');
const router = express.Router();
const perfisController = require('../controllers/perfisController');
const { authorize, authenticate } = require('../middleware/auth');

/**
 * @swagger
 * tags:
 *   name: Perfis
 *   description: Gerenciamento de perfis e permissões
 */

/**
 * @swagger
 * /api/perfis:
 *   get:
 *     summary: Listar perfis
 *     tags: [Perfis]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Página atual
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
 *         description: Buscar por nome
 *       - in: query
 *         name: ativo
 *         schema:
 *           type: boolean
 *         description: Filtrar por status ativo
 *       - in: query
 *         name: nivel_acesso
 *         schema:
 *           type: integer
 *         description: Filtrar por nível de acesso
 *     responses:
 *       200:
 *         description: Lista de perfis retornada com sucesso
 *       401:
 *         description: Token de acesso inválido
 *       403:
 *         description: Sem permissão para acessar
 *       500:
 *         description: Erro interno do servidor
 */
router.get('/', perfisController.listar);

/**
 * @swagger
 * /api/perfis/todos:
 *   get:
 *     summary: Listar todos os perfis (sem paginação)
 *     tags: [Perfis]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de perfis retornada com sucesso
 *       401:
 *         description: Token de acesso inválido
 *       500:
 *         description: Erro interno do servidor
 */
router.get('/todos', perfisController.listarTodos);

/**
 * @swagger
 * /api/perfis/permissoes:
 *   get:
 *     summary: Listar todas as permissões disponíveis
 *     tags: [Perfis]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de permissões retornada com sucesso
 *       401:
 *         description: Token de acesso inválido
 *       403:
 *         description: Sem permissão para acessar
 *       500:
 *         description: Erro interno do servidor
 */
router.get('/permissoes', perfisController.listarPermissoes);

/**
 * @swagger
 * /api/perfis/estatisticas:
 *   get:
 *     summary: Obter estatísticas de perfis
 *     tags: [Perfis]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Estatísticas retornadas com sucesso
 *       401:
 *         description: Token de acesso inválido
 *       403:
 *         description: Sem permissão para acessar
 *       500:
 *         description: Erro interno do servidor
 */
router.get('/estatisticas', perfisController.estatisticas);

/**
 * @swagger
 * /api/perfis/{id}:
 *   get:
 *     summary: Obter perfil por ID
 *     tags: [Perfis]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do perfil
 *     responses:
 *       200:
 *         description: Perfil retornado com sucesso
 *       404:
 *         description: Perfil não encontrado
 *       401:
 *         description: Token de acesso inválido
 *       403:
 *         description: Sem permissão para acessar
 *       500:
 *         description: Erro interno do servidor
 */
router.get('/:id', perfisController.obter);

/**
 * @swagger
 * /api/perfis:
 *   post:
 *     summary: Criar novo perfil
 *     tags: [Perfis]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nome
 *               - nivel_acesso
 *             properties:
 *               nome:
 *                 type: string
 *                 description: Nome do perfil
 *               descricao:
 *                 type: string
 *                 description: Descrição do perfil
 *               nivel_acesso:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 10
 *                 description: Nível de acesso (1-10)
 *               ativo:
 *                 type: boolean
 *                 default: true
 *                 description: Se o perfil está ativo
 *               permissoes:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 description: IDs das permissões associadas
 *     responses:
 *       201:
 *         description: Perfil criado com sucesso
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Token de acesso inválido
 *       403:
 *         description: Sem permissão para criar
 *       500:
 *         description: Erro interno do servidor
 */
router.post('/', perfisController.criar);

/**
 * @swagger
 * /api/perfis/{id}:
 *   put:
 *     summary: Atualizar perfil
 *     tags: [Perfis]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do perfil
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nome:
 *                 type: string
 *                 description: Nome do perfil
 *               descricao:
 *                 type: string
 *                 description: Descrição do perfil
 *               nivel_acesso:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 10
 *                 description: Nível de acesso (1-10)
 *               ativo:
 *                 type: boolean
 *                 description: Se o perfil está ativo
 *               permissoes:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 description: IDs das permissões associadas
 *     responses:
 *       200:
 *         description: Perfil atualizado com sucesso
 *       400:
 *         description: Dados inválidos
 *       404:
 *         description: Perfil não encontrado
 *       401:
 *         description: Token de acesso inválido
 *       403:
 *         description: Sem permissão para atualizar
 *       500:
 *         description: Erro interno do servidor
 */
router.put('/:id', perfisController.atualizar);

/**
 * @swagger
 * /api/perfis/{id}/toggle-ativo:
 *   patch:
 *     summary: Ativar/Desativar perfil
 *     tags: [Perfis]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do perfil
 *     responses:
 *       200:
 *         description: Status do perfil alterado com sucesso
 *       404:
 *         description: Perfil não encontrado
 *       401:
 *         description: Token de acesso inválido
 *       403:
 *         description: Sem permissão para alterar status
 *       500:
 *         description: Erro interno do servidor
 */
router.patch('/:id/toggle-ativo', perfisController.toggleAtivo);

/**
 * @swagger
 * /api/perfis/{id}:
 *   delete:
 *     summary: Excluir perfil
 *     tags: [Perfis]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do perfil
 *     responses:
 *       200:
 *         description: Perfil excluído com sucesso
 *       400:
 *         description: Perfil em uso por usuários
 *       404:
 *         description: Perfil não encontrado
 *       401:
 *         description: Token de acesso inválido
 *       403:
 *         description: Sem permissão para excluir
 *       500:
 *         description: Erro interno do servidor
 */
router.delete('/:id', perfisController.excluir);

module.exports = router;

