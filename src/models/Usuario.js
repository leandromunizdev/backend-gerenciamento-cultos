const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');
const { sequelize } = require('../config/database');

/**
 * @swagger
 * components:
 *   schemas:
 *     Usuario:
 *       type: object
 *       required:
 *         - email
 *         - senha
 *         - perfil_id
 *       properties:
 *         id:
 *           type: integer
 *           description: ID único do usuário
 *         email:
 *           type: string
 *           format: email
 *           description: Email do usuário
 *         perfil_id:
 *           type: integer
 *           description: ID do perfil de permissões
 *         pessoa_id:
 *           type: integer
 *           description: ID da pessoa associada
 *         ativo:
 *           type: boolean
 *           description: Se o usuário está ativo
 *         email_verificado:
 *           type: boolean
 *           description: Se o email foi verificado
 *         ultimo_login:
 *           type: string
 *           format: date-time
 *           description: Data do último login
 *         tentativas_login:
 *           type: integer
 *           description: Número de tentativas de login falhadas
 *         bloqueado_ate:
 *           type: string
 *           format: date-time
 *           description: Data até quando o usuário está bloqueado
 */

const Usuario = sequelize.define('Usuario', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true,
      notEmpty: true
    }
  },
  senha_hash: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  perfil_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'Referência ao perfil de permissões'
  },
  pessoa_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Referência à pessoa associada'
  },
  ativo: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    allowNull: false
  },
  email_verificado: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    allowNull: false
  },
  ultimo_login: {
    type: DataTypes.DATE,
    allowNull: true
  },
  tentativas_login: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    allowNull: false
  },
  bloqueado_ate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  token_verificacao: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  token_reset_senha: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  token_reset_expira: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'usuarios',
  timestamps: true,
  createdAt: 'criado_em',
  updatedAt: 'atualizado_em',
  paranoid: true,
  deletedAt: 'excluido_em',
  hooks: {
    beforeCreate: async (usuario) => {
      if (usuario.senha) {
        usuario.senha_hash = await bcrypt.hash(usuario.senha, 12);
        delete usuario.senha;
      }
    },
    beforeUpdate: async (usuario) => {
      if (usuario.changed('senha') && usuario.senha) {
        usuario.senha_hash = await bcrypt.hash(usuario.senha, 12);
        delete usuario.senha;
      }
    }
  }
});

Usuario.prototype.setSenha = async function (senha) {
  this.senha_hash = await bcrypt.hash(senha, 12);
};

Usuario.prototype.verificarSenha = async function (senha) {
  return await bcrypt.compare(senha, this.senha_hash);
};

Usuario.prototype.estaBloqueado = function () {
  return this.bloqueado_ate && new Date() < this.bloqueado_ate;
};

Usuario.prototype.incrementarTentativas = async function () {
  this.tentativas_login += 1;

  if (this.tentativas_login >= 5) {
    this.bloqueado_ate = new Date(Date.now() + 30 * 60 * 1000); // 30 minutos
  }

  await this.save();
};

Usuario.prototype.resetarTentativas = async function () {
  this.tentativas_login = 0;
  this.bloqueado_ate = null;
  this.ultimo_login = new Date();
  await this.save();
};

Object.defineProperty(Usuario.prototype, 'senha', {
  set: function (value) {
    this._senha = value;
  },
  get: function () {
    return this._senha;
  }
});

module.exports = Usuario;

