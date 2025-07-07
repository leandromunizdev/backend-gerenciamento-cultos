const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

/**
 * @swagger
 * components:
 *   schemas:
 *     Funcao:
 *       type: object
 *       required:
 *         - nome
 *       properties:
 *         id:
 *           type: integer
 *           description: ID único da função
 *         nome:
 *           type: string
 *           description: Nome da função
 *         descricao:
 *           type: string
 *           description: Descrição da função
 *         cor:
 *           type: string
 *           description: Cor em hexadecimal para identificação visual
 *         requer_confirmacao:
 *           type: boolean
 *           description: Se a função requer confirmação do escalado
 *           default: true
 *         ativo:
 *           type: boolean
 *           description: Se a função está ativa
 *           default: true
 *         created_at:
 *           type: string
 *           format: date-time
 *         updated_at:
 *           type: string
 *           format: date-time
 *         deleted_at:
 *           type: string
 *           format: date-time
 */
const Funcao = sequelize.define('Funcao', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nome: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'Nome da função é obrigatório'
      },
      len: {
        args: [2, 100],
        msg: 'Nome deve ter entre 2 e 100 caracteres'
      }
    }
  },
  descricao: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  cor: {
    type: DataTypes.STRING(7),
    allowNull: true,
    validate: {
      is: {
        args: /^#[0-9A-Fa-f]{6}$/,
        msg: 'Cor deve estar no formato hexadecimal (#RRGGBB)'
      }
    }
  },
  requer_confirmacao: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  ativo: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'funcoes',
  timestamps: true,
  paranoid: true,
  underscored: true,
  indexes: [
    {
      fields: ['nome'],
      unique: true,
      where: {
        deleted_at: null
      }
    },
    {
      fields: ['ativo']
    }
  ]
});

module.exports = Funcao;

