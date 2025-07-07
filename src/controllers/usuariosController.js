const { Usuario, Perfil, Pessoa, Permissao } = require('../models');
const bcrypt = require('bcryptjs');
const { Op } = require('sequelize');
const { auditLogger } = require('../middleware/logger');

/**
 * Controlador para gerenciamento de usuários
 */
const usuariosController = {
    /**
     * Listar usuários com filtros e paginação
     */
    async listar(req, res) {
        try {
            const {
                page = 1,
                limit = 10,
                busca = '',
                perfil_id = '',
                ativo = '',
                email_verificado = ''
            } = req.query;

            const offset = (page - 1) * limit;
            const where = {};

            // Filtro de busca por email
            if (busca) {
                where.email = {
                    [Op.iLike]: `%${busca}%`
                };
            }

            // Filtro por perfil
            if (perfil_id) {
                where.perfil_id = perfil_id;
            }

            // Filtro por status ativo
            if (ativo !== '') {
                where.ativo = ativo === 'true';
            }

            // Filtro por email verificado
            if (email_verificado !== '') {
                where.email_verificado = email_verificado === 'true';
            }

            const { count, rows: usuarios } = await Usuario.findAndCountAll({
                where,
                include: [
                    {
                        model: Perfil,
                        as: 'perfil',
                        attributes: ['id', 'nome', 'descricao', 'nivel_acesso']
                    },
                    {
                        model: Pessoa,
                        as: 'pessoa',
                        attributes: ['id', 'nome_completo', 'telefone'],
                        required: false
                    }
                ],
                attributes: {
                    exclude: ['senha_hash', 'token_verificacao', 'token_reset_senha']
                },
                order: [['criado_em', 'DESC']],
                limit: parseInt(limit),
                offset: parseInt(offset)
            });

            const totalPages = Math.ceil(count / limit);

            res.json({
                success: true,
                data: {
                    usuarios,
                    total: count,
                    totalPages,
                    currentPage: parseInt(page),
                    limit: parseInt(limit)
                }
            });
        } catch (error) {
            console.error('Erro ao listar usuários:', error);
            res.status(500).json({
                success: false,
                error: 'Erro interno do servidor'
            });
        }
    },

    /**
     * Obter usuário por ID
     */
    async obter(req, res) {
        try {
            const { id } = req.params;

            const usuario = await Usuario.findByPk(id, {
                include: [
                    {
                        model: Perfil,
                        as: 'perfil',
                        include: [
                            {
                                model: Permissao,
                                as: 'permissoes',
                                attributes: ['id', 'codigo', 'nome', 'descricao', 'modulo'],
                                through: { attributes: [] }
                            }
                        ]
                    },
                    {
                        model: Pessoa,
                        as: 'pessoa',
                        attributes: ['id', 'nome_completo', 'telefone', 'email'],
                        required: false
                    }
                ],
                attributes: {
                    exclude: ['senha_hash', 'token_verificacao', 'token_reset_senha']
                }
            });

            if (!usuario) {
                return res.status(404).json({
                    success: false,
                    error: 'Usuário não encontrado'
                });
            }

            res.json({
                success: true,
                data: usuario
            });
        } catch (error) {
            console.error('Erro ao obter usuário:', error);
            res.status(500).json({
                success: false,
                error: 'Erro interno do servidor'
            });
        }
    },

    /**
     * Criar novo usuário
     */
    async criar(req, res) {
        try {
            const {
                email,
                senha,
                perfil_id,
                pessoa_id,
                ativo = true,
                email_verificado = false
            } = req.body;

            // Validações
            if (!email || !senha || !perfil_id) {
                return res.status(400).json({
                    success: false,
                    error: 'Campos obrigatórios: email, senha, perfil_id'
                });
            }

            // Verificar se email já existe
            const usuarioExistente = await Usuario.findOne({
                where: { email }
            });

            if (usuarioExistente) {
                return res.status(400).json({
                    success: false,
                    error: 'Email já está em uso'
                });
            }

            // Verificar se perfil existe
            const perfil = await Perfil.findByPk(perfil_id);
            if (!perfil) {
                return res.status(400).json({
                    success: false,
                    error: 'Perfil não encontrado'
                });
            }

            // Verificar se pessoa existe (se fornecida)
            if (pessoa_id) {
                const pessoa = await Pessoa.findByPk(pessoa_id);
                if (!pessoa) {
                    return res.status(400).json({
                        success: false,
                        error: 'Pessoa não encontrada'
                    });
                }
            }

            // Criar usuário
            const senha_hash = await bcrypt.hash(senha, 12);
            const usuario = await Usuario.create({
                email,
                senha_hash, // Será hasheada pelo hook
                perfil_id,
                pessoa_id,
                ativo,
                email_verificado
            });

            // Buscar usuário criado com relacionamentos
            const usuarioCriado = await Usuario.findByPk(usuario.id, {
                include: [
                    {
                        model: Perfil,
                        as: 'perfil',
                        attributes: ['id', 'nome', 'descricao', 'nivel_acesso']
                    },
                    {
                        model: Pessoa,
                        as: 'pessoa',
                        attributes: ['id', 'nome_completo', 'telefone'],
                        required: false
                    }
                ],
                attributes: {
                    exclude: ['senha_hash', 'token_verificacao', 'token_reset_senha']
                }
            });

            // Log de auditoria
            await auditLogger.log({
                usuario_id: req.user?.id,
                acao: 'CREATE',
                tabela: 'usuarios',
                registro_id: usuario.id,
                dados_anteriores: null,
                dados_novos: {
                    email: usuario.email,
                    perfil_id: usuario.perfil_id,
                    pessoa_id: usuario.pessoa_id,
                    ativo: usuario.ativo
                },
                ip: req.ip,
                user_agent: req.get('User-Agent')
            });

            res.status(201).json({
                success: true,
                data: usuarioCriado,
                message: 'Usuário criado com sucesso'
            });
        } catch (error) {
            console.error('Erro ao criar usuário:', error);
            res.status(500).json({
                success: false,
                error: 'Erro interno do servidor'
            });
        }
    },

    /**
     * Atualizar usuário
     */
    async atualizar(req, res) {
        try {
            const { id } = req.params;
            const {
                email,
                perfil_id,
                pessoa_id,
                ativo,
                email_verificado
            } = req.body;

            const usuario = await Usuario.findByPk(id);

            if (!usuario) {
                return res.status(404).json({
                    success: false,
                    error: 'Usuário não encontrado'
                });
            }

            // Dados anteriores para auditoria
            const dadosAnteriores = {
                email: usuario.email,
                perfil_id: usuario.perfil_id,
                pessoa_id: usuario.pessoa_id,
                ativo: usuario.ativo,
                email_verificado: usuario.email_verificado
            };

            // Verificar se email já existe (se foi alterado)
            if (email && email !== usuario.email) {
                const usuarioExistente = await Usuario.findOne({
                    where: {
                        email,
                        id: { [Op.ne]: id }
                    }
                });

                if (usuarioExistente) {
                    return res.status(400).json({
                        success: false,
                        error: 'Email já está em uso'
                    });
                }
            }

            // Verificar se perfil existe (se foi alterado)
            if (perfil_id && perfil_id !== usuario.perfil_id) {
                const perfil = await Perfil.findByPk(perfil_id);
                if (!perfil) {
                    return res.status(400).json({
                        success: false,
                        error: 'Perfil não encontrado'
                    });
                }
            }

            // Verificar se pessoa existe (se foi alterada)
            if (pessoa_id && pessoa_id !== usuario.pessoa_id) {
                const pessoa = await Pessoa.findByPk(pessoa_id);
                if (!pessoa) {
                    return res.status(400).json({
                        success: false,
                        error: 'Pessoa não encontrada'
                    });
                }
            }

            // Atualizar usuário
            await usuario.update({
                email: email || usuario.email,
                perfil_id: perfil_id || usuario.perfil_id,
                pessoa_id: pessoa_id !== undefined ? pessoa_id : usuario.pessoa_id,
                ativo: ativo !== undefined ? ativo : usuario.ativo,
                email_verificado: email_verificado !== undefined ? email_verificado : usuario.email_verificado
            });

            // Buscar usuário atualizado com relacionamentos
            const usuarioAtualizado = await Usuario.findByPk(id, {
                include: [
                    {
                        model: Perfil,
                        as: 'perfil',
                        attributes: ['id', 'nome', 'descricao', 'nivel_acesso']
                    },
                    {
                        model: Pessoa,
                        as: 'pessoa',
                        attributes: ['id', 'nome_completo', 'telefone'],
                        required: false
                    }
                ],
                attributes: {
                    exclude: ['senha_hash', 'token_verificacao', 'token_reset_senha']
                }
            });

            // Log de auditoria
            await auditLogger.log({
                usuario_id: req.user?.id,
                acao: 'UPDATE',
                tabela: 'usuarios',
                registro_id: id,
                dados_anteriores: dadosAnteriores,
                dados_novos: {
                    email: usuario.email,
                    perfil_id: usuario.perfil_id,
                    pessoa_id: usuario.pessoa_id,
                    ativo: usuario.ativo,
                    email_verificado: usuario.email_verificado
                },
                ip: req.ip,
                user_agent: req.get('User-Agent')
            });

            res.json({
                success: true,
                data: usuarioAtualizado,
                message: 'Usuário atualizado com sucesso'
            });
        } catch (error) {
            console.error('Erro ao atualizar usuário:', error);
            res.status(500).json({
                success: false,
                error: 'Erro interno do servidor'
            });
        }
    },

    /**
     * Alterar senha do usuário
     */
    async alterarSenha(req, res) {
        try {
            const { id } = req.params;
            const { senha_atual, nova_senha } = req.body;

            if (!senha_atual || !nova_senha) {
                return res.status(400).json({
                    success: false,
                    error: 'Campos obrigatórios: senha_atual, nova_senha'
                });
            }

            const usuario = await Usuario.findByPk(id);

            if (!usuario) {
                return res.status(404).json({
                    success: false,
                    error: 'Usuário não encontrado'
                });
            }

            // Verificar senha atual
            const senhaValida = await usuario.verificarSenha(senha_atual);
            if (!senhaValida) {
                return res.status(400).json({
                    success: false,
                    error: 'Senha atual incorreta'
                });
            }

            // Atualizar senha
            await usuario.setSenha(nova_senha);
            await usuario.save();

            // Log de auditoria
            await auditLogger.log({
                usuario_id: req.user?.id,
                acao: 'UPDATE',
                tabela: 'usuarios',
                registro_id: id,
                dados_anteriores: null,
                dados_novos: { acao: 'alteracao_senha' },
                ip: req.ip,
                user_agent: req.get('User-Agent')
            });

            res.json({
                success: true,
                message: 'Senha alterada com sucesso'
            });
        } catch (error) {
            console.error('Erro ao alterar senha:', error);
            res.status(500).json({
                success: false,
                error: 'Erro interno do servidor'
            });
        }
    },

    /**
     * Resetar senha do usuário (admin)
     */
    async resetarSenha(req, res) {
        try {
            const { id } = req.params;
            const { nova_senha } = req.body;

            if (!nova_senha) {
                return res.status(400).json({
                    success: false,
                    error: 'Campo obrigatório: nova_senha'
                });
            }

            const usuario = await Usuario.findByPk(id);

            if (!usuario) {
                return res.status(404).json({
                    success: false,
                    error: 'Usuário não encontrado'
                });
            }

            // Atualizar senha
            await usuario.setSenha(nova_senha);
            await usuario.save();

            // Log de auditoria
            await auditLogger.log({
                usuario_id: req.user?.id,
                acao: 'UPDATE',
                tabela: 'usuarios',
                registro_id: id,
                dados_anteriores: null,
                dados_novos: { acao: 'reset_senha_admin' },
                ip: req.ip,
                user_agent: req.get('User-Agent')
            });

            res.json({
                success: true,
                message: 'Senha resetada com sucesso'
            });
        } catch (error) {
            console.error('Erro ao resetar senha:', error);
            res.status(500).json({
                success: false,
                error: 'Erro interno do servidor'
            });
        }
    },

    /**
     * Excluir usuário (soft delete)
     */
    async excluir(req, res) {
        try {
            const { id } = req.params;

            const usuario = await Usuario.findByPk(id);

            if (!usuario) {
                return res.status(404).json({
                    success: false,
                    error: 'Usuário não encontrado'
                });
            }

            // Não permitir excluir o próprio usuário
            if (parseInt(id) === req.user?.id) {
                return res.status(400).json({
                    success: false,
                    error: 'Não é possível excluir seu próprio usuário'
                });
            }

            // Dados para auditoria
            const dadosAnteriores = {
                email: usuario.email,
                perfil_id: usuario.perfil_id,
                pessoa_id: usuario.pessoa_id,
                ativo: usuario.ativo
            };

            // Soft delete
            await usuario.destroy();

            // Log de auditoria
            await auditLogger.log({
                usuario_id: req.user?.id,
                acao: 'DELETE',
                tabela: 'usuarios',
                registro_id: id,
                dados_anteriores: dadosAnteriores,
                dados_novos: null,
                ip: req.ip,
                user_agent: req.get('User-Agent')
            });

            res.json({
                success: true,
                message: 'Usuário excluído com sucesso'
            });
        } catch (error) {
            console.error('Erro ao excluir usuário:', error);
            res.status(500).json({
                success: false,
                error: 'Erro interno do servidor'
            });
        }
    },

    /**
     * Ativar/Desativar usuário
     */
    async toggleAtivo(req, res) {
        try {
            const { id } = req.params;

            const usuario = await Usuario.findByPk(id);

            if (!usuario) {
                return res.status(404).json({
                    success: false,
                    error: 'Usuário não encontrado'
                });
            }

            // Não permitir desativar o próprio usuário
            if (parseInt(id) === req.user?.id && usuario.ativo) {
                return res.status(400).json({
                    success: false,
                    error: 'Não é possível desativar seu próprio usuário'
                });
            }

            const dadosAnteriores = { ativo: usuario.ativo };

            // Toggle status
            await usuario.update({ ativo: !usuario.ativo });

            // Log de auditoria
            await auditLogger.log({
                usuario_id: req.user?.id,
                acao: 'UPDATE',
                tabela: 'usuarios',
                registro_id: id,
                dados_anteriores: dadosAnteriores,
                dados_novos: { ativo: usuario.ativo },
                ip: req.ip,
                user_agent: req.get('User-Agent')
            });

            res.json({
                success: true,
                data: { ativo: usuario.ativo },
                message: `Usuário ${usuario.ativo ? 'ativado' : 'desativado'} com sucesso`
            });
        } catch (error) {
            console.error('Erro ao alterar status do usuário:', error);
            res.status(500).json({
                success: false,
                error: 'Erro interno do servidor'
            });
        }
    },

    /**
     * Obter estatísticas de usuários
     */
    async estatisticas(req, res) {
        try {
            const total = await Usuario.count();
            const ativos = await Usuario.count({ where: { ativo: true } });
            const inativos = await Usuario.count({ where: { ativo: false } });
            const emailsVerificados = await Usuario.count({ where: { email_verificado: true } });
            const emailsNaoVerificados = await Usuario.count({ where: { email_verificado: false } });

            // Usuários por perfil
            const usuariosPorPerfil = await Usuario.findAll({
                attributes: [],
                include: [
                    {
                        model: Perfil,
                        as: 'perfil',
                        attributes: ['id', 'nome']
                    }
                ],
                group: ['perfil.id', 'perfil.nome'],
                raw: true
            });

            res.json({
                success: true,
                data: {
                    total,
                    ativos,
                    inativos,
                    emailsVerificados,
                    emailsNaoVerificados,
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

module.exports = usuariosController;

