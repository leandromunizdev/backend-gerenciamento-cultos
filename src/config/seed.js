const { sequelize } = require('./database');

const models = require('../models');

const {
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
} = models;

async function seedDatabase() {
  try {
    console.log('🔄 Iniciando seed do banco de dados...');

    console.log('🔄 Recriando tabelas...');
    await sequelize.sync({ force: true });
    console.log('✅ Tabelas criadas com sucesso!');

    console.log('🔐 Criando permissões...');
    const permissoesData = [
      { codigo: 'admin_sistema', nome: 'Administrar Sistema', descricao: 'Acesso total ao sistema', modulo: 'sistema' },
      { codigo: 'create_cultos', nome: 'Criar Cultos', descricao: 'Criar novos cultos', modulo: 'cultos' },
      { codigo: 'read_cultos', nome: 'Visualizar Cultos', descricao: 'Visualizar cultos', modulo: 'cultos' },
      { codigo: 'update_cultos', nome: 'Editar Cultos', descricao: 'Editar cultos existentes', modulo: 'cultos' },
      { codigo: 'delete_cultos', nome: 'Excluir Cultos', descricao: 'Excluir cultos', modulo: 'cultos' },
      { codigo: 'manage_cultos', nome: 'Gerenciar Cultos', descricao: 'Gerenciar todos os aspectos dos cultos', modulo: 'cultos' },
      { codigo: 'create_escalas', nome: 'Criar Escalas', descricao: 'Criar escalas de serviço', modulo: 'escalas' },
      { codigo: 'read_escalas', nome: 'Visualizar Escalas', descricao: 'Visualizar escalas', modulo: 'escalas' },
      { codigo: 'update_escalas', nome: 'Editar Escalas', descricao: 'Editar escalas existentes', modulo: 'escalas' },
      { codigo: 'delete_escalas', nome: 'Excluir Escalas', descricao: 'Excluir escalas', modulo: 'escalas' },
      { codigo: 'manage_escalas', nome: 'Gerenciar Escalas', descricao: 'Gerenciar todas as escalas', modulo: 'escalas' },
      { codigo: 'create_pessoas', nome: 'Cadastrar Pessoas', descricao: 'Cadastrar novas pessoas', modulo: 'pessoas' },
      { codigo: 'read_pessoas', nome: 'Visualizar Pessoas', descricao: 'Visualizar cadastro de pessoas', modulo: 'pessoas' },
      { codigo: 'update_pessoas', nome: 'Editar Pessoas', descricao: 'Editar dados de pessoas', modulo: 'pessoas' },
      { codigo: 'delete_pessoas', nome: 'Excluir Pessoas', descricao: 'Excluir pessoas do sistema', modulo: 'pessoas' },
      { codigo: 'manage_pessoas', nome: 'Gerenciar Pessoas', descricao: 'Gerenciar cadastro de pessoas', modulo: 'pessoas' },
      { codigo: 'create_visitantes', nome: 'Cadastrar Visitantes', descricao: 'Cadastrar visitantes', modulo: 'visitantes' },
      { codigo: 'read_visitantes', nome: 'Visualizar Visitantes', descricao: 'Visualizar visitantes', modulo: 'visitantes' },
      { codigo: 'update_visitantes', nome: 'Editar Visitantes', descricao: 'Editar dados de visitantes', modulo: 'visitantes' },
      { codigo: 'delete_visitantes', nome: 'Excluir Visitantes', descricao: 'Excluir visitantes', modulo: 'visitantes' },
      { codigo: 'manage_visitantes', nome: 'Gerenciar Visitantes', descricao: 'Gerenciar visitantes', modulo: 'visitantes' },
      { codigo: 'create_avaliacoes', nome: 'Criar Avaliações', descricao: 'Criar avaliações', modulo: 'avaliacoes' },
      { codigo: 'read_avaliacoes', nome: 'Visualizar Avaliações', descricao: 'Visualizar avaliações', modulo: 'avaliacoes' },
      { codigo: 'update_avaliacoes', nome: 'Editar Avaliações', descricao: 'Editar avaliações', modulo: 'avaliacoes' },
      { codigo: 'delete_avaliacoes', nome: 'Excluir Avaliações', descricao: 'Excluir avaliações', modulo: 'avaliacoes' },
      { codigo: 'read_relatorios', nome: 'Visualizar Relatórios', descricao: 'Acessar relatórios do sistema', modulo: 'relatorios' },
      { codigo: 'create_usuarios', nome: 'Criar Usuários', descricao: 'Criar usuários para acesso do sistema', modulo: 'usuarios' },
      { codigo: 'read_usuarios', nome: 'Visualizar Usuários', descricao: 'Visualizar usuários', modulo: 'usuarios' },
      { codigo: 'update_usuarios', nome: 'Editar Usuários', descricao: 'Editar usuários', modulo: 'usuarios' },
      { codigo: 'delete_usuarios', nome: 'Deletar Usuários', descricao: 'Deletar usuários', modulo: 'usuarios' },
      { codigo: 'create_perfis', nome: 'Criar Perfis', descricao: 'Criar Perfis', modulo: 'perfis' },
      { codigo: 'read_perfis', nome: 'Visualizar Perfis', descricao: 'Visualizar Perfis', modulo: 'perfis' },
      { codigo: 'update_perfis', nome: 'Editar Perfis', descricao: 'Editar Perfis', modulo: 'perfis' },
      { codigo: 'delete_perfis', nome: 'Deletar Perfis', descricao: 'Deletar Perfis', modulo: 'perfis' },

    ];
    const permissoes = [];

    for (const permissaoData of permissoesData) {
      const permissao = await Permissao.create(permissaoData);
      permissoes.push(permissao);
    }
    console.log(`✅ ${permissoes.length} permissões criadas!`);

    // 2. Criar perfis
    console.log('👥 Criando perfis...');
    const perfisData = [
      { nome: 'Administrador', descricao: 'Acesso total ao sistema', nivel_acesso: 10, ativo: true },
      { nome: 'Pastor', descricao: 'Pastor da igreja com amplos privilégios', nivel_acesso: 9, ativo: true },
      { nome: 'Líder', descricao: 'Líder de departamento ou ministério', nivel_acesso: 7, ativo: true },
      { nome: 'Secretário', descricao: 'Secretário da igreja', nivel_acesso: 5, ativo: true },
      { nome: 'Membro', descricao: 'Membro da igreja', nivel_acesso: 3, ativo: true },
      { nome: 'Visitante', descricao: 'Visitante da igreja', nivel_acesso: 1, ativo: true }
    ];

    const perfis = [];

    for (const perfilData of perfisData) {
      try {
        const perfil = await Perfil.create(perfilData);
        perfis.push(perfil);
        console.log(`✅ Perfil criado: ${perfil.nome}`);
      } catch (err) {
        console.error(`❌ Erro ao criar perfil "${perfilData.nome}":`, err.errors?.map(e => e.message) ?? err.message);
      }
    }

    console.log('🧩 Perfis criados:', perfis.map(p => p.nome));

    const tempPerfil = await Perfil.findOne();
    if (!tempPerfil) {
      throw new Error('Nenhum perfil foi encontrado após criação. Verifique se a tabela "perfis" foi criada e os dados inseridos.');
    }
    console.log('Métodos disponíveis no perfil:', Object.getOwnPropertyNames(Object.getPrototypeOf(tempPerfil)));

    const perfilAdmin = perfis.find(p => p.nome === 'Administrador');
    const perfilPastor = perfis.find(p => p.nome === 'Pastor');
    const perfilLider = perfis.find(p => p.nome === 'Líder');
    const perfilSecretario = perfis.find(p => p.nome === 'Secretário');
    const perfilMembro = perfis.find(p => p.nome === 'Membro');
    const perfilVisitante = perfis.find(p => p.nome === 'Visitante');

    if (!perfilAdmin || typeof perfilAdmin.setPermissoes !== 'function') {
      throw new Error('Método setPermissoes não está disponível. Verifique se as associações many-to-many foram definidas corretamente antes do sync().');
    }

    console.log('🔗 Associando permissões aos perfis...');
    await perfilAdmin.setPermissoes(permissoes);
    await perfilPastor.setPermissoes(permissoes.filter(p => p.codigo !== 'admin_sistema'));
    await perfilLider.setPermissoes(permissoes.filter(p =>
      p.codigo.includes('cultos') ||
      p.codigo.includes('escalas') ||
      p.codigo.includes('pessoas') ||
      p.codigo.includes('visitantes') ||
      p.codigo.includes('avaliacoes') ||
      p.codigo.includes('usuários') ||
      p.codigo.includes('perfis') ||
      p.codigo === 'read_relatorios'
    ));
    await perfilSecretario.setPermissoes(permissoes.filter(p =>
      p.codigo.includes('escalas') ||
      p.codigo.includes('visitantes') ||
      p.codigo === 'read_cultos' ||
      p.codigo === 'read_pessoas'
    ));
    await perfilMembro.setPermissoes(permissoes.filter(p =>
      p.codigo === 'read_cultos' ||
      p.codigo === 'read_escalas'
    ));
    await perfilVisitante.setPermissoes(permissoes.filter(p =>
      p.codigo.includes('avaliacoes')
    ));
    console.log('✅ Permissões associadas aos perfis!');

    const cargosData = [
      { nome: 'Pastor', descricao: 'Pastor da igreja', ativo: true },
      { nome: 'Presbítero', descricao: 'Presbítero', ativo: true },
      { nome: 'Evangelista', descricao: 'Evangelista', ativo: true },
      { nome: 'Diácono', descricao: 'Diácono', ativo: true },
      { nome: 'Membro', descricao: 'Membro da igreja', ativo: true },
      { nome: 'Congregado', descricao: 'Congregado', ativo: true }
    ];

    const deptosData = [
      { nome: 'Ministério de Louvor', descricao: 'Responsável pela música e louvor', ativo: true },
      { nome: 'Ministério Infantil', descricao: 'Cuidado das crianças', ativo: true },
      { nome: 'Ministério de Jovens', descricao: 'Trabalho com jovens', ativo: true },
      { nome: 'Ministério de Mulheres', descricao: 'Trabalho com mulheres', ativo: true },
      { nome: 'Ministério de Homens', descricao: 'Trabalho com homens', ativo: true },
      { nome: 'Secretaria', descricao: 'Secretaria da igreja', ativo: true },
      { nome: 'Recepção', descricao: 'Recepção e acolhimento', ativo: true }
    ];
    const tiposData = [
      { nome: 'Culto de Domingo Manhã', descricao: 'Culto principal de domingo pela manhã', cor: '#FF6B35', ativo: true },
      { nome: 'Culto de Domingo Noite', descricao: 'Culto de domingo à noite', cor: '#F7931E', ativo: true },
      { nome: 'Culto de Quarta-feira', descricao: 'Culto de oração e doutrina', cor: '#FFD23F', ativo: true },
      { nome: 'Culto de Sexta-feira', descricao: 'Culto de libertação', cor: '#06FFA5', ativo: true },
      { nome: 'Culto Especial', descricao: 'Cultos especiais e eventos', cor: '#4ECDC4', ativo: true },
      { nome: 'Santa Ceia', descricao: 'Culto da Santa Ceia', cor: '#45B7D1', ativo: true }
    ];

    const statusData = [
      { nome: 'Planejado', descricao: 'Culto planejado', cor: '#FFA500', ativo: true },
      { nome: 'Em Andamento', descricao: 'Culto em andamento', cor: '#32CD32', ativo: true },
      { nome: 'Finalizado', descricao: 'Culto finalizado', cor: '#4169E1', ativo: true },
      { nome: 'Cancelado', descricao: 'Culto cancelado', cor: '#DC143C', ativo: true }
    ];

    const cargosEclesiasticos = await Promise.all(cargosData.map(data => CargoEclesiastico.create(data)));
    const departamentos = await Promise.all(deptosData.map(data => Departamento.create(data)));
    const tiposCultos = await Promise.all(tiposData.map(data => TipoCulto.create(data)));
    const statusCultos = await Promise.all(statusData.map(data => StatusCulto.create(data)));

    const funcoesData = [
      { nome: 'Dirigente', descricao: 'Dirigente do culto', ativo: true, requer_confirmacao: false, cor: null },
      { nome: 'Pregador', descricao: 'Pregador da palavra', ativo: true, requer_confirmacao: false, cor: null },
      { nome: 'Músico', descricao: 'Músico/Instrumentista', ativo: true, requer_confirmacao: false, cor: null },
      { nome: 'Cantor', descricao: 'Cantor/Vocalista', ativo: true, requer_confirmacao: false, cor: null },
      { nome: 'Sonoplasta', descricao: 'Operador de som', ativo: true, requer_confirmacao: false, cor: null },
      { nome: 'Recepcionista', descricao: 'Recepção dos visitantes', ativo: true, requer_confirmacao: false, cor: null },
      { nome: 'Segurança', descricao: 'Segurança do templo', ativo: true, requer_confirmacao: false, cor: null },
      { nome: 'Limpeza', descricao: 'Limpeza e organização', ativo: true, requer_confirmacao: false, cor: null }
    ];

    const funcoesCadastradas = await Promise.all(funcoesData.map(data => Funcao.create(data)));

    const statusEscalaData = [
      { nome: 'Pendente', descricao: null, cor: '#FFA500' },
      { nome: 'Confirmado', descricao: null, cor: '#4CAF50' },
      { nome: 'Presente', descricao: null, cor: '#2196F3' },
      { nome: 'Ausente', descricao: null, cor: '#F44336' }
    ];

    const statusEscalaCadastrados = await Promise.all(
      statusEscalaData.map(data => StatusEscala.create(data))
    );

    const formasConhecimentoData = [
      { nome: 'Google', ativo: true },
      { nome: 'Indicação', ativo: true },
      { nome: 'Instagram', ativo: true },
      { nome: 'Facebook', ativo: true },
      { nome: 'YouTube', ativo: true },
      { nome: 'Passando na rua', ativo: true },
      { nome: 'Outros', ativo: true }
    ];

    const formasConhecimentoCadastradas = await Promise.all(
      formasConhecimentoData.map(data => FormaConhecimento.create(data))
    );

    const criteriosAvaliacaoData = [
      { nome: 'Acolhimento', ordem_exibicao: 1, ativo: true },
      { nome: 'Louvor e Adoração', ordem_exibicao: 2, ativo: true },
      { nome: 'Pregação', ordem_exibicao: 3, ativo: true },
      { nome: 'Estrutura Física', ordem_exibicao: 4, ativo: true },
      { nome: 'Organização', ordem_exibicao: 5, ativo: true },
      { nome: 'Limpeza', ordem_exibicao: 6, ativo: true }
    ];

    const criteriosAvaliacaoCadastrados = await Promise.all(
      criteriosAvaliacaoData.map(data => CriterioAvaliacao.create(data))
    );

    console.log('👤 Criando usuário administrador...');
    const cargoPastor = cargosEclesiasticos.find(c => c.nome === 'Pastor');
    if (!cargoPastor) throw new Error('Cargo "Pastor" não encontrado!');

    const pessoaAdmin = await Pessoa.create({
      nome_completo: 'Administrador do Sistema',
      email: 'admin@adpiedade.com',
      telefone: '(11) 99999-9999',
      cargo_eclesiastico_id: cargoPastor.id,
      ativo: true
    });

    const bcrypt = require('bcryptjs');
    const senhaHash = await bcrypt.hash('admin123', 12);

    await Usuario.create({
      email: 'admin@adpiedade.com',
      senha_hash: senhaHash,
      pessoa_id: pessoaAdmin.id,
      perfil_id: perfilAdmin.id,
      ativo: true,
      email_verificado: true
    });

    const cultosData = [
      {
        titulo: 'Culto de Celebração',
        descricao: 'Abertura com a Equipe de Louvor com 3 hinos',
        data_culto: new Date('2025-07-09'),
        horario_inicio: '19:30:00',
        horario_fim: '21:00:00',
        local: 'Templo Principal',
        tipo_culto_id: 3,
        status_id: 3,
        observacoes: 'Oração das 19:00 às 19:30',
        criado_por: 1,
        atualizado_por: null,
        criado_em: new Date('2025-07-05T10:52:06.730Z'),
        atualizado_em: new Date('2025-07-05T12:12:02.954Z'),
        excluido_em: null
      },
      {
        titulo: 'Culto de Louvor',
        descricao: 'descricão 3',
        data_culto: new Date('2025-07-06'),
        horario_inicio: '18:00:00',
        horario_fim: '20:00:00',
        local: 'Templo Principal',
        tipo_culto_id: 2,
        status_id: 3,
        observacoes: 'observação 3',
        criado_por: 1,
        atualizado_por: null,
        criado_em: new Date('2025-07-05T10:30:31.987Z'),
        atualizado_em: new Date('2025-07-05T14:01:16.068Z'),
        excluido_em: null
      },
      {
        titulo: 'Culto de Ensino',
        descricao: 'Palavra de Deus',
        data_culto: new Date('2025-07-04'),
        horario_inicio: '19:30:00',
        horario_fim: '21:00:00',
        local: 'Templo Principal',
        tipo_culto_id: 6,
        status_id: 3,
        observacoes: 'Culto de Ensino',
        criado_por: 1,
        atualizado_por: null,
        criado_em: new Date('2025-07-05T14:48:19.329Z'),
        atualizado_em: new Date('2025-07-05T14:49:55.513Z'),
        excluido_em: null
      }
    ];

    const cultosCadastrados = await Promise.all(
      cultosData.map(data => Culto.create(data))
    );

    const pessoasData = [
      {
        usuario_id: null,
        nome_completo: 'Fulano de Tal',
        telefone: '(21) 98254-9815',
        whatsapp: null,
        data_nascimento: new Date('1987-04-23'),
        endereco: 'Rua Carlos Souza, 156, Rio Comprido - RJ',
        cargo_eclesiastico_id: 5,
        departamento_id: 6,
        membro: false,
        ativo: true,
        observacoes: null,
        created_at: new Date('2025-07-05T10:29:35.202Z'),
        updated_at: new Date('2025-07-05T17:01:30.514Z'),
        deleted_at: null
      },
      {
        usuario_id: null,
        nome_completo: 'Ciclana de Tal',
        telefone: '(21) 98566-5446',
        whatsapp: null,
        data_nascimento: new Date('1989-07-04'),
        endereco: 'Rua Pereira Nunes, 20, Tijuca - RJ',
        cargo_eclesiastico_id: 5,
        departamento_id: 2,
        membro: false,
        ativo: true,
        observacoes: null,
        created_at: new Date('2025-07-05T16:56:13.017Z'),
        updated_at: new Date('2025-07-05T17:07:06.747Z'),
        deleted_at: null
      }
    ];

    const pessoasCadastradas = await Promise.all(
      pessoasData.map(data => Pessoa.create(data))
    );

    const escalasData = [
      {
        culto_id: 2,
        pessoa_id: 1,
        funcao_id: 1,
        status_id: 1,
        confirmado_em: null,
        check_in_em: null,
        observacoes: 'Segunda escala',
        created_by: 1,
        created_at: new Date('2025-07-05T15:55:24.081Z'),
        updated_at: new Date('2025-07-05T15:55:24.081Z'),
        deleted_at: null
      },
      {
        culto_id: 3,
        pessoa_id: 1,
        funcao_id: 7,
        status_id: 1,
        confirmado_em: null,
        check_in_em: null,
        observacoes: 'Terceira escala ajustada',
        created_by: 1,
        created_at: new Date('2025-07-05T15:56:33.352Z'),
        updated_at: new Date('2025-07-05T16:06:27.957Z'),
        deleted_at: null
      },
      {
        culto_id: 3,
        pessoa_id: 1,
        funcao_id: 6,
        status_id: 1,
        confirmado_em: null,
        check_in_em: null,
        observacoes: 'Teste outra função no mesmo culto.',
        created_by: 1,
        created_at: new Date('2025-07-05T16:08:00.848Z'),
        updated_at: new Date('2025-07-05T16:08:00.848Z'),
        deleted_at: null
      },
      {
        culto_id: 1,
        pessoa_id: 2,
        funcao_id: 6,
        status_id: 1,
        confirmado_em: null,
        check_in_em: null,
        observacoes: '',
        created_by: 1,
        created_at: new Date('2025-07-05T17:08:05.196Z'),
        updated_at: new Date('2025-07-05T17:08:05.196Z'),
        deleted_at: null
      },
      {
        culto_id: 1,
        pessoa_id: 1,
        funcao_id: 5,
        status_id: 2,
        confirmado_em: null,
        check_in_em: null,
        observacoes: 'Primeira escala',
        created_by: 1,
        created_at: new Date('2025-07-05T15:48:07.789Z'),
        updated_at: new Date('2025-07-05T17:41:43.309Z'),
        deleted_at: null
      }
    ];

    const escalasCadastradas = await Promise.all(
      escalasData.map(data => Escala.create(data))
    );



    const visitantesData = [
      {
        nome_completo: 'Cristiano Ronaldo',
        whatsapp: '(21) 98290-5688',
        data_nascimento: new Date('1980-11-01'),
        eh_cristao: true,
        mora_perto: true,
        igreja_origem: 'IURD',
        forma_conhecimento_id: 2,
        observacoes: 'Não deseja ser apresentado',
        avisos_organizador: 'Fazer festa no anúncio.',
        data_visita: new Date('2025-07-06'),
        culto_id: 1,
        cadastrado_por: 1,
        created_at: new Date('2025-07-05T17:18:05.892Z'),
        updated_at: new Date('2025-07-05T17:18:05.892Z'),
        deleted_at: null
      },
      {
        nome_completo: 'Carlos Santos',
        whatsapp: null,
        data_nascimento: null,
        eh_cristao: null,
        mora_perto: true,
        igreja_origem: null,
        forma_conhecimento_id: 7,
        observacoes: null,
        avisos_organizador: 'Procurando igreja para congregar',
        data_visita: new Date('2025-07-06'),
        culto_id: 1,
        cadastrado_por: 1,
        created_at: new Date('2025-07-05T17:19:52.749Z'),
        updated_at: new Date('2025-07-05T17:23:33.688Z'),
        deleted_at: null
      }
    ];

    const visitantesCadastrados = await Promise.all(
      visitantesData.map(data => Visitante.create(data))
    );

    const avaliacoesData = [
      {
        visitante_id: null,
        nome_avaliador: 'Saulo',
        email_avaliador: 'saulo@gmail.com',
        data_visita: new Date('2025-07-06'),
        comentario_geral: 'Achei as pessoas sem reverência.',
        recomendaria: true,
        created_at: new Date('2025-07-05T17:30:15.741Z'),
        updated_at: new Date('2025-07-05T17:30:15.741Z'),
        deleted_at: null,
        culto_id: null,
        avaliador_id: null
      }
    ];

    const avaliacoesCadastradas = await Promise.all(
      avaliacoesData.map(data => Avaliacao.create(data))
    );

    const avaliacaoCriteriosData = [
      {
        avaliacao_id: 1,
        criterio_id: 2,
        nota: 3,
        created_at: new Date('2025-07-05T17:30:15.747Z'),
        updated_at: new Date('2025-07-05T17:30:15.747Z'),
        deleted_at: null
      },
      {
        avaliacao_id: 1,
        criterio_id: 3,
        nota: 5,
        created_at: new Date('2025-07-05T17:30:15.747Z'),
        updated_at: new Date('2025-07-05T17:30:15.747Z'),
        deleted_at: null
      },
      {
        avaliacao_id: 1,
        criterio_id: 4,
        nota: 2,
        created_at: new Date('2025-07-05T17:30:15.747Z'),
        updated_at: new Date('2025-07-05T17:30:15.747Z'),
        deleted_at: null
      },
      {
        avaliacao_id: 1,
        criterio_id: 5,
        nota: 5,
        created_at: new Date('2025-07-05T17:30:15.747Z'),
        updated_at: new Date('2025-07-05T17:30:15.747Z'),
        deleted_at: null
      },
      {
        avaliacao_id: 1,
        criterio_id: 6,
        nota: 1,
        created_at: new Date('2025-07-05T17:30:15.747Z'),
        updated_at: new Date('2025-07-05T17:30:15.747Z'),
        deleted_at: null
      }
    ];

    const avaliacaoCriteriosCadastrados = await Promise.all(
      avaliacaoCriteriosData.map(data => AvaliacaoCriterio.create(data))
    );


    console.log('✅ Dados básicos criados!');
    console.log('✅ Usuário administrador criado!');
    console.log('📧 Email: admin@adpiedade.com');
    console.log('🔑 Senha: admin123');

    console.log('🎉 Seed concluído com sucesso!');
  } catch (error) {
    console.error('❌ Erro durante o seed:', error);
    console.error('Stack trace:', error.stack);
    throw error;
  }
}

if (require.main === module) {
  seedDatabase()
    .then(() => {
      console.log('✅ Seed executado com sucesso!');
      process.exit(0);
    })
    .catch(() => {
      console.error('❌ Falha ao executar seed');
      process.exit(1);
    });
}

module.exports = seedDatabase;