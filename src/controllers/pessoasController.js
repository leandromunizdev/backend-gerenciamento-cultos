const { Pessoa, CargoEclesiastico, Departamento, Usuario } = require('../models');
const { Op } = require('sequelize');
const { auditLogger } = require('../middleware/logger');

/**
 * @swagger
 * components:
 *   schemas:
 *     Pessoa:
 *       type: object
 *       required:
 *         - nome_completo
 *         - telefone
 *       properties:
 *         id:
 *           type: integer
 *           description: ID único da pessoa
 *         nome_completo:
 *           type: string
 *           description: Nome completo da pessoa
 *         telefone:
 *           type: string
 *           description: Telefone da pessoa
 *         email:
 *           type: string
 *           description: Email da pessoa
 *         data_nascimento:
 *           type: string
 *           format: date
 *           description: Data de nascimento
 *         endereco:
 *           type: string
 *           description: Endereço completo
 *         cargo_eclesiastico_id:
 *           type: integer
 *           description: ID do cargo eclesiástico
 *         departamento_id:
 *           type: integer
 *           description: ID do departamento
 *         ativo:
 *           type: boolean
 *           description: Se a pessoa está ativa
 */

/**
 * @swagger
 * /api/pessoas:
 *   get:
 *     summary: Listar pessoas
 *     tags: [Pessoas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: busca
 *         schema:
 *           type: string
 *         description: Buscar por nome, telefone ou email
 *       - in: query
 *         name: cargo_id
 *         schema:
 *           type: integer
 *         description: Filtrar por cargo eclesiástico
 *       - in: query
 *         name: departamento_id
 *         schema:
 *           type: integer
 *         description: Filtrar por departamento
 *       - in: query
 *         name: ativo
 *         schema:
 *           type: boolean
 *         description: Filtrar por status ativo
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
 *         description: Itens por página
 *     responses:
 *       200:
 *         description: Lista de pessoas
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
 *                     pessoas:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Pessoa'
 *                     total:
 *                       type: integer
 *                     page:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 */
