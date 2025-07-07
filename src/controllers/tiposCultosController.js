const { TipoCulto } = require('../models');

/**
 * @swagger
 * /api/tipos-cultos:
 *   get:
 *     summary: Listar tipos de cultos
 *     tags: [Tipos de Cultos]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de tipos de cultos
 */
const listarTiposCultos = async (req, res) => {
  try {
    const tiposCultos = await TipoCulto.findAll({
      where: { ativo: true },
      order: [['nome', 'ASC']]
    });

    res.json({
      success: true,
      data: tiposCultos
    });

  } catch (error) {
    console.error('Erro ao listar tipos de cultos:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
};

/**
 * @swagger
 * /api/tipos-cultos:
 *   post:
 *     summary: Criar tipo de culto
 *     tags: [Tipos de Cultos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nome:
 *                 type: string
 *               descricao:
 *                 type: string
 *               cor:
 *                 type: string
 *     responses:
 *       201:
 *         description: Tipo de culto criado
 */
const criarTipoCulto = async (req, res) => {
  try {
    const { nome, descricao, cor } = req.body;

    if (!nome) {
      return res.status(400).json({
        success: false,
        error: 'Nome é obrigatório'
      });
    }

    const tipoCulto = await TipoCulto.create({
      nome,
      descricao,
      cor,
      ativo: true
    });

    res.status(201).json({
      success: true,
      data: tipoCulto,
      message: 'Tipo de culto criado com sucesso'
    });

  } catch (error) {
    console.error('Erro ao criar tipo de culto:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
};

/**
 * @swagger
 * /api/tipos-cultos/{id}:
 *   put:
 *     summary: Atualizar tipo de culto
 *     tags: [Tipos de Cultos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nome:
 *                 type: string
 *               descricao:
 *                 type: string
 *               cor:
 *                 type: string
 *               ativo:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Tipo de culto atualizado
 */
const atualizarTipoCulto = async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, descricao, cor, ativo } = req.body;

    const tipoCulto = await TipoCulto.findByPk(id);
    if (!tipoCulto) {
      return res.status(404).json({
        success: false,
        error: 'Tipo de culto não encontrado'
      });
    }

    await tipoCulto.update({
      nome: nome || tipoCulto.nome,
      descricao: descricao !== undefined ? descricao : tipoCulto.descricao,
      cor: cor || tipoCulto.cor,
      ativo: ativo !== undefined ? ativo : tipoCulto.ativo
    });

    res.json({
      success: true,
      data: tipoCulto,
      message: 'Tipo de culto atualizado com sucesso'
    });

  } catch (error) {
    console.error('Erro ao atualizar tipo de culto:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
};

module.exports = {
  listarTiposCultos,
  criarTipoCulto,
  atualizarTipoCulto
};

