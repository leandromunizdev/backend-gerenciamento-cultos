const { Op } = require('sequelize');
const {
  Culto,
  TipoCulto,
  StatusCulto,
  Usuario,
  Pessoa,
  Atividade,
  TipoAtividade,
  Escala,
  Funcao,
  StatusEscala
} = require('../models');

/**
 * @swagger
 * components:
 *   schemas:
 *     Culto:
 *       type: object
 *       required:
 *         - titulo
 *         - data_culto
 *         - horario_inicio
 *         - tipo_culto_id
 *       properties:
 *         id:
 *           type: integer
 *         titulo:
 *           type: string
 *           maxLength: 255
 *         descricao:
 *           type: string
 *         data_culto:
 *           type: string
 *           format: date
 *         horario_inicio:
 *           type: string
 *           format: time
 *         horario_fim:
 *           type: string
 *           format: time
 *         local:
 *           type: string
 *         observacoes:
 *           type: string
 *         tipo_culto_id:
 *           type: integer
 *         status_id:
 *           type: integer
 *         criado_por:
 *           type: integer
 */

/**
 * @swagger
 * /api/cultos:
 *   get:
 *     summary: Listar cultos
 *     tags: [Cultos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: busca
 *         schema:
 *           type: string
 *       - in: query
 *         name: data_inicio
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: data_fim
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: tipo_culto_id
 *         schema:
 *           type: integer
 *       - in: query
 *         name: status_id
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Lista de cultos
 */
