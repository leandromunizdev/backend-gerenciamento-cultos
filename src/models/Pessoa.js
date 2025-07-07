const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

/**
 * @swagger
 * components:
 *   schemas:
 *     Pessoa:
 *       type: object
 *       required:
 *         - nome_completo
 *       properties:
 *         id:
 *           type: integer
 *           description: ID único da pessoa
 *         usuario_id:
 *           type: integer
 *           description: ID do usuário associado (se houver)
 *         nome_completo:
 *           type: string
 *           description: Nome completo da pessoa
 *         telefone:
 *           type: string
 *           description: Telefone da pessoa
 *         whatsapp:
 *           type: string
 *           description: WhatsApp da pessoa
 *         data_nascimento:
 *           type: string
 *           format: date
 *           description: Data de nascimento
 *         endereco:
 *           type: string
 *           description: Endereço da pessoa
 *         cargo_eclesiastico_id:
 *           type: integer
 *           description: ID do cargo eclesiástico
 *         departamento_id:
 *           type: integer
 *           description: ID do departamento
 *         membro:
 *           type: boolean
 *           description: Se é membro da igreja
 *           default: false
 *         ativo:
 *           type: boolean
 *           description: Se a pessoa está ativa
 *           default: true
 *         observacoes:
 *           type: string
 *           description: Observações sobre a pessoa
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
const Pessoa = sequelize.define('Pessoa', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  usuario_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    unique: true
  },
  nome_completo: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'Nome completo é obrigatório'
      },
      len: {
        args: [2, 255],
        msg: 'Nome deve ter entre 2 e 255 caracteres'
      }
    }
  },
  telefone: {
    type: DataTypes.STRING(20),
    allowNull: true,
    validate: {
      is: {
        args: /^[\d\s\(\)\-\+]+$/,
        msg: 'Telefone deve conter apenas números e caracteres especiais válidos'
      }
    }
  },
  whatsapp: {
    type: DataTypes.STRING(20),
    allowNull: true,
    validate: {
      is: {
        args: /^[\d\s\(\)\-\+]+$/,
        msg: 'WhatsApp deve conter apenas números e caracteres especiais válidos'
      }
    }
  },
  data_nascimento: {
    type: DataTypes.DATEONLY,
    allowNull: true,
    validate: {
      isDate: {
        msg: 'Data de nascimento deve ser uma data válida'
      },
      isBefore: {
        args: new Date().toISOString().split('T')[0],
        msg: 'Data de nascimento deve ser anterior à data atual'
      }
    }
  },
  endereco: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  cargo_eclesiastico_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  departamento_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  membro: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  ativo: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  observacoes: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'pessoas',
  timestamps: true,
  paranoid: true,
  underscored: true,
  indexes: [
    {
      fields: ['nome_completo']
    },
    {
      fields: ['usuario_id'],
      unique: true,
      where: {
        deleted_at: null,
        usuario_id: {
          [sequelize.Sequelize.Op.ne]: null
        }
      }
    },
    {
      fields: ['cargo_eclesiastico_id']
    },
    {
      fields: ['departamento_id']
    },
    {
      fields: ['membro']
    },
    {
      fields: ['ativo']
    },
    {
      fields: ['whatsapp']
    }
  ]
});

Pessoa.prototype.getIdade = function () {
  if (!this.data_nascimento) return null;

  const hoje = new Date();
  const nascimento = new Date(this.data_nascimento);
  let idade = hoje.getFullYear() - nascimento.getFullYear();

  const mesAtual = hoje.getMonth();
  const mesNascimento = nascimento.getMonth();

  if (mesAtual < mesNascimento || (mesAtual === mesNascimento && hoje.getDate() < nascimento.getDate())) {
    idade--;
  }

  return idade;
};

Pessoa.prototype.getNomeAbreviado = function () {
  const nomes = this.nome_completo.split(' ');
  if (nomes.length <= 2) return this.nome_completo;

  return `${nomes[0]} ${nomes[nomes.length - 1]}`;
};

module.exports = Pessoa;

