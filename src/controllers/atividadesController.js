const { Atividade, TipoAtividade, AtividadePessoa, AtividadeDepartamento, Pessoa, Departamento, Culto, TipoCulto } = require('../models');
const { Op } = require('sequelize');
const { auditLogger } = require('../middleware/logger');

/**
 * @swagger
 * components:
 *   schemas:
 *     Atividade:
 *       type: object
 *       required:
 *         - nome
 *         - tipo_atividade_id
 *         - culto_id
 *       properties:
 *         id:
 *           type: integer
 *           description: ID único da atividade
 *         nome:
 *           type: string
 *           description: Nome da atividade
 *         descricao:
 *           type: string
 *           description: Descrição da atividade
 *         tipo_atividade_id:
 *           type: integer
 *           description: ID do tipo de atividade
 *         culto_id:
 *           type: integer
 *           description: ID do culto
 *         horario_inicio:
 *           type: string
 *           format: time
 *           description: Horário de início
 *         horario_fim:
 *           type: string
 *           format: time
 *           description: Horário de fim
 *         observacoes:
 *           type: string
 *           description: Observações da atividade
 *         ativa:
 *           type: boolean
 *           description: Se a atividade está ativa
 */

/**
 * @swagger
 * /api/atividades:
 *   get:
 *     summary: Listar atividades
 *     tags: [Atividades]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: busca
 *         schema:
 *           type: string
 *         description: Buscar por nome ou descrição
 *       - in: query
 *         name: culto_id
 *         schema:
 *           type: integer
 *         description: Filtrar por culto
 *       - in: query
 *         name: tipo_atividade_id
 *         schema:
 *           type: integer
 *         description: Filtrar por tipo de atividade
 *       - in: query
 *         name: ativa
 *         schema:
 *           type: boolean
 *         description: Filtrar por atividades ativas
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
 *         description: Lista de atividades
 */
