const jwt = require('jsonwebtoken');
const { Usuario, Pessoa, CargoEclesiastico, Departamento, Perfil, Permissao } = require('../models');
const { auditLogger } = require('../middleware/logger');

const generateToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
  );
};

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Fazer login no sistema
 *     tags: [Autenticação]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - senha
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               senha:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login realizado com sucesso
 *       401:
 *         description: Credenciais inválidas
 */
const login = async (req, res) => {
  try {
    const { email, senha } = req.body;

    if (!email || !senha) {
      return res.status(400).json({
        success: false,
        error: 'Email e senha são obrigatórios'
      });
    }

    const usuario = await Usuario.findOne({
      where: { email: email.toLowerCase() },
      include: [
        {
          model: Pessoa,
          as: 'pessoa',
          include: [
            { model: CargoEclesiastico, as: 'cargoEclesiastico' },
            { model: Departamento, as: 'departamento' }
          ]
        },
        {
          model: Perfil,
          as: 'perfil',
          include: [
            {
              model: Permissao,
              as: 'permissoes',
              through: { attributes: [] }
            }
          ]
        }
      ]
    });

    if (!usuario) {
      return res.status(401).json({
        success: false,
        error: 'Credenciais inválidas'
      });
    }

    if (!usuario.ativo) {
      return res.status(401).json({
        success: false,
        error: 'Usuário inativo'
      });
    }

    if (usuario.estaBloqueado()) {
      return res.status(401).json({
        success: false,
        error: 'Usuário temporariamente bloqueado devido a múltiplas tentativas de login'
      });
    }

    const senhaValida = await usuario.verificarSenha(senha);
    if (!senhaValida) {
      await usuario.incrementarTentativasLogin();
      return res.status(401).json({
        success: false,
        error: 'Credenciais inválidas'
      });
    }

    const token = generateToken(usuario.id);

    const usuarioLimpo = usuario.toJSON();

    await auditLogger.log(req, 'LOGIN', 'usuarios', usuarioLimpo.id, null, { email });

    const permissoes = usuarioLimpo.perfil?.permissoes?.map(p => p.codigo) || [];

    const dadosUsuario = {
      id: usuarioLimpo.id,
      email: usuarioLimpo.email,
      pessoa: usuarioLimpo.pessoa,
      perfil: {
        id: usuarioLimpo.perfil?.id,
        nome: usuarioLimpo.perfil?.nome,
        nivel_acesso: usuarioLimpo.perfil?.nivel_acesso,
        permissoes: permissoes
      }
    };

    res.json({
      success: true,
      token,
      usuario: dadosUsuario
    });

  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
};

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Obter dados do usuário logado
 *     tags: [Autenticação]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dados do usuário
 *       401:
 *         description: Não autenticado
 */
const me = async (req, res) => {
  try {
    const usuario = await Usuario.findByPk(req.user.id, {
      include: [
        {
          model: Pessoa,
          as: 'pessoa',
          include: [
            { model: CargoEclesiastico, as: 'cargoEclesiastico' },
            { model: Departamento, as: 'departamento' }
          ]
        },
        {
          model: Perfil,
          as: 'perfil',
          include: [
            {
              model: Permissao,
              as: 'permissoes',
              through: { attributes: [] }
            }
          ]
        }
      ]
    });

    // Preparar dados do usuário com permissões
    const permissoes = usuario.perfil?.permissoes?.map(p => p.codigo) || [];

    const dadosUsuario = {
      id: usuario.id,
      email: usuario.email,
      pessoa: usuario.pessoa,
      perfil: {
        id: usuario.perfil?.id,
        nome: usuario.perfil?.nome,
        nivel_acesso: usuario.perfil?.nivel_acesso,
        permissoes: permissoes
      }
    };

    res.json({
      success: true,
      data: {
        usuario: dadosUsuario
      }
    });

  } catch (error) {
    console.error('Erro ao buscar dados do usuário:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
};

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Fazer logout do sistema
 *     tags: [Autenticação]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logout realizado com sucesso
 */
const logout = async (req, res) => {
  try {
    // Log de auditoria
    await auditLogger(req, 'LOGOUT', 'usuarios', req.user.id);

    res.json({
      success: true,
      message: 'Logout realizado com sucesso'
    });

  } catch (error) {
    console.error('Erro no logout:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
};

/**
 * @swagger
 * /api/auth/verify:
 *   get:
 *     summary: Verificar se o token é válido
 *     tags: [Autenticação]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Token válido
 *       401:
 *         description: Token inválido
 */
const verify = async (req, res) => {
  try {
    const usuario = await Usuario.findByPk(req.user.id, {
      include: [
        {
          model: Pessoa,
          as: 'pessoa',
          include: [
            { model: CargoEclesiastico, as: 'cargoEclesiastico' },
            { model: Departamento, as: 'departamento' }
          ]
        },
        {
          model: Perfil,
          as: 'perfil',
          include: [
            {
              model: Permissao,
              as: 'permissoes',
              through: { attributes: [] }
            }
          ]
        }
      ]
    });

    if (!usuario || !usuario.ativo) {
      return res.status(401).json({
        success: false,
        error: 'Usuário não encontrado ou inativo'
      });
    }

    const permissoes = usuario.perfil?.permissoes?.map(p => p.codigo) || [];

    const dadosUsuario = {
      id: usuario.id,
      email: usuario.email,
      pessoa: usuario.pessoa,
      perfil: {
        id: usuario.perfil?.id,
        nome: usuario.perfil?.nome,
        nivel_acesso: usuario.perfil?.nivel_acesso,
        permissoes: permissoes
      }
    };

    res.json({
      success: true,
      data: {
        usuario: dadosUsuario
      }
    });

  } catch (error) {
    console.error('Erro ao verificar token:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
};

module.exports = {
  login,
  me,
  logout,
  verify
};

