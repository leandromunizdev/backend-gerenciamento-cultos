const { Escala, Pessoa, Funcao, StatusEscala, Culto, TipoCulto, Usuario } = require('../models');
const { Op } = require('sequelize');
const { auditLogger } = require('../middleware/logger');

/**
 * Controlador para gerenciamento de escalas
 */
const escalasController = {
  /**
   * Listar escalas com filtros e paginação
   */
  async listar(req, res) {
    try {
      const {
        page = 1,
        limit = 10,
        busca,
        data_inicio,
        data_fim,
        funcao_id,
        status_id,
        pessoa_id,
        culto_id
      } = req.query;

      const offset = (page - 1) * limit;
      const where = {};
      const includeWhere = {};

      // Filtro por busca (observações)
      if (busca) {
        where.observacoes = { [Op.iLike]: `%${busca}%` };
      }

      // Filtro por data (através do culto)
      if (data_inicio || data_fim) {
        includeWhere.data_culto = {};
        if (data_inicio && data_fim) {
          includeWhere.data_culto[Op.between] = [new Date(data_inicio), new Date(data_fim)];
        } else if (data_inicio) {
          includeWhere.data_culto[Op.gte] = new Date(data_inicio);
        } else if (data_fim) {
          includeWhere.data_culto[Op.lte] = new Date(data_fim);
        }
      }

      // Filtros específicos
      if (funcao_id) where.funcao_id = funcao_id;
      if (status_id) where.status_id = status_id;
      if (pessoa_id) where.pessoa_id = pessoa_id;
      if (culto_id) where.culto_id = culto_id;

      const { count, rows } = await Escala.findAndCountAll({
        where,
        include: [
          {
            model: Pessoa,
            as: 'pessoa',
            attributes: ['id', 'nome_completo', 'whatsapp', 'telefone']
          },
          {
            model: Funcao,
            as: 'funcao',
            attributes: ['id', 'nome', 'descricao', 'cor']
          },
          {
            model: StatusEscala,
            as: 'status',
            attributes: ['id', 'nome', 'cor']
          },
          {
            model: Culto,
            as: 'culto',
            attributes: ['id', 'titulo', 'data_culto', 'local'],
            where: Object.keys(includeWhere).length > 0 ? includeWhere : undefined,
            include: [
              {
                model: TipoCulto,
                as: 'tipoCulto',
                attributes: ['id', 'nome', 'cor']
              }
            ]
          },
        ],
        order: [[{ model: Culto, as: 'culto' }, 'data_culto', 'ASC'], ['created_at', 'DESC']],
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
      console.error('Erro ao listar escalas:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  },

  /**
   * Obter escala por ID
   */
  async obter(req, res) {
    try {
      const { id } = req.params;

      const escala = await Escala.findByPk(id, {
        include: [
          {
            model: Pessoa,
            as: 'pessoa',
            attributes: ['id', 'nome', 'telefone', 'email', 'cargo_eclesiastico_id']
          },
          {
            model: Funcao,
            as: 'funcao',
            attributes: ['id', 'nome', 'descricao', 'cor']
          },
          {
            model: StatusEscala,
            as: 'status',
            attributes: ['id', 'nome', 'cor']
          },
          {
            model: Culto,
            as: 'culto',
            attributes: ['id', 'titulo', 'data_hora', 'local', 'descricao'],
            include: [
              {
                model: TipoCulto,
                as: 'tipo',
                attributes: ['id', 'nome', 'cor']
              }
            ]
          },
          {
            model: Usuario,
            as: 'criado_por_usuario',
            attributes: ['id', 'email'],
            include: [
              {
                model: Pessoa,
                as: 'pessoa',
                attributes: ['nome']
              }
            ]
          }
        ]
      });

      if (!escala) {
        return res.status(404).json({
          success: false,
          error: 'Escala não encontrada'
        });
      }

      res.json({
        success: true,
        data: escala
      });
    } catch (error) {
      console.error('Erro ao obter escala:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  },

  /**
   * Criar nova escala
   */
  async criar(req, res) {
    try {
      const {
        pessoa_id,
        funcao_id,
        culto_id,
        observacoes
      } = req.body;

      if (!pessoa_id || !funcao_id || !culto_id) {
        return res.status(400).json({
          success: false,
          error: 'Campos obrigatórios: pessoa_id, funcao_id, culto_id'
        });
      }

      const pessoa = await Pessoa.findByPk(pessoa_id);
      if (!pessoa) {
        return res.status(404).json({
          success: false,
          error: 'Pessoa não encontrada'
        });
      }

      const funcao = await Funcao.findByPk(funcao_id);
      if (!funcao) {
        return res.status(404).json({
          success: false,
          error: 'Função não encontrada'
        });
      }

      const culto = await Culto.findByPk(culto_id);
      if (!culto) {
        return res.status(404).json({
          success: false,
          error: 'Culto não encontrado'
        });
      }

      const conflito = await Escala.findOne({
        where: {
          pessoa_id,
          culto_id,
          funcao_id,
          status_id: { [Op.ne]: 4 } // Não cancelada
        }
      });

      if (conflito) {
        return res.status(400).json({
          success: false,
          error: 'Pessoa já possui escala neste culto'
        });
      }

      // Obter status padrão (Pendente)
      const statusPendente = await StatusEscala.findOne({
        where: { nome: 'Pendente' }
      });

      const escala = await Escala.create({
        pessoa_id,
        funcao_id,
        culto_id,
        observacoes,
        status_id: statusPendente?.id || 1,
        created_by: req.user.id
      });

      await auditLogger.log({
        usuario_id: req.user.id,
        acao: 'CREATE',
        tabela: 'escalas',
        registro_id: escala.id,
        dados_novos: escala.toJSON()
      });

      const escalaCriada = await Escala.findByPk(escala.id, {
        include: [
          {
            model: Pessoa,
            as: 'pessoa',
            attributes: ['id', 'nome_completo', 'telefone', 'whatsapp']
          },
          {
            model: Funcao,
            as: 'funcao',
            attributes: ['id', 'nome', 'descricao', 'cor']
          },
          {
            model: StatusEscala,
            as: 'status',
            attributes: ['id', 'nome', 'cor']
          },
          {
            model: Culto,
            as: 'culto',
            attributes: ['id', 'titulo', 'data_culto', 'local'],
            include: [
              {
                model: TipoCulto,
                as: 'tipoCulto',
                attributes: ['id', 'nome', 'cor']
              }
            ]
          }
        ]
      });

      res.status(201).json({
        success: true,
        data: escalaCriada
      });

    } catch (error) {
      console.error('Erro ao criar escala:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  },

  /**
   * Atualizar escala
   */
  async atualizar(req, res) {
    try {
      const { id } = req.params;
      const {
        pessoa_id,
        funcao_id,
        culto_id,
        observacoes,
        status_id
      } = req.body;

      const escala = await Escala.findByPk(id);
      if (!escala) {
        return res.status(404).json({
          success: false,
          error: 'Escala não encontrada'
        });
      }

      // Verificar se pode editar (não pode editar escalas confirmadas ou finalizadas)
      if (escala.status_id === 2) {
        return res.status(400).json({
          success: false,
          error: 'Não é possível editar escala confirmada'
        });
      }

      if ((pessoa_id && pessoa_id !== escala.pessoa_id)) {
        const pessoaId = pessoa_id || escala.pessoa_id;

        const conflito = await Escala.findOne({
          where: {
            id: { [Op.ne]: id },
            pessoa_id: pessoaId,
            funcao_id: funcao_id,
            status_id: { [Op.ne]: 4 }
          }
        });

        if (conflito) {
          return res.status(400).json({
            success: false,
            error: 'Pessoa já possui escala nesta data/horário'
          });
        }
      }

      const dadosAtualizacao = {};
      if (pessoa_id) dadosAtualizacao.pessoa_id = pessoa_id;
      if (funcao_id) dadosAtualizacao.funcao_id = funcao_id;
      if (culto_id) dadosAtualizacao.culto_id = culto_id;
      if (observacoes !== undefined) dadosAtualizacao.observacoes = observacoes;
      if (status_id) dadosAtualizacao.status_id = status_id;

      await escala.update(dadosAtualizacao);

      const escalaAtualizada = await Escala.findByPk(id, {
        include: [
          {
            model: Pessoa,
            as: 'pessoa',
            attributes: ['id', 'nome_completo', 'telefone', 'whatsapp']
          },
          {
            model: Funcao,
            as: 'funcao',
            attributes: ['id', 'nome', 'descricao', 'cor']
          },
          {
            model: StatusEscala,
            as: 'status',
            attributes: ['id', 'nome', 'cor']
          },
          {
            model: Culto,
            as: 'culto',
            attributes: ['id', 'titulo', 'data_culto', 'local']
          }
        ]
      });

      res.json({
        success: true,
        data: escalaAtualizada,
        message: 'Escala atualizada com sucesso'
      });
    } catch (error) {
      console.error('Erro ao atualizar escala:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  },

  /**
   * Excluir escala
   */
  async excluir(req, res) {
    try {
      const { id } = req.params;

      const escala = await Escala.findByPk(id);
      if (!escala) {
        return res.status(404).json({
          success: false,
          error: 'Escala não encontrada'
        });
      }

      // Verificar se pode excluir (não pode excluir escalas confirmadas)
      if (escala.status_id === 2) {
        return res.status(400).json({
          success: false,
          error: 'Não é possível excluir escala confirmada'
        });
      }

      await escala.destroy();

      res.json({
        success: true,
        message: 'Escala excluída com sucesso'
      });
    } catch (error) {
      console.error('Erro ao excluir escala:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  },

  /**
   * Confirmar escala
   */
  async confirmar(req, res) {
    try {
      const { id } = req.params;

      const escala = await Escala.findByPk(id);
      if (!escala) {
        return res.status(404).json({
          success: false,
          error: 'Escala não encontrada'
        });
      }

      const statusConfirmada = await StatusEscala.findOne({
        where: { nome: 'Confirmada' }
      });

      await escala.update({
        status_id: statusConfirmada?.id || 2,
        data_confirmacao: new Date()
      });

      const escalaAtualizada = await Escala.findByPk(id, {
        include: [
          {
            model: Pessoa,
            as: 'pessoa',
            attributes: ['id', 'nome_completo', 'telefone', 'whatsapp']
          },
          {
            model: StatusEscala,
            as: 'status',
            attributes: ['id', 'nome', 'cor']
          }
        ]
      });

      res.json({
        success: true,
        data: escalaAtualizada,
        message: 'Escala confirmada com sucesso'
      });
    } catch (error) {
      console.error('Erro ao confirmar escala:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  },

  /**
   * Cancelar escala
   */
  async cancelar(req, res) {
    try {
      const { id } = req.params;
      const { motivo } = req.body;

      const escala = await Escala.findByPk(id);
      if (!escala) {
        return res.status(404).json({
          success: false,
          error: 'Escala não encontrada'
        });
      }

      const statusCancelada = await StatusEscala.findOne({
        where: { nome: 'Cancelada' }
      });

      await escala.update({
        status_id: statusCancelada?.id || 4,
        observacoes: motivo ? `${escala.observacoes || ''}\nCancelada: ${motivo}`.trim() : escala.observacoes
      });

      const escalaAtualizada = await Escala.findByPk(id, {
        include: [
          {
            model: Pessoa,
            as: 'pessoa',
            attributes: ['id', 'nome', 'telefone', 'email']
          },
          {
            model: StatusEscala,
            as: 'status',
            attributes: ['id', 'nome', 'cor']
          }
        ]
      });

      res.json({
        success: true,
        data: escalaAtualizada,
        message: 'Escala cancelada com sucesso'
      });
    } catch (error) {
      console.error('Erro ao cancelar escala:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  },

  /**
   * Listar escalas por pessoa
   */
  async listarPorPessoa(req, res) {
    try {
      const { pessoa_id } = req.params;
      const { page = 1, limit = 10, status_id } = req.query;

      const offset = (page - 1) * limit;
      const where = { pessoa_id };

      if (status_id) {
        where.status_id = status_id;
      }

      const { count, rows } = await Escala.findAndCountAll({
        where,
        include: [
          {
            model: Funcao,
            as: 'funcao',
            attributes: ['id', 'nome', 'descricao', 'cor']
          },
          {
            model: StatusEscala,
            as: 'status',
            attributes: ['id', 'nome', 'cor']
          },
          {
            model: Culto,
            as: 'culto',
            attributes: ['id', 'titulo', 'data_hora', 'local'],
            include: [
              {
                model: TipoCulto,
                as: 'tipo',
                attributes: ['id', 'nome', 'cor']
              }
            ]
          }
        ],
        order: [['data_escala', 'DESC']],
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
      console.error('Erro ao listar escalas por pessoa:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  },

  /**
   * Estatísticas de escalas
   */
  async estatisticas(req, res) {
    try {
      const { data_inicio, data_fim } = req.query;

      const where = {};
      if (data_inicio && data_fim) {
        where.data_escala = {
          [Op.between]: [new Date(data_inicio), new Date(data_fim)]
        };
      }

      // Total de escalas
      const total = await Escala.count({ where });

      // Escalas por status
      const porStatus = await Escala.findAll({
        where,
        attributes: [
          'status_id',
          [require('sequelize').fn('COUNT', '*'), 'total']
        ],
        include: [
          {
            model: StatusEscala,
            as: 'status',
            attributes: ['nome', 'cor']
          }
        ],
        group: ['status_id', 'status.id', 'status.nome', 'status.cor']
      });

      // Escalas por função
      const porFuncao = await Escala.findAll({
        where,
        attributes: [
          'funcao_id',
          [require('sequelize').fn('COUNT', '*'), 'total']
        ],
        include: [
          {
            model: Funcao,
            as: 'funcao',
            attributes: ['nome', 'cor']
          }
        ],
        group: ['funcao_id', 'funcao.id', 'funcao.nome', 'funcao.cor'],
        order: [[require('sequelize').fn('COUNT', '*'), 'DESC']]
      });

      res.json({
        success: true,
        data: {
          total,
          por_status: porStatus,
          por_funcao: porFuncao
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

module.exports = escalasController;

