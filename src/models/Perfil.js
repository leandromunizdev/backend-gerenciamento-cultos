const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

/**
 * @swagger
 * components:
 *   schemas:
 *     Perfil:
 *       type: object
 *       required:
 *         - nome
 *         - nivel_acesso
 *       properties:
 *         id:
 *           type: integer
 *           description: ID único do perfil
 *         nome:
 *           type: string
 *           description: Nome do perfil
 *         descricao:
 *           type: string
 *           description: Descrição do perfil
 *         nivel_acesso:
 *           type: integer
 *           description: Nível de acesso (1-10)
 *         ativo:
 *           type: boolean
 *           description: Se o perfil está ativo
 */

const Perfil = sequelize.define('Perfil', {
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
  nivel_acesso: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1,
      max: 10
    },
    comment: 'Nível de acesso de 1 (menor) a 10 (maior)'
  },
  ativo: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    allowNull: false
  }
}, {
  tableName: 'perfis',
  timestamps: true,
  createdAt: 'criado_em',
  updatedAt: 'atualizado_em',
  paranoid: true,
  deletedAt: 'excluido_em'
});

Perfil.prototype.temNivelAcesso = function (nivelRequerido) {
  return this.nivel_acesso >= nivelRequerido;
};

module.exports = Perfil;

