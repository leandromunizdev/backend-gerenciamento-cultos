const { Perfil, Permissao, PerfilPermissao, Usuario, sequelize } = require('../models');
const { Op } = require('sequelize');
const { auditLogger } = require('../middleware/logger');

/**
 * Controlador para gerenciamento de perfis
 */
const perfisController = {
    /**
     * Listar perfis com filtros e paginação
     */
    async listar(req, res) {
        try {
            const {
                page = 1,
                limit = 10,
                busca = '',
                ativo = '',
                nivel_acesso = ''
            } = req.query;

            const offset = (page - 1) * limit;
            const where = {};

            // Filtro de busca por nome
            if (busca) {
                where.nome = {
                    [Op.iLike]: `%${busca}%`
                };
            }

            // Filtro por status ativo
            if (ativo !== '') {
                where.ativo = ativo === 'true';
            }

            // Filtro por nível de acesso
            if (nivel_acesso) {
                where.nivel_acesso = nivel_acesso;
            }

            const { count, rows: perfis } = await Perfil.findAndCountAll({
                where,
                include: [
                    {
                        model: Permissao,
                        as: 'permissoes',
                        attributes: ['id', 'codigo', 'nome', 'modulo'],
                        through: { attributes: [] }
                    }
                ],
                order: [['nivel_acesso', 'DESC'], ['nome', 'ASC']],
                limit: parseInt(limit),
                offset: parseInt(offset)
            });

            const totalPages = Math.ceil(count / limit);

            res.json({
                success: true,
                data: {
                    perfis,
                    total: count,
                    totalPages,
                    currentPage: parseInt(page),
                    limit: parseInt(limit)
                }
            });
        } catch (error) {
            console.error('Erro ao listar perfis:', error);
            res.status(500).json({
                success: false,
                error: 'Erro interno do servidor'
            });
        }
    },

    /**
     * Listar todos os perfis (sem paginação) - para dropdowns
     */
    async listarTodos(req, res) {
        try {
            const perfis = await Perfil.findAll({
                where: { ativo: true },
                attributes: ['id', 'nome', 'descricao', 'nivel_acesso'],
                order: [['nivel_acesso', 'DESC'], ['nome', 'ASC']]
            });

            res.json({
                success: true,
                data: perfis
            });
        } catch (error) {
            console.error('Erro ao listar todos os perfis:', error);
            res.status(500).json({
                success: false,
                error: 'Erro interno do servidor'
            });
        }
    },

    /**
     * Obter perfil por ID
     */
    async obter(req, res) {
        try {
            const { id } = req.params;

            const perfil = await Perfil.findByPk(id, {
                include: [
                    {
                        model: Permissao,
                        as: 'permissoes',
                        attributes: ['id', 'codigo', 'nome', 'descricao', 'modulo'],
                        through: { attributes: [] }
                    }
                ]
            });

            if (!perfil) {
                return res.status(404).json({
                    success: false,
                    error: 'Perfil não encontrado'
                });
            }

            res.json({
                success: true,
                data: perfil
            });
        } catch (error) {
            console.error('Erro ao obter perfil:', error);
            res.status(500).json({
                success: false,
                error: 'Erro interno do servidor'
            });
        }
    },

    /**
     * Criar novo perfil
     */
    async criar(req, res) {
        try {
            const {
                nome,
                descricao,
                nivel_acesso,
                ativo = true,
                permissoes = []
            } = req.body;

            // Validações
            if (!nome || !nivel_acesso) {
                return res.status(400).json({
                    success: false,
                    error: 'Campos obrigatórios: nome, nivel_acesso'
                });
            }

            // Verificar se nome já existe
            const perfilExistente = await Perfil.findOne({
                where: { nome }
            });

            if (perfilExistente) {
                return res.status(400).json({
                    success: false,
                    error: 'Nome do perfil já está em uso'
                });
            }

            // Validar nível de acesso
            if (nivel_acesso < 1 || nivel_acesso > 10) {
                return res.status(400).json({
                    success: false,
                    error: 'Nível de acesso deve estar entre 1 e 10'
                });
            }

            // Criar perfil
            const perfil = await Perfil.create({
                nome,
                descricao,
                nivel_acesso,
                ativo
            });

            // Associar permissões se fornecidas
            if (permissoes.length > 0) {
                // Verificar se todas as permissões existem
                const permissoesExistentes = await Permissao.findAll({
                    where: { id: { [Op.in]: permissoes } }
                });

                if (permissoesExistentes.length !== permissoes.length) {
                    return res.status(400).json({
                        success: false,
                        error: 'Uma ou mais permissões não foram encontradas'
                    });
                }

                // Associar permissões
                await perfil.setPermissoes(permissoes);
            }

            // Buscar perfil criado com relacionamentos
            const perfilCriado = await Perfil.findByPk(perfil.id, {
                include: [
                    {
                        model: Permissao,
                        as: 'permissoes',
                        attributes: ['id', 'codigo', 'nome', 'descricao', 'modulo'],
                        through: { attributes: [] }
                    }
                ]
            });

            // Log de auditoria
            await auditLogger.log({
                usuario_id: req.user?.id,
                acao: 'CREATE',
                tabela: 'perfis',
                registro_id: perfil.id,
                dados_anteriores: null,
                dados_novos: {
                    nome: perfil.nome,
                    descricao: perfil.descricao,
                    nivel_acesso: perfil.nivel_acesso,
                    ativo: perfil.ativo,
                    permissoes: permissoes
                },
                ip: req.ip,
                user_agent: req.get('User-Agent')
            });

            res.status(201).json({
                success: true,
                data: perfilCriado,
                message: 'Perfil criado com sucesso'
            });
        } catch (error) {
            console.error('Erro ao criar perfil:', error);
            res.status(500).json({
                success: false,
                error: 'Erro interno do servidor'
            });
        }
    },

    /**
     * Atualizar perfil
     */
    async atualizar(req, res) {
        try {
            const { id } = req.params;
            const {
                nome,
                descricao,
                nivel_acesso,
                ativo,
                permissoes
            } = req.body;

            const perfil = await Perfil.findByPk(id);

            if (!perfil) {
                return res.status(404).json({
                    success: false,
                    error: 'Perfil não encontrado'
                });
            }

            // Dados anteriores para auditoria
            const dadosAnteriores = {
                nome: perfil.nome,
                descricao: perfil.descricao,
                nivel_acesso: perfil.nivel_acesso,
                ativo: perfil.ativo
            };

            // Verificar se nome já existe (se foi alterado)
            if (nome && nome !== perfil.nome) {
                const perfilExistente = await Perfil.findOne({
                    where: {
                        nome,
                        id: { [Op.ne]: id }
                    }
                });

                if (perfilExistente) {
                    return res.status(400).json({
                        success: false,
                        error: 'Nome do perfil já está em uso'
                    });
                }
            }

            // Validar nível de acesso se foi alterado
            if (nivel_acesso && (nivel_acesso < 1 || nivel_acesso > 10)) {
                return res.status(400).json({
                    success: false,
                    error: 'Nível de acesso deve estar entre 1 e 10'
                });
            }

            // Atualizar perfil
            await perfil.update({
                nome: nome || perfil.nome,
                descricao: descricao !== undefined ? descricao : perfil.descricao,
                nivel_acesso: nivel_acesso || perfil.nivel_acesso,
                ativo: ativo !== undefined ? ativo : perfil.ativo
            });

            // Atualizar permissões se fornecidas
            if (permissoes !== undefined) {
                if (permissoes.length > 0) {
                    // Verificar se todas as permissões existem
                    const permissoesExistentes = await Permissao.findAll({
                        where: { id: { [Op.in]: permissoes } }
                    });

                    if (permissoesExistentes.length !== permissoes.length) {
                        return res.status(400).json({
                            success: false,
                            error: 'Uma ou mais permissões não foram encontradas'
                        });
                    }
                }

                // Atualizar associações
                await perfil.setPermissoes(permissoes);
            }

            // Buscar perfil atualizado com relacionamentos
            const perfilAtualizado = await Perfil.findByPk(id, {
                include: [
                    {
                        model: Permissao,
                        as: 'permissoes',
                        attributes: ['id', 'codigo', 'nome', 'descricao', 'modulo'],
                        through: { attributes: [] }
                    }
                ]
            });

            // Log de auditoria
            await auditLogger.log({
                usuario_id: req.user?.id,
                acao: 'UPDATE',
                tabela: 'perfis',
                registro_id: id,
                dados_anteriores: dadosAnteriores,
                dados_novos: {
                    nome: perfil.nome,
                    descricao: perfil.descricao,
                    nivel_acesso: perfil.nivel_acesso,
                    ativo: perfil.ativo,
                    permissoes: permissoes
                },
                ip: req.ip,
                user_agent: req.get('User-Agent')
            });

            res.json({
                success: true,
                data: perfilAtualizado,
                message: 'Perfil atualizado com sucesso'
            });
        } catch (error) {
            console.error('Erro ao atualizar perfil:', error);
            res.status(500).json({
                success: false,
                error: 'Erro interno do servidor'
            });
        }
    },

    /**
     * Excluir perfil (soft delete)
     */
    async excluir(req, res) {
        try {
            const { id } = req.params;

            const perfil = await Perfil.findByPk(id);

            if (!perfil) {
                return res.status(404).json({
                    success: false,
                    error: 'Perfil não encontrado'
                });
            }

            // Verificar se há usuários usando este perfil
            const usuariosComPerfil = await Usuario.count({
                where: { perfil_id: id }
            });

            if (usuariosComPerfil > 0) {
                return res.status(400).json({
                    success: false,
                    error: `Não é possível excluir o perfil. Há ${usuariosComPerfil} usuário(s) usando este perfil.`
                });
            }

            // Dados para auditoria
            const dadosAnteriores = {
                nome: perfil.nome,
                descricao: perfil.descricao,
                nivel_acesso: perfil.nivel_acesso,
                ativo: perfil.ativo
            };

            // Soft delete
            await perfil.destroy();

            // Log de auditoria
            await auditLogger.log({
                usuario_id: req.user?.id,
                acao: 'DELETE',
                tabela: 'perfis',
                registro_id: id,
                dados_anteriores: dadosAnteriores,
                dados_novos: null,
                ip: req.ip,
                user_agent: req.get('User-Agent')
            });

            res.json({
                success: true,
                message: 'Perfil excluído com sucesso'
            });
        } catch (error) {
            console.error('Erro ao excluir perfil:', error);
            res.status(500).json({
                success: false,
                error: 'Erro interno do servidor'
            });
        }
    },

    /**
     * Ativar/Desativar perfil
     */
    async toggleAtivo(req, res) {
        try {
            const { id } = req.params;

            const perfil = await Perfil.findByPk(id);

            if (!perfil) {
                return res.status(404).json({
                    success: false,
                    error: 'Perfil não encontrado'
                });
            }

            const dadosAnteriores = { ativo: perfil.ativo };

            // Toggle status
            await perfil.update({ ativo: !perfil.ativo });

            // Log de auditoria
            await auditLogger.log({
                usuario_id: req.user?.id,
                acao: 'UPDATE',
                tabela: 'perfis',
                registro_id: id,
                dados_anteriores: dadosAnteriores,
                dados_novos: { ativo: perfil.ativo },
                ip: req.ip,
                user_agent: req.get('User-Agent')
            });

            res.json({
                success: true,
                data: { ativo: perfil.ativo },
                message: `Perfil ${perfil.ativo ? 'ativado' : 'desativado'} com sucesso`
            });
        } catch (error) {
            console.error('Erro ao alterar status do perfil:', error);
            res.status(500).json({
                success: false,
                error: 'Erro interno do servidor'
            });
        }
    },

    /**
     * Obter todas as permissões disponíveis
     */
    async listarPermissoes(req, res) {
        try {
            const permissoes = await Permissao.findAll({
                attributes: ['id', 'codigo', 'nome', 'descricao', 'modulo'],
                order: [['modulo', 'ASC'], ['nome', 'ASC']]
            });

            // Agrupar por módulo
            const permissoesPorModulo = permissoes.reduce((acc, permissao) => {
                const modulo = permissao.modulo || 'Geral';
                if (!acc[modulo]) {
                    acc[modulo] = [];
                }
                acc[modulo].push(permissao);
                return acc;
            }, {});

            res.json({
                success: true,
                data: {
                    permissoes,
                    permissoesPorModulo
                }
            });
        } catch (error) {
            console.error('Erro ao listar permissões:', error);
            res.status(500).json({
                success: false,
                error: 'Erro interno do servidor'
            });
        }
    },

    /**
     * Obter estatísticas de perfis
     */
    async estatisticas(req, res) {
        try {
            const total = await Perfil.count();
            const ativos = await Perfil.count({ where: { ativo: true } });
            const inativos = await Perfil.count({ where: { ativo: false } });

            // Perfis por nível de acesso
            const perfisPorNivel = await Perfil.findAll({
                attributes: [
                    'nivel_acesso',
                    [sequelize.fn('COUNT', sequelize.col('id')), 'total']
                ],
                group: ['nivel_acesso'],
                order: [['nivel_acesso', 'DESC']],
                raw: true
            });

            // Usuários por perfil
            const usuariosPorPerfil = await Perfil.findAll({
                attributes: [
                    'id',
                    'nome',
                    [sequelize.fn('COUNT', sequelize.col('usuarios.id')), 'total_usuarios']
                ],
                include: [
                    {
                        model: Usuario,
                        as: 'usuarios',
                        attributes: [],
                        required: false
                    }
                ],
                group: ['Perfil.id', 'Perfil.nome'],
                order: [['nome', 'ASC']],
                raw: true
            });

            res.json({
                success: true,
                data: {
                    total,
                    ativos,
                    inativos,
                    perfisPorNivel,
                    usuariosPorPerfil
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

module.exports = perfisController;

