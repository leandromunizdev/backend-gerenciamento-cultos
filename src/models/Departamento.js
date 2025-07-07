const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

/**
 * @swagger
 * components:
 *   schemas:
 *     Departamento:
 *       type: object
 *       required:
 *         - nome
 *       properties:
 *         id:
 *           type: integer
 *           description: ID único do departamento
 *         nome:
 *           type: string
 *           description: Nome do departamento
 *         descricao:
 *           type: string
 *           description: Descrição do departamento
 *         responsavel_id:
 *           type: integer
 *           description: ID da pessoa responsável pelo departamento
 *         ativo:
 *           type: boolean
 *           description: Se o departamento está ativo
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
const Departamento = sequelize.define('Departamento', {
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
        msg: 'Nome do departamento é obrigatório'
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
  responsavel_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  ativo: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'departamentos',
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
      fields: ['responsavel_id']
    },
    {
      fields: ['ativo']
    }
  ]
});

module.exports = Departamento;

