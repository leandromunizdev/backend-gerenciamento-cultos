const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

/**
 * @swagger
 * components:
 *   schemas:
 *     Permissao:
 *       type: object
 *       required:
 *         - codigo
 *         - nome
 *       properties:
 *         id:
 *           type: integer
 *           description: ID único da permissão
 *         codigo:
 *           type: string
 *           description: Código único da permissão
 *         nome:
 *           type: string
 *           description: Nome da permissão
 *         descricao:
 *           type: string
 *           description: Descrição da permissão
 *         modulo:
 *           type: string
 *           description: Módulo ao qual a permissão pertence
 */

const Permissao = sequelize.define('Permissao', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  codigo: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
    validate: {
      notEmpty: true,
      is: /^[a-z_]+$/i
    }
  },
  nome: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [2, 100]
    }
  },
  descricao: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  modulo: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: 'Módulo do sistema (cultos, escalas, pessoas, etc.)'
  }
}, {
  tableName: 'permissoes',
  timestamps: true,
  createdAt: 'criado_em',
  updatedAt: 'atualizado_em'
});

module.exports = Permissao;

