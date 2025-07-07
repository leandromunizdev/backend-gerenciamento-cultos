const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

/**
 * @swagger
 * components:
 *   schemas:
 *     TipoCulto:
 *       type: object
 *       required:
 *         - nome
 *       properties:
 *         id:
 *           type: integer
 *           description: ID único do tipo de culto
 *         nome:
 *           type: string
 *           description: Nome do tipo de culto
 *         descricao:
 *           type: string
 *           description: Descrição do tipo de culto
 *         cor:
 *           type: string
 *           description: Cor hexadecimal para identificação visual
 *         ativo:
 *           type: boolean
 *           description: Se o tipo está ativo
 */

const TipoCulto = sequelize.define('TipoCulto', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nome: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
    validate: {
      notEmpty: true,
      len: [2, 100]
    }
  },
  descricao: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  cor: {
    type: DataTypes.STRING(7),
    allowNull: true,
    defaultValue: '#FF6B35',
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
  tableName: 'tipos_culto',
  timestamps: true,
  createdAt: 'criado_em',
  updatedAt: 'atualizado_em',
  paranoid: true,
  deletedAt: 'excluido_em'
});

module.exports = TipoCulto;

