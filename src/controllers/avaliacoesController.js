const { Avaliacao, AvaliacaoCriterio, CriterioAvaliacao, Pessoa, Culto, TipoCulto } = require('../models');
const { Op } = require('sequelize');
const { sequelize } = require('../config/database');

/**
 * Controlador para gerenciamento de avaliações públicas
 */
const avaliacoesController = {
  /**
   * @swagger
   * /api/avaliacoes:
   *   get:
   *     summary: Listar avaliações com filtros e paginação
   *     tags: [Avaliações]
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
   *         name: recomendaria
   *         schema:
   *           type: boolean
   *     responses:
   *       200:
   *         description: Lista de avaliações
   */
  async listar(req, res) {
    try {
      const {
        page = 1,
        limit = 10,
        data_inicio,
        data_fim,
        recomendaria
      } = req.query;

      const offset = (page - 1) * limit;
      const where = {};

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

      if (recomendaria !== undefined) {
        where.recomendaria = recomendaria === 'true';
      }

      const { count, rows: avaliacoes } = await Avaliacao.findAndCountAll({
        where,
        include: [
          {
            model: Pessoa,
            as: 'avaliador',
            attributes: ['id', 'nome_completo']
          },
          {
            model: Culto,
            as: 'culto',
            attributes: ['id', 'titulo', 'data_culto']
          },
          {
            model: AvaliacaoCriterio,
            as: 'criterios',
            include: [
              {
                model: CriterioAvaliacao,
                as: 'criterio',
                attributes: ['id', 'nome', 'descricao']
              }
            ]
          }
        ],
        order: [['data_visita', 'DESC'], ['created_at', 'DESC']],
        limit: parseInt(limit),
        offset: parseInt(offset)
      });

      const totalPages = Math.ceil(count / limit);

      res.json({
        success: true,
        data: {
          avaliacoes,
          pagination: {
            currentPage: parseInt(page),
            totalPages,
            totalItems: count,
            itemsPerPage: parseInt(limit)
          }
        }
      });

    } catch (error) {
      console.error('Erro ao listar avaliações:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  },

  /**
   * @swagger
   * /api/avaliacoes/{id}:
   *   get:
   *     summary: Obter avaliação por ID
   *     tags: [Avaliações]
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
   *         description: Dados da avaliação
   *       404:
   *         description: Avaliação não encontrada
   */
  async obter(req, res) {
    try {
      const { id } = req.params;

      const avaliacao = await Avaliacao.findByPk(id, {
        include: [
          {
            model: Pessoa,
            as: 'avaliador',
            attributes: ['id', 'nome_completo']
          },
          {
            model: Culto,
            as: 'culto',
            attributes: ['id', 'titulo', 'data_hora']
          },
          {
            model: AvaliacaoCriterio,
            as: 'criterios',
            include: [
              {
                model: CriterioAvaliacao,
                as: 'criterio',
                attributes: ['id', 'nome', 'descricao']
              }
            ]
          }
        ]
      });

      if (!avaliacao) {
        return res.status(404).json({
          success: false,
          error: 'Avaliação não encontrada'
        });
      }

      res.json({
        success: true,
        data: { avaliacao }
      });

    } catch (error) {
      console.error('Erro ao obter avaliação:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  },

  /**
   * @swagger
   * /api/avaliacoes/publica:
   *   post:
   *     summary: Criar avaliação pública (sem autenticação)
   *     tags: [Avaliações]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - data_visita
   *               - criterios
   *             properties:
   *               nome_avaliador:
   *                 type: string
   *               email_avaliador:
   *                 type: string
   *                 format: email
   *               data_visita:
   *                 type: string
   *                 format: date
   *               comentario_geral:
   *                 type: string
   *               recomendaria:
   *                 type: boolean
   *               criterios:
   *                 type: array
   *                 items:
   *                   type: object
   *                   properties:
   *                     criterio_id:
   *                       type: integer
   *                     nota:
   *                       type: integer
   *                       minimum: 1
   *                       maximum: 5
   *     responses:
   *       201:
   *         description: Avaliação criada com sucesso
   *       400:
   *         description: Dados inválidos
   */
  async criarPublica(req, res) {
    const transaction = await sequelize.transaction();

    try {
      const {
        nome_avaliador,
        email_avaliador,
        data_visita,
        comentario_geral,
        recomendaria,
        criterios = []
      } = req.body;

      if (!data_visita) {
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          error: 'Data da visita é obrigatória'
        });
      }

      if (!criterios || criterios.length === 0) {
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          error: 'Pelo menos um critério deve ser avaliado'
        });
      }

      for (const criterio of criterios) {
        if (!criterio.criterio_id || !criterio.nota) {
          await transaction.rollback();
          return res.status(400).json({
            success: false,
            error: 'Critério e nota são obrigatórios'
          });
        }

        if (criterio.nota < 1 || criterio.nota > 5) {
          await transaction.rollback();
          return res.status(400).json({
            success: false,
            error: 'Nota deve estar entre 1 e 5'
          });
        }

        const criterioExiste = await CriterioAvaliacao.findByPk(criterio.criterio_id);
        if (!criterioExiste) {
          await transaction.rollback();
          return res.status(400).json({
            success: false,
            error: `Critério ${criterio.criterio_id} não encontrado`
          });
        }
      }

      const avaliacao = await Avaliacao.create({
        nome_avaliador,
        email_avaliador,
        data_visita,
        comentario_geral,
        recomendaria
      }, { transaction });

      // Criar critérios da avaliação
      const criteriosData = criterios.map(criterio => ({
        avaliacao_id: avaliacao.id,
        criterio_id: criterio.criterio_id,
        nota: criterio.nota
      }));

      await AvaliacaoCriterio.bulkCreate(criteriosData, { transaction });

      await transaction.commit();

      const avaliacaoCriada = await Avaliacao.findByPk(avaliacao.id, {
        include: [
          {
            model: AvaliacaoCriterio,
            as: 'criterios',
            include: [
              {
                model: CriterioAvaliacao,
                as: 'criterio',
                attributes: ['id', 'nome', 'descricao']
              }
            ]
          }
        ]
      });

      res.status(201).json({
        success: true,
        data: { avaliacao: avaliacaoCriada },
        message: 'Avaliação enviada com sucesso! Obrigado pelo seu feedback.'
      });

    } catch (error) {
      await transaction.rollback();
      console.error('Erro ao criar avaliação pública:', error);

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
   * /api/avaliacoes/{id}:
   *   delete:
   *     summary: Excluir avaliação (soft delete)
   *     tags: [Avaliações]
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
   *         description: Avaliação excluída com sucesso
   *       404:
   *         description: Avaliação não encontrada
   */
  async excluir(req, res) {
    try {
      const { id } = req.params;

      const avaliacao = await Avaliacao.findByPk(id);
      if (!avaliacao) {
        return res.status(404).json({
          success: false,
          error: 'Avaliação não encontrada'
        });
      }

      await avaliacao.destroy();

      res.json({
        success: true,
        message: 'Avaliação excluída com sucesso'
      });

    } catch (error) {
      console.error('Erro ao excluir avaliação:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  },

  /**
   * @swagger
   * /api/avaliacoes/estatisticas:
   *   get:
   *     summary: Obter estatísticas de avaliações
   *     tags: [Avaliações]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Estatísticas de avaliações
   */
  async estatisticas(req, res) {
    try {
      const hoje = new Date();
      const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
      const inicioAno = new Date(hoje.getFullYear(), 0, 1);

      const [
        totalAvaliacoes,
        avaliacoesHoje,
        avaliacoesMes,
        avaliacoesAno,
        recomendariam,
        naoRecomendariam,
        mediaCriterios
      ] = await Promise.all([
        Avaliacao.count(),
        Avaliacao.count({
          where: {
            data_visita: hoje.toISOString().split('T')[0]
          }
        }),
        Avaliacao.count({
          where: {
            data_visita: {
              [Op.gte]: inicioMes
            }
          }
        }),
        Avaliacao.count({
          where: {
            data_visita: {
              [Op.gte]: inicioAno
            }
          }
        }),
        Avaliacao.count({
          where: { recomendaria: true }
        }),
        Avaliacao.count({
          where: { recomendaria: false }
        }),
        // Média das notas por critério
        sequelize.query(`
          SELECT 
            c.nome as criterio,
            ROUND(AVG(ac.nota::numeric), 2) as media_nota,
            COUNT(ac.nota) as total_avaliacoes
          FROM criterios_avaliacao c
          LEFT JOIN avaliacao_criterios ac ON c.id = ac.criterio_id
          LEFT JOIN avaliacoes a ON ac.avaliacao_id = a.id
          WHERE c.ativo = true AND a.deleted_at IS NULL
          GROUP BY c.id, c.nome, c.ordem_exibicao
          ORDER BY c.ordem_exibicao
        `, {
          type: sequelize.QueryTypes.SELECT
        })
      ]);

      const percentualRecomendacao = totalAvaliacoes > 0
        ? Math.round((recomendariam / totalAvaliacoes) * 100)
        : 0;

      res.json({
        success: true,
        data: {
          totalAvaliacoes,
          avaliacoesHoje,
          avaliacoesMes,
          avaliacoesAno,
          recomendariam,
          naoRecomendariam,
          percentualRecomendacao,
          mediaCriterios
        }
      });

    } catch (error) {
      console.error('Erro ao obter estatísticas:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  },

  /**
   * @swagger
   * /api/avaliacoes/criterios:
   *   get:
   *     summary: Listar critérios de avaliação ativos
   *     tags: [Avaliações]
   *     responses:
   *       200:
   *         description: Lista de critérios de avaliação
   */
  async listarCriterios(req, res) {
    try {
      const criterios = await CriterioAvaliacao.findAll({
        where: { ativo: true },
        order: [['ordem_exibicao', 'ASC'], ['nome', 'ASC']]
      });

      res.json({
        success: true,
        data: { criterios }
      });

    } catch (error) {
      console.error('Erro ao listar critérios:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  }
};

module.exports = avaliacoesController;

