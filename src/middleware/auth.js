const jwt = require('jsonwebtoken');
const { Usuario, Pessoa, Perfil, Permissao } = require('../models');

// Middleware de autenticação
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Token de acesso requerido'
      });
    }

    const token = authHeader.substring(7);

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Buscar usuário com perfil e permissões
      const usuario = await Usuario.findByPk(decoded.id, {
        include: [
          {
            model: Perfil,
            as: 'perfil',
            include: [{
              model: Permissao,
              as: 'permissoes',
              through: { attributes: [] }
            }]
          },
          {
            model: Pessoa,
            as: 'pessoa'
          }
        ],
        attributes: { exclude: ['senha_hash'] }
      });

      if (!usuario || !usuario.ativo) {
        return res.status(401).json({
          success: false,
          error: 'Usuário não encontrado ou inativo'
        });
      }

      if (usuario.estaBloqueado()) {
        return res.status(401).json({
          success: false,
          error: 'Usuário temporariamente bloqueado devido a tentativas de login falhadas'
        });
      }

      // Adicionar permissões ao usuário para fácil acesso
      const permissoes = usuario.perfil?.permissoes?.map(p => p.nome) || [];
      usuario.dataValues.permissions = permissoes;

      req.user = usuario;
      next();

    } catch (jwtError) {
      if (jwtError.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          error: 'Token expirado'
        });
      }

      return res.status(401).json({
        success: false,
        error: 'Token inválido'
      });
    }

  } catch (error) {
    console.error('Erro na autenticação:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
};

// Middleware de autorização baseado em permissões
const authorize = (permissoesRequeridas = []) => {
  return (req, res, next) => {
    try {
      console.log('Req.User', req.user);
      const usuario = req.user;

      if (!usuario || !usuario.perfil) {
        return res.status(403).json({
          success: false,
          error: 'Acesso negado: perfil de usuário não encontrado'
        });
      }

      const usuarioLimpo = usuario.toJSON();


      const permissoesUsuario = usuarioLimpo.perfil?.permissoes?.map(p => p.codigo) || [];
      console.log('Usuario', usuario);
      console.log('Permissoes usuario', permissoesUsuario);
      console.log('Permissoes requeridas', permissoesRequeridas);

      // Verificar se o usuário tem pelo menos uma das permissões requeridas
      const temPermissao = permissoesRequeridas.some(permissao =>
        permissoesUsuario.includes(permissao)
      );

      if (!temPermissao) {
        return res.status(403).json({
          success: false,
          error: 'Acesso negado: permissões insuficientes',
          permissoesRequeridas,
          permissoesUsuario
        });
      }

      next();

    } catch (error) {
      console.error('Erro na autorização:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  };
};

// Middleware para verificar se é admin
const requireAdmin = (req, res, next) => {
  const permissoesUsuario = req.user?.permissions || [];

  if (!permissoesUsuario.includes('admin_sistema')) {
    return res.status(403).json({
      success: false,
      error: 'Acesso negado: requer privilégios de administrador'
    });
  }

  next();
};

// Middleware para verificar se pode gerenciar cultos
const canManageCultos = (req, res, next) => {
  const permissoesUsuario = req.user?.permissions || [];

  if (!permissoesUsuario.includes('manage_cultos') && !permissoesUsuario.includes('admin_sistema')) {
    return res.status(403).json({
      success: false,
      error: 'Acesso negado: não pode gerenciar cultos'
    });
  }

  next();
};

// Middleware para verificar se pode gerenciar escalas
const canManageEscalas = (req, res, next) => {
  const permissoesUsuario = req.user?.permissions || [];

  if (!permissoesUsuario.includes('manage_escalas') && !permissoesUsuario.includes('admin_sistema')) {
    return res.status(403).json({
      success: false,
      error: 'Acesso negado: não pode gerenciar escalas'
    });
  }

  next();
};

// Middleware para verificar se pode gerenciar pessoas
const canManagePessoas = (req, res, next) => {
  const permissoesUsuario = req.user?.permissions || [];

  if (!permissoesUsuario.includes('manage_pessoas') && !permissoesUsuario.includes('admin_sistema')) {
    return res.status(403).json({
      success: false,
      error: 'Acesso negado: não pode gerenciar pessoas'
    });
  }

  next();
};

// Middleware para verificar se pode gerenciar visitantes
const canManageVisitantes = (req, res, next) => {
  const permissoesUsuario = req.user?.permissions || [];

  if (!permissoesUsuario.includes('manage_visitantes') && !permissoesUsuario.includes('admin_sistema')) {
    return res.status(403).json({
      success: false,
      error: 'Acesso negado: não pode gerenciar visitantes'
    });
  }

  next();
};

// Middleware para verificar se pode ver relatórios
const canViewReports = (req, res, next) => {
  const permissoesUsuario = req.user?.permissions || [];

  if (!permissoesUsuario.includes('read_relatorios') && !permissoesUsuario.includes('admin_sistema')) {
    return res.status(403).json({
      success: false,
      error: 'Acesso negado: não pode visualizar relatórios'
    });
  }

  next();
};

// Função utilitária para verificar permissão específica
const hasPermission = (usuario, permissao) => {
  const permissoesUsuario = usuario?.permissions || [];
  return permissoesUsuario.includes(permissao) || permissoesUsuario.includes('admin_sistema');
};

// Função utilitária para verificar múltiplas permissões (OR)
const hasAnyPermission = (usuario, permissoes) => {
  const permissoesUsuario = usuario?.permissions || [];
  return permissoes.some(permissao =>
    permissoesUsuario.includes(permissao) || permissoesUsuario.includes('admin_sistema')
  );
};

// Função utilitária para verificar múltiplas permissões (AND)
const hasAllPermissions = (usuario, permissoes) => {
  const permissoesUsuario = usuario?.permissions || [];

  if (permissoesUsuario.includes('admin_sistema')) {
    return true;
  }

  return permissoes.every(permissao => permissoesUsuario.includes(permissao));
};

module.exports = {
  authenticate,
  authorize,
  requireAdmin,
  canManageCultos,
  canManageEscalas,
  canManagePessoas,
  canManageVisitantes,
  canViewReports,
  hasPermission,
  hasAnyPermission,
  hasAllPermissions
};

