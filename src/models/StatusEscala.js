const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

/**
 * @swagger
 * components:
 *   schemas:
 *     StatusEscala:
 *       type: object
 *       required:
 *         - nome
 *       properties:
 *         id:
 *           type: integer
 *           description: ID único do status da escala
 *         nome:
 *           type: string
 *           description: Nome do status
 *         descricao:
 *           type: string
 *           description: Descrição do status
 *         cor:
 *           type: string
 *           description: Cor em hexadecimal para identificação visual
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
const StatusEscala = sequelize.define('StatusEscala', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nome: {
    type: DataTypes.STRING(50),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'Nome do status é obrigatório'
      },
      len: {
        args: [2, 50],
        msg: 'Nome deve ter entre 2 e 50 caracteres'
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
  }
}, {
  tableName: 'status_escala',
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
    }
  ]
});

module.exports = StatusEscala;