const listarCultos = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      busca,
      data_inicio,
      data_fim,
      tipo_culto_id,
      status_id,
      ordenar_por = 'data_culto',
      ordem = 'ASC'
    } = req.query;

    // Construir filtros
    const where = {};

    if (busca) {
      where[Op.or] = [
        { titulo: { [Op.iLike]: `%${busca}%` } },
        { descricao: { [Op.iLike]: `%${busca}%` } },
        { local: { [Op.iLike]: `%${busca}%` } }
      ];
    }

    if (data_inicio) {
      where.data_culto = { [Op.gte]: data_inicio };
    }

    if (data_fim) {
      where.data_culto = {
        ...where.data_culto,
        [Op.lte]: data_fim
      };
    }

    if (tipo_culto_id) {
      where.tipo_culto_id = tipo_culto_id;
    }

    if (status_id) {
      where.status_id = status_id;
    }

    // Calcular offset
    const offset = (parseInt(page) - 1) * parseInt(limit);

    // Buscar cultos
    const { count, rows: cultos } = await Culto.findAndCountAll({
      where,
      include: [
        {
          model: TipoCulto,
          as: 'tipoCulto',
          attributes: ['id', 'nome', 'cor']
        },
        {
          model: StatusCulto,
          as: 'status',
          attributes: ['id', 'nome', 'cor']
        },
        {
          model: Usuario,
          as: 'criador',
          attributes: ['id', 'email'],
          include: [{
            model: Pessoa,
            as: 'pessoa',
            attributes: ['nome_completo', 'whatsapp']
          }]
        }
      ],
      order: [[ordenar_por, ordem.toUpperCase()]],
      limit: parseInt(limit),
      offset,
      distinct: true
    });

    // Calcular estatísticas
    const totalPages = Math.ceil(count / parseInt(limit));

    res.json({
      success: true,
      data: {
        cultos,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: count,
          pages: totalPages,
          hasNext: parseInt(page) < totalPages,
          hasPrev: parseInt(page) > 1
        }
      }
    });

  } catch (error) {
    console.error('Erro ao listar cultos:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
};

/**
 * @swagger
 * /api/cultos/{id}:
 *   get:
 *     summary: Obter culto por ID
 *     tags: [Cultos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Dados do culto
 *       404:
 *         description: Culto não encontrado
 */
const obterCulto = async (req, res) => {
  try {
    const { id } = req.params;

    const culto = await Culto.findByPk(id, {
      include: [
        {
          model: TipoCulto,
          as: 'tipoCulto'
        },
        {
          model: StatusCulto,
          as: 'status'
        },
        {
          model: Usuario,
          as: 'criador',
          attributes: ['id', 'email'],
          include: [{
            model: Pessoa,
            as: 'pessoa',
            attributes: ['nome', 'sobrenome']
          }]
        },
        {
          model: Atividade,
          as: 'atividades',
          include: [{
            model: TipoAtividade,
            as: 'tipoAtividade'
          }],
          order: [['ordem', 'ASC']]
        },
        {
          model: Escala,
          as: 'escalas',
          include: [
            {
              model: Pessoa,
              as: 'pessoa',
              attributes: ['id', 'nome', 'sobrenome', 'telefone']
            },
            {
              model: Funcao,
              as: 'funcao'
            },
            {
              model: StatusEscala,
              as: 'status'
            }
          ]
        }
      ]
    });

    if (!culto) {
      return res.status(404).json({
        success: false,
        error: 'Culto não encontrado'
      });
    }

    res.json({
      success: true,
      data: culto
    });

  } catch (error) {
    console.error('Erro ao obter culto:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
};

/**
 * @swagger
 * /api/cultos:
 *   post:
 *     summary: Criar novo culto
 *     tags: [Cultos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Culto'
 *     responses:
 *       201:
 *         description: Culto criado com sucesso
 *       400:
 *         description: Dados inválidos
 *       409:
 *         description: Conflito de horário
 */
const criarCulto = async (req, res) => {
  try {
    const {
      titulo,
      descricao,
      data_culto,
      horario_inicio,
      horario_fim,
      local,
      observacoes,
      tipo_culto_id,
      atividades = [],
      escalas = []
    } = req.body;

    if (!titulo || !data_culto || !horario_inicio || !tipo_culto_id) {
      return res.status(400).json({
        success: false,
        error: 'Campos obrigatórios: titulo, data_culto, horario_inicio, tipo_culto_id'
      });
    }

    const tipoCulto = await TipoCulto.findByPk(tipo_culto_id);
    if (!tipoCulto) {
      return res.status(400).json({
        success: false,
        error: 'Tipo de culto não encontrado'
      });
    }

    const conflito = await verificarConflitoHorario(
      data_culto,
      horario_inicio,
      horario_fim,
      local
    );

    if (conflito) {
      return res.status(409).json({
        success: false,
        error: 'Conflito de horário detectado',
        conflito
      });
    }

    const statusPadrao = await StatusCulto.findOne({
      where: { nome: 'Planejado' }
    });

    const culto = await Culto.create({
      titulo,
      descricao,
      data_culto,
      horario_inicio,
      horario_fim,
      local,
      observacoes,
      tipo_culto_id,
      status_id: statusPadrao?.id || 1,
      criado_por: req.user.id
    });

    if (atividades.length > 0) {
      await criarAtividades(culto.id, atividades);
    }

    if (escalas.length > 0) {
      await criarEscalas(culto.id, escalas);
    }

    const cultoCompleto = await Culto.findByPk(culto.id, {
      include: [
        { model: TipoCulto, as: 'tipoCulto' },
        { model: StatusCulto, as: 'status' },
        { model: Atividade, as: 'atividades' },
        { model: Escala, as: 'escalas' }
      ]
    });

    res.status(201).json({
      success: true,
      data: cultoCompleto,
      message: 'Culto criado com sucesso'
    });

  } catch (error) {
    console.error('Erro ao criar culto:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
};

/**
 * @swagger
 * /api/cultos/{id}:
 *   put:
 *     summary: Atualizar culto
 *     tags: [Cultos]
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
 *             $ref: '#/components/schemas/Culto'
 *     responses:
 *       200:
 *         description: Culto atualizado com sucesso
 *       404:
 *         description: Culto não encontrado
 *       409:
 *         description: Conflito de horário
 */
const atualizarCulto = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      titulo,
      descricao,
      data_culto,
      horario_inicio,
      horario_fim,
      local,
      observacoes,
      tipo_culto_id,
      status_id
    } = req.body;

    const culto = await Culto.findByPk(id);
    if (!culto) {
      return res.status(404).json({
        success: false,
        error: 'Culto não encontrado'
      });
    }

    // Verificar se pode editar (não pode editar cultos finalizados)
    if (culto.status_id === 2) { // Status "Finalizado"
      return res.status(400).json({
        success: false,
        error: 'Não é possível editar cultos finalizados'
      });
    }

    // Verificar conflito de horário (excluindo o próprio culto)
    if (data_culto || horario_inicio || horario_fim || local) {
      const conflito = await verificarConflitoHorario(
        data_culto || culto.data_culto,
        horario_inicio || culto.horario_inicio,
        horario_fim || culto.horario_fim,
        local || culto.local,
        id
      );

      if (conflito) {
        return res.status(409).json({
          success: false,
          error: 'Conflito de horário detectado',
          conflito
        });
      }
    }

    // Atualizar culto
    await culto.update({
      titulo: titulo || culto.titulo,
      descricao: descricao !== undefined ? descricao : culto.descricao,
      data_culto: data_culto || culto.data_culto,
      horario_inicio: horario_inicio || culto.horario_inicio,
      horario_fim: horario_fim !== undefined ? horario_fim : culto.horario_fim,
      local: local !== undefined ? local : culto.local,
      observacoes: observacoes !== undefined ? observacoes : culto.observacoes,
      tipo_culto_id: tipo_culto_id || culto.tipo_culto_id,
      status_id: status_id || culto.status_id
    });

    const cultoAtualizado = await Culto.findByPk(id, {
      include: [
        { model: TipoCulto, as: 'tipoCulto' },
        { model: StatusCulto, as: 'status' }
      ]
    });

    res.json({
      success: true,
      data: cultoAtualizado,
      message: 'Culto atualizado com sucesso'
    });

  } catch (error) {
    console.error('Erro ao atualizar culto:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
};

/**
 * @swagger
 * /api/cultos/{id}:
 *   delete:
 *     summary: Excluir culto
 *     tags: [Cultos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Culto excluído com sucesso
 *       404:
 *         description: Culto não encontrado
 *       400:
 *         description: Não é possível excluir o culto
 */
const excluirCulto = async (req, res) => {
  try {
    const { id } = req.params;

    const culto = await Culto.findByPk(id);
    if (!culto) {
      return res.status(404).json({
        success: false,
        error: 'Culto não encontrado'
      });
    }

    // Verificar se pode excluir
    const agora = new Date();
    const dataCulto = new Date(culto.data_culto);

    if (dataCulto <= agora) {
      return res.status(400).json({
        success: false,
        error: 'Não é possível excluir cultos que já aconteceram'
      });
    }

    if (culto.status_id === 3) { // Status "Finalizado"
      return res.status(400).json({
        success: false,
        error: 'Não é possível excluir cultos finalizados'
      });
    }

    // Soft delete
    await culto.destroy();

    res.json({
      success: true,
      message: 'Culto excluído com sucesso'
    });

  } catch (error) {
    console.error('Erro ao excluir culto:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
};

/**
 * @swagger
 * /api/cultos/{id}/status:
 *   patch:
 *     summary: Atualizar status do culto
 *     tags: [Cultos]
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
 *               status_id:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Status atualizado com sucesso
 */
const atualizarStatusCulto = async (req, res) => {
  try {
    const { id } = req.params;
    const { status_id } = req.body;

    const culto = await Culto.findByPk(id);
    if (!culto) {
      return res.status(404).json({
        success: false,
        error: 'Culto não encontrado'
      });
    }

    // Verificar se o status existe
    const status = await StatusCulto.findByPk(status_id);
    if (!status) {
      return res.status(400).json({
        success: false,
        error: 'Status não encontrado'
      });
    }

    await culto.update({ status_id });

    res.json({
      success: true,
      message: 'Status atualizado com sucesso'
    });

  } catch (error) {
    console.error('Erro ao atualizar status:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
};

// Funções auxiliares
const verificarConflitoHorario = async (data, inicio, fim, local, excluirId = null) => {
  const where = {
    data_culto: data,
    [Op.or]: [
      {
        horario_inicio: {
          [Op.between]: [inicio, fim || '23:59:59']
        }
      },
      {
        horario_fim: {
          [Op.between]: [inicio, fim || '23:59:59']
        }
      },
      {
        [Op.and]: [
          { horario_inicio: { [Op.lte]: inicio } },
          { horario_fim: { [Op.gte]: fim || inicio } }
        ]
      }
    ]
  };

  if (local) {
    where.local = local;
  }

  if (excluirId) {
    where.id = { [Op.ne]: excluirId };
  }

  const conflito = await Culto.findOne({
    where,
    include: [
      { model: TipoCulto, as: 'tipoCulto' },
      { model: StatusCulto, as: 'status' }
    ]
  });

  return conflito;
};

const criarAtividades = async (cultoId, atividades) => {
  const atividadesData = atividades.map((atividade, index) => ({
    ...atividade,
    culto_id: cultoId,
    ordem: atividade.ordem || index + 1
  }));

  return await Atividade.bulkCreate(atividadesData);
};

const criarEscalas = async (cultoId, escalas) => {
  const statusPendente = await StatusEscala.findOne({
    where: { nome: 'Pendente' }
  });

  const escalasData = escalas.map(escala => ({
    ...escala,
    culto_id: cultoId,
    status_id: escala.status_id || statusPendente?.id || 1
  }));

  return await Escala.bulkCreate(escalasData);
};

module.exports = {
  listarCultos,
  obterCulto,
  criarCulto,
  atualizarCulto,
  excluirCulto,
  atualizarStatusCulto
};

