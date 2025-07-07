const { Visitante, FormaConhecimento, Culto, TipoCulto, Usuario, Pessoa } = require('../models');
const { Op } = require('sequelize');

/**
 * Controlador para gerenciamento de visitantes
 */
const visitantesController = {
  /**
   * @swagger
   * /api/visitantes:
   *   get:
   *     summary: Listar visitantes com filtros e paginação
   *     tags: [Visitantes]
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
   *         name: culto_id
   *         schema:
   *           type: integer
   *       - in: query
   *         name: eh_cristao
   *         schema:
   *           type: boolean
   *     responses:
   *       200:
   *         description: Lista de visitantes
   */
  async listar(req, res) {
    try {
      const {
        page = 1,
        limit = 10,
        busca,
        data_inicio,
        data_fim,
        culto_id,
        eh_cristao
      } = req.query;

      const offset = (page - 1) * limit;
      const where = {};

      // Filtro por busca (nome ou WhatsApp)
      if (busca) {
        where[Op.or] = [
          { nome_completo: { [Op.iLike]: `%${busca}%` } },
          { whatsapp: { [Op.iLike]: `%${busca}%` } }
        ];
      }

      // Filtro por data de visita
      if (data_inicio && data_fim) {
        where.data_visita = {
          [Op.between]: [new Date(data_inicio), new Date(data_fim)]
        };
      } else if (data_inicio) {
        where.data_visita = {
          [Op.gte]: new Date(data_inicio)
        };
      } else if (data_fim) {
        where.data_visita = {
          [Op.lte]: new Date(data_fim)
        };
      }

      // Filtros específicos
      if (culto_id) where.culto_id = culto_id;
      if (eh_cristao !== undefined) where.eh_cristao = eh_cristao === 'true';

      const { count, rows: visitantes } = await Visitante.findAndCountAll({
        where,
        include: [
          {
            model: FormaConhecimento,
            as: 'formaConhecimento',
            attributes: ['id', 'nome']
          },
          {
            model: Culto,
            as: 'culto',
            attributes: ['id', 'titulo', 'data_culto'],
            include: [
              {
                model: TipoCulto,
                as: 'tipoCulto',
                attributes: ['id', 'nome']
              }
            ]
          },
        ],
        order: [['data_visita', 'DESC'], ['created_at', 'DESC']],
        limit: parseInt(limit),
        offset: parseInt(offset)
      });

      const totalPages = Math.ceil(count / limit);

      res.json({
        success: true,
        data: {
          visitantes,
          pagination: {
            currentPage: parseInt(page),
            totalPages,
            totalItems: count,
            itemsPerPage: parseInt(limit)
          }
        }
      });

    } catch (error) {
      console.error('Erro ao listar visitantes:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  },

  /**
   * @swagger
   * /api/visitantes/{id}:
   *   get:
   *     summary: Obter visitante por ID
   *     tags: [Visitantes]
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
   *         description: Dados do visitante
   *       404:
   *         description: Visitante não encontrado
   */
  async obter(req, res) {
    try {
      const { id } = req.params;

      const visitante = await Visitante.findByPk(id, {
        include: [
          {
            model: FormaConhecimento,
            as: 'formaConhecimento',
            attributes: ['id', 'nome']
          },
          {
            model: Culto,
            as: 'culto',
            attributes: ['id', 'titulo', 'data_hora'],
            include: [
              {
                model: TipoCulto,
                as: 'tipoCulto',
                attributes: ['id', 'nome']
              }
            ]
          },
          {
            model: Usuario,
            as: 'cadastradoPor',
            attributes: ['id', 'email'],
            include: [
              {
                model: Pessoa,
                as: 'pessoa',
                attributes: ['id', 'nome']
              }
            ]
          }
        ]
      });

      if (!visitante) {
        return res.status(404).json({
          success: false,
          error: 'Visitante não encontrado'
        });
      }

      res.json({
        success: true,
        data: { visitante }
      });

    } catch (error) {
      console.error('Erro ao obter visitante:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  },

  /**
   * @swagger
   * /api/visitantes:
   *   post:
   *     summary: Criar novo visitante
   *     tags: [Visitantes]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - nome_completo
   *               - data_visita
   *             properties:
   *               nome_completo:
   *                 type: string
   *               whatsapp:
   *                 type: string
   *               data_nascimento:
   *                 type: string
   *                 format: date
   *               eh_cristao:
   *                 type: boolean
   *               mora_perto:
   *                 type: boolean
   *               igreja_origem:
   *                 type: string
   *               forma_conhecimento_id:
   *                 type: integer
   *               observacoes:
   *                 type: string
   *               avisos_organizador:
   *                 type: string
   *               data_visita:
   *                 type: string
   *                 format: date
   *               culto_id:
   *                 type: integer
   *     responses:
   *       201:
   *         description: Visitante criado com sucesso
   *       400:
   *         description: Dados inválidos
   */
  async criar(req, res) {
    try {
      const {
        nome_completo,
        whatsapp,
        data_nascimento,
        eh_cristao,
        mora_perto,
        igreja_origem,
        forma_conhecimento_id,
        observacoes,
        avisos_organizador,
        data_visita,
        culto_id
      } = req.body;

      // Validações básicas
      if (!nome_completo || !data_visita) {
        return res.status(400).json({
          success: false,
          error: 'Nome completo e data da visita são obrigatórios'
        });
      }

      // Verificar se o culto existe (se informado)
      if (culto_id) {
        const culto = await Culto.findByPk(culto_id);
        if (!culto) {
          return res.status(400).json({
            success: false,
            error: 'Culto não encontrado'
          });
        }
      }

      // Verificar se a forma de conhecimento existe (se informada)
      if (forma_conhecimento_id) {
        const forma = await FormaConhecimento.findByPk(forma_conhecimento_id);
        if (!forma) {
          return res.status(400).json({
            success: false,
            error: 'Forma de conhecimento não encontrada'
          });
        }
      }

      const visitante = await Visitante.create({
        nome_completo,
        whatsapp,
        data_nascimento,
        eh_cristao,
        mora_perto,
        igreja_origem,
        forma_conhecimento_id,
        observacoes,
        avisos_organizador,
        data_visita,
        culto_id,
        cadastrado_por: req.user.id
      });

      // Buscar visitante criado com relacionamentos
      const visitanteCriado = await Visitante.findByPk(visitante.id, {
        include: [
          {
            model: FormaConhecimento,
            as: 'formaConhecimento',
            attributes: ['id', 'nome']
          },
          {
            model: Culto,
            as: 'culto',
            attributes: ['id', 'titulo', 'data_culto']
          }
        ]
      });

      res.status(201).json({
        success: true,
        data: { visitante: visitanteCriado },
        message: 'Visitante cadastrado com sucesso'
      });

    } catch (error) {
      console.error('Erro ao criar visitante:', error);

      if (error.name === 'SequelizeValidationError') {
        return res.status(400).json({
          success: false,
          error: 'Dados inválidos',
          details: error.errors.map(e => e.message)
        });
      }

      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  },

  /**
   * @swagger
   * /api/visitantes/{id}:
   *   put:
   *     summary: Atualizar visitante
   *     tags: [Visitantes]
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
   *               nome_completo:
   *                 type: string
   *               whatsapp:
   *                 type: string
   *               data_nascimento:
   *                 type: string
   *                 format: date
   *               eh_cristao:
   *                 type: boolean
   *               mora_perto:
   *                 type: boolean
   *               igreja_origem:
   *                 type: string
   *               forma_conhecimento_id:
   *                 type: integer
   *               observacoes:
   *                 type: string
   *               avisos_organizador:
   *                 type: string
   *               data_visita:
   *                 type: string
   *                 format: date
   *               culto_id:
   *                 type: integer
   *     responses:
   *       200:
   *         description: Visitante atualizado com sucesso
   *       404:
   *         description: Visitante não encontrado
   */
  async atualizar(req, res) {
    try {
      const { id } = req.params;
      const dadosAtualizacao = req.body;

      const visitante = await Visitante.findByPk(id);
      if (!visitante) {
        return res.status(404).json({
          success: false,
          error: 'Visitante não encontrado'
        });
      }

      // Verificar se o culto existe (se informado)
      if (dadosAtualizacao.culto_id) {
        const culto = await Culto.findByPk(dadosAtualizacao.culto_id);
        if (!culto) {
          return res.status(400).json({
            success: false,
            error: 'Culto não encontrado'
          });
        }
      }

      // Verificar se a forma de conhecimento existe (se informada)
      if (dadosAtualizacao.forma_conhecimento_id) {
        const forma = await FormaConhecimento.findByPk(dadosAtualizacao.forma_conhecimento_id);
        if (!forma) {
          return res.status(400).json({
            success: false,
            error: 'Forma de conhecimento não encontrada'
          });
        }
      }

      await visitante.update(dadosAtualizacao);

      // Buscar visitante atualizado com relacionamentos
      const visitanteAtualizado = await Visitante.findByPk(id, {
        include: [
          {
            model: FormaConhecimento,
            as: 'formaConhecimento',
            attributes: ['id', 'nome']
          },
          {
            model: Culto,
            as: 'culto',
            attributes: ['id', 'titulo', 'data_culto']
          }
        ]
      });

      res.json({
        success: true,
        data: { visitante: visitanteAtualizado },
        message: 'Visitante atualizado com sucesso'
      });

    } catch (error) {
      console.error('Erro ao atualizar visitante:', error);

      if (error.name === 'SequelizeValidationError') {
        return res.status(400).json({
          success: false,
          error: 'Dados inválidos',
          details: error.errors.map(e => e.message)
        });
      }

      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  },

  /**
   * @swagger
   * /api/visitantes/{id}:
   *   delete:
   *     summary: Excluir visitante (soft delete)
   *     tags: [Visitantes]
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
   *         description: Visitante excluído com sucesso
   *       404:
   *         description: Visitante não encontrado
   */
  async excluir(req, res) {
    try {
      const { id } = req.params;

      const visitante = await Visitante.findByPk(id);
      if (!visitante) {
        return res.status(404).json({
          success: false,
          error: 'Visitante não encontrado'
        });
      }

      await visitante.destroy(); // Soft delete

      res.json({
        success: true,
        message: 'Visitante excluído com sucesso'
      });

    } catch (error) {
      console.error('Erro ao excluir visitante:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  },

  /**
   * @swagger
   * /api/visitantes/estatisticas:
   *   get:
   *     summary: Obter estatísticas de visitantes
   *     tags: [Visitantes]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Estatísticas de visitantes
   */
  async estatisticas(req, res) {
    try {
      const hoje = new Date();
      const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
      const inicioAno = new Date(hoje.getFullYear(), 0, 1);

      const [
        totalVisitantes,
        visitantesHoje,
        visitantesMes,
        visitantesAno,
        visitantesCristaos,
        visitantesNaoCristaos
      ] = await Promise.all([
        Visitante.count(),
        Visitante.count({
          where: {
            data_visita: hoje.toISOString().split('T')[0]
          }
        }),
        Visitante.count({
          where: {
            data_visita: {
              [Op.gte]: inicioMes
            }
          }
        }),
        Visitante.count({
          where: {
            data_visita: {
              [Op.gte]: inicioAno
            }
          }
        }),
        Visitante.count({
          where: { eh_cristao: true }
        }),
        Visitante.count({
          where: { eh_cristao: false }
        })
      ]);

      res.json({
        success: true,
        data: {
          totalVisitantes,
          visitantesHoje,
          visitantesMes,
          visitantesAno,
          visitantesCristaos,
          visitantesNaoCristaos,
          percentualCristaos: totalVisitantes > 0 ? Math.round((visitantesCristaos / totalVisitantes) * 100) : 0
        }
      });

    } catch (error) {
      console.error('Erro ao obter estatísticas:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  }
};

module.exports = visitantesController;