const listar = async (req, res) => {
  try {
    const {
      busca,
      culto_id,
      tipo_atividade_id,
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

    if (culto_id) {
      where.culto_id = culto_id;
    }

    if (tipo_atividade_id) {
      where.tipo_atividade_id = tipo_atividade_id;
    }

    if (ativa !== undefined) {
      where.ativa = ativa === 'true';
    }

    const { count, rows } = await Atividade.findAndCountAll({
      where,
      include: [
        {
          model: TipoAtividade,
          as: 'tipoAtividade',
          attributes: ['id', 'nome', 'cor', 'icone']
        },
        {
          model: Culto,
          as: 'culto',
          attributes: ['id', 'titulo', 'data_hora', 'local'],
          include: [
            {
              model: TipoCulto,
              as: 'tipoCulto',
              attributes: ['id', 'nome', 'cor']
            }
          ]
        },
        {
          model: AtividadePessoa,
          as: 'pessoas',
          include: [
            {
              model: Pessoa,
              as: 'pessoa',
              attributes: ['id', 'nome_completo', 'telefone', 'email']
            }
          ]
        },
        {
          model: AtividadeDepartamento,
          as: 'departamentos',
          include: [
            {
              model: Departamento,
              as: 'departamento',
              attributes: ['id', 'nome', 'cor']
            }
          ]
        }
      ],
      order: [['horario_inicio', 'ASC']],
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
    console.error('Erro ao listar atividades:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
};

/**
 * @swagger
 * /api/atividades/{id}:
 *   get:
 *     summary: Obter atividade por ID
 *     tags: [Atividades]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da atividade
 *     responses:
 *       200:
 *         description: Dados da atividade
 *       404:
 *         description: Atividade não encontrada
 */
const obter = async (req, res) => {
  try {
    const { id } = req.params;

    const atividade = await Atividade.findByPk(id, {
      include: [
        {
          model: TipoAtividade,
          as: 'tipoAtividade',
          attributes: ['id', 'nome', 'cor', 'icone']
        },
        {
          model: Culto,
          as: 'culto',
          attributes: ['id', 'titulo', 'data_hora', 'local'],
          include: [
            {
              model: TipoCulto,
              as: 'tipoCulto',
              attributes: ['id', 'nome', 'cor']
            }
          ]
        },
        {
          model: AtividadePessoa,
          as: 'pessoas',
          include: [
            {
              model: Pessoa,
              as: 'pessoa',
              attributes: ['id', 'nome_completo', 'telefone', 'email']
            }
          ]
        },
        {
          model: AtividadeDepartamento,
          as: 'departamentos',
          include: [
            {
              model: Departamento,
              as: 'departamento',
              attributes: ['id', 'nome', 'cor']
            }
          ]
        }
      ]
    });

    if (!atividade) {
      return res.status(404).json({
        success: false,
        error: 'Atividade não encontrada'
      });
    }

    res.json({
      success: true,
      data: atividade
    });

  } catch (error) {
    console.error('Erro ao obter atividade:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
};

/**
 * @swagger
 * /api/atividades:
 *   post:
 *     summary: Criar nova atividade
 *     tags: [Atividades]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Atividade'
 *     responses:
 *       201:
 *         description: Atividade criada com sucesso
 *       400:
 *         description: Dados inválidos
 */
const criar = async (req, res) => {
  try {
    const {
      nome,
      descricao,
      tipo_atividade_id,
      culto_id,
      horario_inicio,
      horario_fim,
      observacoes,
      pessoas = [],
      departamentos = []
    } = req.body;

    // Validações
    if (!nome || !tipo_atividade_id || !culto_id) {
      return res.status(400).json({
        success: false,
        error: 'Campos obrigatórios: nome, tipo_atividade_id, culto_id'
      });
    }

    // Verificar se o tipo de atividade existe
    const tipoAtividade = await TipoAtividade.findByPk(tipo_atividade_id);
    if (!tipoAtividade) {
      return res.status(404).json({
        success: false,
        error: 'Tipo de atividade não encontrado'
      });
    }

    // Verificar se o culto existe
    const culto = await Culto.findByPk(culto_id);
    if (!culto) {
      return res.status(404).json({
        success: false,
        error: 'Culto não encontrado'
      });
    }

    const atividade = await Atividade.create({
      nome,
      descricao,
      tipo_atividade_id,
      culto_id,
      horario_inicio,
      horario_fim,
      observacoes,
      ativa: true,
      criado_por: req.user.id
    });

    if (pessoas.length > 0) {
      const atividadePessoas = pessoas.map(pessoa_id => ({
        atividade_id: atividade.id,
        pessoa_id
      }));
      await AtividadePessoa.bulkCreate(atividadePessoas);
    }

    if (departamentos.length > 0) {
      const atividadeDepartamentos = departamentos.map(departamento_id => ({
        atividade_id: atividade.id,
        departamento_id
      }));
      await AtividadeDepartamento.bulkCreate(atividadeDepartamentos);
    }

    await auditLogger.log({
      usuario_id: req.user.id,
      acao: 'CREATE',
      tabela: 'atividades',
      registro_id: atividade.id,
      dados_novos: atividade.toJSON()
    });

    const atividadeCriada = await Atividade.findByPk(atividade.id, {
      include: [
        {
          model: TipoAtividade,
          as: 'tipoAtividade',
          attributes: ['id', 'nome', 'cor', 'icone']
        },
        {
          model: Culto,
          as: 'culto',
          attributes: ['id', 'titulo', 'data_hora', 'local']
        },
        {
          model: AtividadePessoa,
          as: 'pessoas',
          include: [
            {
              model: Pessoa,
              as: 'pessoa',
              attributes: ['id', 'nome_completo']
            }
          ]
        },
        {
          model: AtividadeDepartamento,
          as: 'departamentos',
          include: [
            {
              model: Departamento,
              as: 'departamento',
              attributes: ['id', 'nome']
            }
          ]
        }
      ]
    });

    res.status(201).json({
      success: true,
      data: atividadeCriada,
      message: 'Atividade criada com sucesso'
    });

  } catch (error) {
    console.error('Erro ao criar atividade:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
};

/**
 * @swagger
 * /api/atividades/{id}:
 *   put:
 *     summary: Atualizar atividade
 *     tags: [Atividades]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da atividade
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Atividade'
 *     responses:
 *       200:
 *         description: Atividade atualizada com sucesso
 *       404:
 *         description: Atividade não encontrada
 */
const atualizar = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      nome,
      descricao,
      tipo_atividade_id,
      culto_id,
      horario_inicio,
      horario_fim,
      observacoes,
      ativa,
      pessoas = [],
      departamentos = []
    } = req.body;

    const atividade = await Atividade.findByPk(id);
    if (!atividade) {
      return res.status(404).json({
        success: false,
        error: 'Atividade não encontrada'
      });
    }

    const dadosAtualizacao = {};
    if (nome) dadosAtualizacao.nome = nome;
    if (descricao !== undefined) dadosAtualizacao.descricao = descricao;
    if (tipo_atividade_id) dadosAtualizacao.tipo_atividade_id = tipo_atividade_id;
    if (culto_id) dadosAtualizacao.culto_id = culto_id;
    if (horario_inicio) dadosAtualizacao.horario_inicio = horario_inicio;
    if (horario_fim) dadosAtualizacao.horario_fim = horario_fim;
    if (observacoes !== undefined) dadosAtualizacao.observacoes = observacoes;
    if (ativa !== undefined) dadosAtualizacao.ativa = ativa;

    await atividade.update(dadosAtualizacao);

    await AtividadePessoa.destroy({ where: { atividade_id: id } });
    if (pessoas.length > 0) {
      const atividadePessoas = pessoas.map(pessoa_id => ({
        atividade_id: id,
        pessoa_id
      }));
      await AtividadePessoa.bulkCreate(atividadePessoas);
    }

    await AtividadeDepartamento.destroy({ where: { atividade_id: id } });
    if (departamentos.length > 0) {
      const atividadeDepartamentos = departamentos.map(departamento_id => ({
        atividade_id: id,
        departamento_id
      }));
      await AtividadeDepartamento.bulkCreate(atividadeDepartamentos);
    }

    const atividadeAtualizada = await Atividade.findByPk(id, {
      include: [
        {
          model: TipoAtividade,
          as: 'tipoAtividade',
          attributes: ['id', 'nome', 'cor', 'icone']
        },
        {
          model: Culto,
          as: 'culto',
          attributes: ['id', 'titulo', 'data_hora', 'local']
        },
        {
          model: AtividadePessoa,
          as: 'pessoas',
          include: [
            {
              model: Pessoa,
              as: 'pessoa',
              attributes: ['id', 'nome_completo']
            }
          ]
        },
        {
          model: AtividadeDepartamento,
          as: 'departamentos',
          include: [
            {
              model: Departamento,
              as: 'departamento',
              attributes: ['id', 'nome']
            }
          ]
        }
      ]
    });

    res.json({
      success: true,
      data: atividadeAtualizada,
      message: 'Atividade atualizada com sucesso'
    });

  } catch (error) {
    console.error('Erro ao atualizar atividade:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
};

/**
 * @swagger
 * /api/atividades/{id}:
 *   delete:
 *     summary: Excluir atividade
 *     tags: [Atividades]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da atividade
 *     responses:
 *       200:
 *         description: Atividade excluída com sucesso
 *       404:
 *         description: Atividade não encontrada
 */
const excluir = async (req, res) => {
  try {
    const { id } = req.params;

    const atividade = await Atividade.findByPk(id);
    if (!atividade) {
      return res.status(404).json({
        success: false,
        error: 'Atividade não encontrada'
      });
    }

    // Excluir associações
    await AtividadePessoa.destroy({ where: { atividade_id: id } });
    await AtividadeDepartamento.destroy({ where: { atividade_id: id } });

    // Excluir atividade (soft delete)
    await atividade.destroy();

    res.json({
      success: true,
      message: 'Atividade excluída com sucesso'
    });

  } catch (error) {
    console.error('Erro ao excluir atividade:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
};

/**
 * @swagger
 * /api/atividades/culto/{culto_id}:
 *   get:
 *     summary: Listar atividades por culto
 *     tags: [Atividades]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: culto_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do culto
 *     responses:
 *       200:
 *         description: Lista de atividades do culto
 */
const listarPorCulto = async (req, res) => {
  try {
    const { culto_id } = req.params;

    const atividades = await Atividade.findAll({
      where: {
        culto_id,
        ativa: true
      },
      include: [
        {
          model: TipoAtividade,
          as: 'tipoAtividade',
          attributes: ['id', 'nome', 'cor', 'icone']
        },
        {
          model: AtividadePessoa,
          as: 'pessoas',
          include: [
            {
              model: Pessoa,
              as: 'pessoa',
              attributes: ['id', 'nome_completo', 'telefone']
            }
          ]
        },
        {
          model: AtividadeDepartamento,
          as: 'departamentos',
          include: [
            {
              model: Departamento,
              as: 'departamento',
              attributes: ['id', 'nome', 'cor']
            }
          ]
        }
      ],
      order: [['horario_inicio', 'ASC']]
    });

    res.json({
      success: true,
      data: atividades
    });

  } catch (error) {
    console.error('Erro ao listar atividades por culto:', error);
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
  excluir,
  listarPorCulto
};