const listar = async (req, res) => {
  try {
    const {
      busca,
      cargo_id,
      departamento_id,
      ativo,
      page = 1,
      limit = 10
    } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);
    const where = {};

    // Filtro de busca
    if (busca) {
      where[Op.or] = [
        { nome_completo: { [Op.iLike]: `%${busca}%` } },
        { telefone: { [Op.iLike]: `%${busca}%` } },
        { email: { [Op.iLike]: `%${busca}%` } }
      ];
    }

    // Filtros específicos
    if (cargo_id) {
      where.cargo_eclesiastico_id = cargo_id;
    }

    if (departamento_id) {
      where.departamento_id = departamento_id;
    }

    if (ativo !== undefined) {
      where.ativo = ativo === 'true';
    }

    const { count, rows: pessoas } = await Pessoa.findAndCountAll({
      where,
      include: [
        {
          model: CargoEclesiastico,
          as: 'cargoEclesiastico',
          attributes: ['id', 'nome']
        },
        {
          model: Departamento,
          as: 'departamento',
          attributes: ['id', 'nome']
        }
      ],
      order: [['nome_completo', 'ASC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    const totalPages = Math.ceil(count / parseInt(limit));

    res.json({
      success: true,
      data: {
        pessoas,
        total: count,
        page: parseInt(page),
        totalPages
      }
    });

  } catch (error) {
    console.error('Erro ao listar pessoas:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
};

/**
 * @swagger
 * /api/pessoas/{id}:
 *   get:
 *     summary: Obter pessoa por ID
 *     tags: [Pessoas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da pessoa
 *     responses:
 *       200:
 *         description: Dados da pessoa
 *       404:
 *         description: Pessoa não encontrada
 */
const obter = async (req, res) => {
  try {
    const { id } = req.params;

    const pessoa = await Pessoa.findByPk(id, {
      include: [
        {
          model: CargoEclesiastico,
          as: 'cargoEclesiastico',
          attributes: ['id', 'nome']
        },
        {
          model: Departamento,
          as: 'departamento',
          attributes: ['id', 'nome']
        },
        {
          model: Usuario,
          as: 'usuario',
          attributes: ['id', 'email', 'ativo']
        }
      ]
    });

    if (!pessoa) {
      return res.status(404).json({
        success: false,
        error: 'Pessoa não encontrada'
      });
    }

    res.json({
      success: true,
      data: pessoa
    });

  } catch (error) {
    console.error('Erro ao obter pessoa:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
};

/**
 * @swagger
 * /api/pessoas:
 *   post:
 *     summary: Criar nova pessoa
 *     tags: [Pessoas]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Pessoa'
 *     responses:
 *       201:
 *         description: Pessoa criada com sucesso
 *       400:
 *         description: Dados inválidos
 */
const criar = async (req, res) => {
  try {
    const {
      nome_completo,
      telefone,
      email,
      data_nascimento,
      endereco,
      cargo_eclesiastico_id,
      departamento_id,
      ativo = true
    } = req.body;

    // Validações
    if (!nome_completo || !telefone) {
      return res.status(400).json({
        success: false,
        error: 'Nome completo e telefone são obrigatórios'
      });
    }

    // Verificar se telefone já existe
    const telefoneExistente = await Pessoa.findOne({
      where: { telefone }
    });

    if (telefoneExistente) {
      return res.status(400).json({
        success: false,
        error: 'Já existe uma pessoa com este telefone'
      });
    }

    // Verificar se email já existe (se fornecido)
    if (email) {
      const emailExistente = await Pessoa.findOne({
        where: { email }
      });

      if (emailExistente) {
        return res.status(400).json({
          success: false,
          error: 'Já existe uma pessoa com este email'
        });
      }
    }

    const pessoa = await Pessoa.create({
      nome_completo,
      telefone,
      email,
      data_nascimento,
      endereco,
      cargo_eclesiastico_id,
      departamento_id,
      ativo
    });

    // Log de auditoria
    await auditLogger.log({
      usuario_id: req.user.id,
      acao: 'CREATE',
      tabela: 'pessoas',
      registro_id: pessoa.id,
      dados_novos: pessoa.toJSON()
    });

    // Buscar pessoa com associações
    const pessoaCriada = await Pessoa.findByPk(pessoa.id, {
      include: [
        {
          model: CargoEclesiastico,
          as: 'cargoEclesiastico',
          attributes: ['id', 'nome']
        },
        {
          model: Departamento,
          as: 'departamento',
          attributes: ['id', 'nome']
        }
      ]
    });

    res.status(201).json({
      success: true,
      data: pessoaCriada
    });

  } catch (error) {
    console.error('Erro ao criar pessoa:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
};

/**
 * @swagger
 * /api/pessoas/{id}:
 *   put:
 *     summary: Atualizar pessoa
 *     tags: [Pessoas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da pessoa
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Pessoa'
 *     responses:
 *       200:
 *         description: Pessoa atualizada com sucesso
 *       404:
 *         description: Pessoa não encontrada
 */
const atualizar = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      nome_completo,
      telefone,
      email,
      data_nascimento,
      endereco,
      cargo_eclesiastico_id,
      departamento_id,
      ativo
    } = req.body;

    const pessoa = await Pessoa.findByPk(id);

    if (!pessoa) {
      return res.status(404).json({
        success: false,
        error: 'Pessoa não encontrada'
      });
    }

    // Validações
    if (!nome_completo || !telefone) {
      return res.status(400).json({
        success: false,
        error: 'Nome completo e telefone são obrigatórios'
      });
    }

    // Verificar se telefone já existe (exceto para a própria pessoa)
    const telefoneExistente = await Pessoa.findOne({
      where: { 
        telefone,
        id: { [Op.ne]: id }
      }
    });

    if (telefoneExistente) {
      return res.status(400).json({
        success: false,
        error: 'Já existe uma pessoa com este telefone'
      });
    }

    // Verificar se email já existe (se fornecido e exceto para a própria pessoa)
    if (email) {
      const emailExistente = await Pessoa.findOne({
        where: { 
          email,
          id: { [Op.ne]: id }
        }
      });

      if (emailExistente) {
        return res.status(400).json({
          success: false,
          error: 'Já existe uma pessoa com este email'
        });
      }
    }

    const dadosAntigos = pessoa.toJSON();

    await pessoa.update({
      nome_completo,
      telefone,
      email,
      data_nascimento,
      endereco,
      cargo_eclesiastico_id,
      departamento_id,
      ativo
    });

    // Log de auditoria
    await auditLogger.log({
      usuario_id: req.user.id,
      acao: 'UPDATE',
      tabela: 'pessoas',
      registro_id: pessoa.id,
      dados_antigos: dadosAntigos,
      dados_novos: pessoa.toJSON()
    });

    // Buscar pessoa atualizada com associações
    const pessoaAtualizada = await Pessoa.findByPk(id, {
      include: [
        {
          model: CargoEclesiastico,
          as: 'cargoEclesiastico',
          attributes: ['id', 'nome']
        },
        {
          model: Departamento,
          as: 'departamento',
          attributes: ['id', 'nome']
        }
      ]
    });

    res.json({
      success: true,
      data: pessoaAtualizada
    });

  } catch (error) {
    console.error('Erro ao atualizar pessoa:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
};

/**
 * @swagger
 * /api/pessoas/{id}:
 *   delete:
 *     summary: Excluir pessoa
 *     tags: [Pessoas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da pessoa
 *     responses:
 *       200:
 *         description: Pessoa excluída com sucesso
 *       404:
 *         description: Pessoa não encontrada
 */
const excluir = async (req, res) => {
  try {
    const { id } = req.params;

    const pessoa = await Pessoa.findByPk(id);

    if (!pessoa) {
      return res.status(404).json({
        success: false,
        error: 'Pessoa não encontrada'
      });
    }

    // Verificar se pessoa tem usuário associado
    const usuario = await Usuario.findOne({
      where: { pessoa_id: id }
    });

    if (usuario) {
      return res.status(400).json({
        success: false,
        error: 'Não é possível excluir pessoa que possui usuário associado'
      });
    }

    const dadosAntigos = pessoa.toJSON();

    await pessoa.destroy();

    // Log de auditoria
    await auditLogger.log({
      usuario_id: req.user.id,
      acao: 'DELETE',
      tabela: 'pessoas',
      registro_id: id,
      dados_antigos: dadosAntigos
    });

    res.json({
      success: true,
      message: 'Pessoa excluída com sucesso'
    });

  } catch (error) {
    console.error('Erro ao excluir pessoa:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
};

/**
 * @swagger
 * /api/pessoas/estatisticas:
 *   get:
 *     summary: Obter estatísticas de pessoas
 *     tags: [Pessoas]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Estatísticas de pessoas
 */
const estatisticas = async (req, res) => {
  try {
    const totalPessoas = await Pessoa.count();
    const pessoasAtivas = await Pessoa.count({ where: { ativo: true } });
    const pessoasInativas = await Pessoa.count({ where: { ativo: false } });

    // Estatísticas por cargo
    const porCargo = await Pessoa.findAll({
      attributes: [
        [CargoEclesiastico.sequelize.col('cargoEclesiastico.nome'), 'cargo'],
        [CargoEclesiastico.sequelize.fn('COUNT', CargoEclesiastico.sequelize.col('Pessoa.id')), 'total']
      ],
      include: [
        {
          model: CargoEclesiastico,
          as: 'cargoEclesiastico',
          attributes: []
        }
      ],
      group: ['cargoEclesiastico.id', 'cargoEclesiastico.nome'],
      raw: true
    });

    // Estatísticas por departamento
    const porDepartamento = await Pessoa.findAll({
      attributes: [
        [Departamento.sequelize.col('departamento.nome'), 'departamento'],
        [Departamento.sequelize.fn('COUNT', Departamento.sequelize.col('Pessoa.id')), 'total']
      ],
      include: [
        {
          model: Departamento,
          as: 'departamento',
          attributes: []
        }
      ],
      group: ['departamento.id', 'departamento.nome'],
      raw: true
    });

    res.json({
      success: true,
      data: {
        totalPessoas,
        pessoasAtivas,
        pessoasInativas,
        porCargo,
        porDepartamento
      }
    });

  } catch (error) {
    console.error('Erro ao obter estatísticas:', error);
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
  estatisticas
};

