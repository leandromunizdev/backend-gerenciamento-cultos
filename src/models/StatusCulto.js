const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

/**
 * @swagger
 * components:
 *   schemas:
 *     StatusCulto:
 *       type: object
 *       required:
 *         - nome
 *       properties:
 *         id:
 *           type: integer
 *           description: ID único do status
 *         nome:
 *           type: string
 *           description: Nome do status
 *         descricao:
 *           type: string
 *           description: Descrição do status
 *         cor:
 *           type: string
 *           description: Cor hexadecimal para identificação visual
 *         ativo:
 *           type: boolean
 *           description: Se o status está ativo
 */

const StatusCulto = sequelize.define('StatusCulto', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nome: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
    validate: {
      notEmpty: true,
      len: [2, 50]
    }
  },
  descricao: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  cor: {
    type: DataTypes.STRING(7),
    allowNull: true,
    defaultValue: '#FFA500',
    validate: {
      is: /^#[0-9A-F]{6}$/i
    },
    comment: 'Cor em formato hexadecimal (#RRGGBB)'
  },
  ativo: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    allowNull: false
  }
}, {
  tableName: 'status_culto',
  timestamps: true,
  createdAt: 'criado_em',
  updatedAt: 'atualizado_em'
});

module.exports = StatusCulto;

