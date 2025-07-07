const express = require('express');
const router = express.Router();
const usuariosController = require('../controllers/usuariosController');
const { authenticate, authorize } = require('../middleware/auth');

/**
 * @swagger
 * tags:
 *   name: Usuários
 *   description: Gerenciamento de usuários do sistema
 */

/**
 * @swagger
 * /api/usuarios:
 *   get:
 *     summary: Listar usuários
 *     tags: [Usuários]
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
 *         description: Buscar por email
 *       - in: query
 *         name: perfil_id
 *         schema:
 *           type: integer
 *         description: Filtrar por perfil
 *       - in: query
 *         name: ativo
 *         schema:
 *           type: boolean
 *         description: Filtrar por status ativo
 *       - in: query
 *         name: email_verificado
 *         schema:
 *           type: boolean
 *         description: Filtrar por email verificado
 *     responses:
 *       200:
 *         description: Lista de usuários retornada com sucesso
 *       401:
 *         description: Token de acesso inválido
 *       403:
 *         description: Sem permissão para acessar
 *       500:
 *         description: Erro interno do servidor
 */
router.get('/', usuariosController.listar);

/**
 * @swagger
 * /api/usuarios/estatisticas:
 *   get:
 *     summary: Obter estatísticas de usuários
 *     tags: [Usuários]
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
router.get('/estatisticas', usuariosController.estatisticas);

/**
 * @swagger
 * /api/usuarios/{id}:
 *   get:
 *     summary: Obter usuário por ID
 *     tags: [Usuários]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do usuário
 *     responses:
 *       200:
 *         description: Usuário retornado com sucesso
 *       404:
 *         description: Usuário não encontrado
 *       401:
 *         description: Token de acesso inválido
 *       403:
 *         description: Sem permissão para acessar
 *       500:
 *         description: Erro interno do servidor
 */
router.get('/:id', usuariosController.obter);

/**
 * @swagger
 * /api/usuarios:
 *   post:
 *     summary: Criar novo usuário
 *     tags: [Usuários]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - senha
 *               - perfil_id
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Email do usuário
 *               senha:
 *                 type: string
 *                 minLength: 6
 *                 description: Senha do usuário
 *               perfil_id:
 *                 type: integer
 *                 description: ID do perfil
 *               pessoa_id:
 *                 type: integer
 *                 description: ID da pessoa associada
 *               ativo:
 *                 type: boolean
 *                 default: true
 *                 description: Se o usuário está ativo
 *               email_verificado:
 *                 type: boolean
 *                 default: false
 *                 description: Se o email foi verificado
 *     responses:
 *       201:
 *         description: Usuário criado com sucesso
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Token de acesso inválido
 *       403:
 *         description: Sem permissão para criar
 *       500:
 *         description: Erro interno do servidor
 */
router.post('/', usuariosController.criar);

/**
 * @swagger
 * /api/usuarios/{id}:
 *   put:
 *     summary: Atualizar usuário
 *     tags: [Usuários]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do usuário
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Email do usuário
 *               perfil_id:
 *                 type: integer
 *                 description: ID do perfil
 *               pessoa_id:
 *                 type: integer
 *                 description: ID da pessoa associada
 *               ativo:
 *                 type: boolean
 *                 description: Se o usuário está ativo
 *               email_verificado:
 *                 type: boolean
 *                 description: Se o email foi verificado
 *     responses:
 *       200:
 *         description: Usuário atualizado com sucesso
 *       400:
 *         description: Dados inválidos
 *       404:
 *         description: Usuário não encontrado
 *       401:
 *         description: Token de acesso inválido
 *       403:
 *         description: Sem permissão para atualizar
 *       500:
 *         description: Erro interno do servidor
 */
router.put('/:id', usuariosController.atualizar);

/**
 * @swagger
 * /api/usuarios/{id}/senha:
 *   patch:
 *     summary: Alterar senha do usuário
 *     tags: [Usuários]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do usuário
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - senha_atual
 *               - nova_senha
 *             properties:
 *               senha_atual:
 *                 type: string
 *                 description: Senha atual do usuário
 *               nova_senha:
 *                 type: string
 *                 minLength: 6
 *                 description: Nova senha do usuário
 *     responses:
 *       200:
 *         description: Senha alterada com sucesso
 *       400:
 *         description: Dados inválidos ou senha atual incorreta
 *       404:
 *         description: Usuário não encontrado
 *       401:
 *         description: Token de acesso inválido
 *       500:
 *         description: Erro interno do servidor
 */
router.patch('/:id/senha', usuariosController.alterarSenha);

/**
 * @swagger
 * /api/usuarios/{id}/resetar-senha:
 *   patch:
 *     summary: Resetar senha do usuário (admin)
 *     tags: [Usuários]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do usuário
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nova_senha
 *             properties:
 *               nova_senha:
 *                 type: string
 *                 minLength: 6
 *                 description: Nova senha do usuário
 *     responses:
 *       200:
 *         description: Senha resetada com sucesso
 *       400:
 *         description: Dados inválidos
 *       404:
 *         description: Usuário não encontrado
 *       401:
 *         description: Token de acesso inválido
 *       403:
 *         description: Sem permissão para resetar senha
 *       500:
 *         description: Erro interno do servidor
 */
router.patch('/:id/resetar-senha', usuariosController.resetarSenha);

/**
 * @swagger
 * /api/usuarios/{id}/toggle-ativo:
 *   patch:
 *     summary: Ativar/Desativar usuário
 *     tags: [Usuários]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do usuário
 *     responses:
 *       200:
 *         description: Status do usuário alterado com sucesso
 *       404:
 *         description: Usuário não encontrado
 *       401:
 *         description: Token de acesso inválido
 *       403:
 *         description: Sem permissão para alterar status
 *       500:
 *         description: Erro interno do servidor
 */
router.patch('/:id/toggle-ativo', usuariosController.toggleAtivo);

/**
 * @swagger
 * /api/usuarios/{id}:
 *   delete:
 *     summary: Excluir usuário
 *     tags: [Usuários]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do usuário
 *     responses:
 *       200:
 *         description: Usuário excluído com sucesso
 *       404:
 *         description: Usuário não encontrado
 *       401:
 *         description: Token de acesso inválido
 *       403:
 *         description: Sem permissão para excluir
 *       500:
 *         description: Erro interno do servidor
 */
router.delete('/:id', usuariosController.excluir);

module.exports = router;

