const { sequelize } = require('../config/database');

const Usuario = require('./Usuario');
const Pessoa = require('./Pessoa');
const CargoEclesiastico = require('./CargoEclesiastico');
const Departamento = require('./Departamento');
const Perfil = require('./Perfil');
const Permissao = require('./Permissao');
const PerfilPermissao = require('./PerfilPermissao');

const TipoCulto = require('./TipoCulto');
const StatusCulto = require('./StatusCulto');
const Culto = require('./Culto');

const Funcao = require('./Funcao');
const StatusEscala = require('./StatusEscala');
const Escala = require('./Escala');

const TipoAtividade = require('./TipoAtividade');
const Atividade = require('./Atividade');
const AtividadePessoa = require('./AtividadePessoa');
const AtividadeDepartamento = require('./AtividadeDepartamento');

const FormaConhecimento = require('./FormaConhecimento');
const Visitante = require('./Visitante');

const CriterioAvaliacao = require('./CriterioAvaliacao');
const Avaliacao = require('./Avaliacao');
const AvaliacaoCriterio = require('./AvaliacaoCriterio');

const Notificacao = require('./Notificacao');
const LogsAuditoria = require('./LogsAuditoria');
const SessaoUsuario = require('./SessaoUsuario');

const defineAssociations = () => {
  Perfil.belongsToMany(Permissao, {
    through: PerfilPermissao,
    foreignKey: 'perfil_id',
    otherKey: 'permissao_id',
    as: 'permissoes'
  });

  Permissao.belongsToMany(Perfil, {
    through: PerfilPermissao,
    foreignKey: 'permissao_id',
    otherKey: 'perfil_id',
    as: 'perfis'
  });

  Usuario.belongsTo(Perfil, { foreignKey: 'perfil_id', as: 'perfil' });
  Perfil.hasMany(Usuario, { foreignKey: 'perfil_id', as: 'usuarios' });

  Usuario.belongsTo(Pessoa, { foreignKey: 'pessoa_id', as: 'pessoa' });
  Pessoa.hasOne(Usuario, { foreignKey: 'pessoa_id', as: 'usuario' });

  Pessoa.belongsTo(CargoEclesiastico, { foreignKey: 'cargo_eclesiastico_id', as: 'cargoEclesiastico' });
  CargoEclesiastico.hasMany(Pessoa, { foreignKey: 'cargo_eclesiastico_id', as: 'pessoas' });

  Pessoa.belongsTo(Departamento, { foreignKey: 'departamento_id', as: 'departamento' });
  Departamento.hasMany(Pessoa, { foreignKey: 'departamento_id', as: 'pessoas' });

  Culto.belongsTo(TipoCulto, { foreignKey: 'tipo_culto_id', as: 'tipoCulto' });
  TipoCulto.hasMany(Culto, { foreignKey: 'tipo_culto_id', as: 'cultos' });

  Culto.belongsTo(StatusCulto, { foreignKey: 'status_id', as: 'status' });
  StatusCulto.hasMany(Culto, { foreignKey: 'status_id', as: 'cultos' });

  Culto.belongsTo(Usuario, { foreignKey: 'criado_por', as: 'criador' });
  Usuario.hasMany(Culto, { foreignKey: 'criado_por', as: 'cultosCriados' });

  Escala.belongsTo(Culto, { foreignKey: 'culto_id', as: 'culto' });
  Culto.hasMany(Escala, { foreignKey: 'culto_id', as: 'escalas' });

  Escala.belongsTo(Pessoa, { foreignKey: 'pessoa_id', as: 'pessoa' });
  Pessoa.hasMany(Escala, { foreignKey: 'pessoa_id', as: 'escalas' });

  Escala.belongsTo(Funcao, { foreignKey: 'funcao_id', as: 'funcao' });
  Funcao.hasMany(Escala, { foreignKey: 'funcao_id', as: 'escalas' });

  Escala.belongsTo(StatusEscala, { foreignKey: 'status_id', as: 'status' });
  StatusEscala.hasMany(Escala, { foreignKey: 'status_id', as: 'escalas' });

  Atividade.belongsTo(TipoAtividade, { foreignKey: 'tipo_atividade_id', as: 'tipoAtividade' });
  TipoAtividade.hasMany(Atividade, { foreignKey: 'tipo_atividade_id', as: 'atividades' });

  Atividade.belongsTo(Culto, { foreignKey: 'culto_id', as: 'culto' });
  Culto.hasMany(Atividade, { foreignKey: 'culto_id', as: 'atividades' });

  AtividadePessoa.belongsTo(Atividade, { foreignKey: 'atividade_id', as: 'atividade' });
  Atividade.hasMany(AtividadePessoa, { foreignKey: 'atividade_id', as: 'atividadePessoas' });

  AtividadePessoa.belongsTo(Pessoa, { foreignKey: 'pessoa_id', as: 'pessoa' });
  Pessoa.hasMany(AtividadePessoa, { foreignKey: 'pessoa_id', as: 'atividadePessoas' });

  AtividadeDepartamento.belongsTo(Atividade, { foreignKey: 'atividade_id', as: 'atividade' });
  Atividade.hasMany(AtividadeDepartamento, { foreignKey: 'atividade_id', as: 'atividadeDepartamentos' });

  AtividadeDepartamento.belongsTo(Departamento, { foreignKey: 'departamento_id', as: 'departamento' });
  Departamento.hasMany(AtividadeDepartamento, { foreignKey: 'departamento_id', as: 'atividadeDepartamentos' });

  Visitante.belongsTo(FormaConhecimento, { foreignKey: 'forma_conhecimento_id', as: 'formaConhecimento' });
  FormaConhecimento.hasMany(Visitante, { foreignKey: 'forma_conhecimento_id', as: 'visitantes' });

  Visitante.belongsTo(Culto, { foreignKey: 'culto_id', as: 'culto' });
  Culto.hasMany(Visitante, { foreignKey: 'culto_id', as: 'visitantes' });

  Avaliacao.belongsTo(Culto, { foreignKey: 'culto_id', as: 'culto' });
  Culto.hasMany(Avaliacao, { foreignKey: 'culto_id', as: 'avaliacoes' });

  Avaliacao.belongsTo(Pessoa, { foreignKey: 'avaliador_id', as: 'avaliador' });
  Pessoa.hasMany(Avaliacao, { foreignKey: 'avaliador_id', as: 'avaliacoes' });

  AvaliacaoCriterio.belongsTo(Avaliacao, { foreignKey: 'avaliacao_id', as: 'avaliacao' });
  Avaliacao.hasMany(AvaliacaoCriterio, { foreignKey: 'avaliacao_id', as: 'criterios' });

  AvaliacaoCriterio.belongsTo(CriterioAvaliacao, { foreignKey: 'criterio_id', as: 'criterio' });
  CriterioAvaliacao.hasMany(AvaliacaoCriterio, { foreignKey: 'criterio_id', as: 'avaliacaoCriterios' });

  Notificacao.belongsTo(Usuario, { foreignKey: 'usuario_id', as: 'usuario' });
  Usuario.hasMany(Notificacao, { foreignKey: 'usuario_id', as: 'notificacoes' });

  LogsAuditoria.belongsTo(Usuario, { foreignKey: 'usuario_id', as: 'usuario' });
  Usuario.hasMany(LogsAuditoria, { foreignKey: 'usuario_id', as: 'logs' });

  SessaoUsuario.belongsTo(Usuario, { foreignKey: 'usuario_id', as: 'usuario' });
  Usuario.hasMany(SessaoUsuario, { foreignKey: 'usuario_id', as: 'sessoes' });
};

defineAssociations();

module.exports = {
  sequelize,
  Usuario,
  Pessoa,
  CargoEclesiastico,
  Departamento,
  Perfil,
  Permissao,
  PerfilPermissao,
  TipoCulto,
  StatusCulto,
  Culto,
  Funcao,
  StatusEscala,
  Escala,
  TipoAtividade,
  Atividade,
  AtividadePessoa,
  AtividadeDepartamento,
  FormaConhecimento,
  Visitante,
  CriterioAvaliacao,
  Avaliacao,
  AvaliacaoCriterio,
  Notificacao,
  LogsAuditoria,
  SessaoUsuario
};
