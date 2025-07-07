const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

/**
 * @swagger
 * components:
 *   schemas:
 *     CargoEclesiastico:
 *       type: object
 *       required:
 *         - nome
 *       properties:
 *         id:
 *           type: integer
 *           description: ID único do cargo eclesiástico
 *         nome:
 *           type: string
 *           description: Nome do cargo eclesiástico
 *         descricao:
 *           type: string
 *           description: Descrição do cargo
 *         nivel_hierarquia:
 *           type: integer
 *           description: Nível hierárquico do cargo
 *           default: 0
 *         ativo:
 *           type: boolean
 *           description: Se o cargo está ativo
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
const CargoEclesiastico = sequelize.define('CargoEclesiastico', {
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
        msg: 'Nome do cargo é obrigatório'
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
  nivel_hierarquia: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    validate: {
      min: {
        args: [0],
        msg: 'Nível hierárquico deve ser maior ou igual a 0'
      }
    }
  },
  ativo: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'cargos_eclesiasticos',
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
      fields: ['nivel_hierarquia']
    },
    {
      fields: ['ativo']
    }
  ]
});

module.exports = CargoEclesiastico;

