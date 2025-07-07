const { Funcao } = require('../models');
const { Op } = require('sequelize');
const { auditLogger } = require('../middleware/logger');

/**
 * @swagger
 * components:
 *   schemas:
 *     Funcao:
 *       type: object
 *       required:
 *         - nome
 *       properties:
 *         id:
 *           type: integer
 *           description: ID único da função
 *         nome:
 *           type: string
 *           description: Nome da função
 *         descricao:
 *           type: string
 *           description: Descrição da função
 *         cor:
 *           type: string
 *           description: Cor da função (hex)
 *         ativa:
 *           type: boolean
 *           description: Se a função está ativa
 */

/**
 * @swagger
 * /api/funcoes:
 *   get:
 *     summary: Listar funções
 *     tags: [Funções]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: busca
 *         schema:
 *           type: string
 *         description: Buscar por nome ou descrição
 *       - in: query
 *         name: ativa
 *         schema:
 *           type: boolean
 *         description: Filtrar por funções ativas
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Limite por página
 *     responses:
 *       200:
 *         description: Lista de funções
 */
const listar = async (req, res) => {
    try {
        const {
            busca,
            ativa,
            page = 1,
            limit = 10
        } = req.query;

        const offset = (page - 1) * limit;
        const where = {};

        // Filtros
        if (busca) {
            where[Op.or] = [
                { nome: { [Op.iLike]: `%${busca}%` } },
                { descricao: { [Op.iLike]: `%${busca}%` } }
            ];
        }

        if (ativa !== undefined) {
            where.ativa = ativa === 'true';
        }

        const { count, rows } = await Funcao.findAndCountAll({
            where,
            order: [['nome', 'ASC']],
            limit: parseInt(limit),
            offset: parseInt(offset)
        });

        res.json({
            success: true,
            data: rows,
            pagination: {
                total: count,
                page: parseInt(page),
                limit: parseInt(limit),
                pages: Math.ceil(count / limit)
            }
        });

    } catch (error) {
        console.error('Erro ao listar funções:', error);
        res.status(500).json({
            success: false,
            error: 'Erro interno do servidor'
        });
    }
};

/**
 * @swagger
 * /api/funcoes/{id}:
 *   get:
 *     summary: Obter função por ID
 *     tags: [Funções]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da função
 *     responses:
 *       200:
 *         description: Dados da função
 *       404:
 *         description: Função não encontrada
 */
const obter = async (req, res) => {
    try {
        const { id } = req.params;

        const funcao = await Funcao.findByPk(id);

        if (!funcao) {
            return res.status(404).json({
                success: false,
                error: 'Função não encontrada'
            });
        }

        res.json({
            success: true,
            data: funcao
        });

    } catch (error) {
        console.error('Erro ao obter função:', error);
        res.status(500).json({
            success: false,
            error: 'Erro interno do servidor'
        });
    }
};

/**
 * @swagger
 * /api/funcoes:
 *   post:
 *     summary: Criar nova função
 *     tags: [Funções]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Funcao'
 *     responses:
 *       201:
 *         description: Função criada com sucesso
 *       400:
 *         description: Dados inválidos
 */
const criar = async (req, res) => {
    try {
        const { nome, descricao, cor } = req.body;

        // Validações
        if (!nome) {
            return res.status(400).json({
                success: false,
                error: 'Nome é obrigatório'
            });
        }

        // Verificar se já existe função com o mesmo nome
        const funcaoExistente = await Funcao.findOne({ where: { nome } });
        if (funcaoExistente) {
            return res.status(400).json({
                success: false,
                error: 'Já existe uma função com este nome'
            });
        }

        // Criar função
        const funcao = await Funcao.create({
            nome,
            descricao,
            cor,
            ativa: true,
            criado_por: req.user.id
        });

        await auditLogger.log({
            usuario_id: req.user.id,
            acao: 'CREATE',
            tabela: 'funcoes',
            registro_id: funcao.id,
            dados_novos: funcao.toJSON()
        });

        res.status(201).json({
            success: true,
            data: funcao,
            message: 'Função criada com sucesso'
        });

    } catch (error) {
        console.error('Erro ao criar função:', error);
        res.status(500).json({
            success: false,
            error: 'Erro interno do servidor'
        });
    }
};

/**
 * @swagger
 * /api/funcoes/{id}:
 *   put:
 *     summary: Atualizar função
 *     tags: [Funções]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da função
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Funcao'
 *     responses:
 *       200:
 *         description: Função atualizada com sucesso
 *       404:
 *         description: Função não encontrada
 */
const atualizar = async (req, res) => {
    try {
        const { id } = req.params;
        const { nome, descricao, cor, ativa } = req.body;

        const funcao = await Funcao.findByPk(id);
        if (!funcao) {
            return res.status(404).json({
                success: false,
                error: 'Função não encontrada'
            });
        }

        // Verificar se já existe outra função com o mesmo nome
        if (nome && nome !== funcao.nome) {
            const funcaoExistente = await Funcao.findOne({
                where: {
                    nome,
                    id: { [Op.ne]: id }
                }
            });
            if (funcaoExistente) {
                return res.status(400).json({
                    success: false,
                    error: 'Já existe uma função com este nome'
                });
            }
        }

        // Atualizar campos
        const dadosAtualizacao = {};
        if (nome) dadosAtualizacao.nome = nome;
        if (descricao !== undefined) dadosAtualizacao.descricao = descricao;
        if (cor) dadosAtualizacao.cor = cor;
        if (ativa !== undefined) dadosAtualizacao.ativa = ativa;

        await funcao.update(dadosAtualizacao);

        res.json({
            success: true,
            data: funcao,
            message: 'Função atualizada com sucesso'
        });

    } catch (error) {
        console.error('Erro ao atualizar função:', error);
        res.status(500).json({
            success: false,
            error: 'Erro interno do servidor'
        });
    }
};

/**
 * @swagger
 * /api/funcoes/{id}:
 *   delete:
 *     summary: Excluir função
 *     tags: [Funções]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da função
 *     responses:
 *       200:
 *         description: Função excluída com sucesso
 *       404:
 *         description: Função não encontrada
 */
const excluir = async (req, res) => {
    try {
        const { id } = req.params;

        const funcao = await Funcao.findByPk(id);
        if (!funcao) {
            return res.status(404).json({
                success: false,
                error: 'Função não encontrada'
            });
        }

        await funcao.destroy();

        res.json({
            success: true,
            message: 'Função excluída com sucesso'
        });

    } catch (error) {
        console.error('Erro ao excluir função:', error);
        res.status(500).json({
            success: false,
            error: 'Erro interno do servidor'
        });
    }
};

module.exports = {
    listar,
    obter,
    criar,
    atualizar,
    excluir
};

