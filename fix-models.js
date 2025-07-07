const fs = require('fs');
const path = require('path');

const modelsDir = path.join(__dirname, 'src', 'models');

// Lista de arquivos de modelo para corrigir
const modelFiles = [
  'Usuario.js',
  'Pessoa.js',
  'CargoEclesiastico.js',
  'Departamento.js',
  'Perfil.js',
  'Permissao.js',
  'PerfilPermissao.js',
  'TipoCulto.js',
  'StatusCulto.js',
  'Culto.js',
  'Funcao.js',
  'StatusEscala.js',
  'Escala.js',
  'TipoAtividade.js',
  'Atividade.js',
  'AtividadePessoa.js',
  'AtividadeDepartamento.js',
  'FormaConhecimento.js',
  'Visitante.js',
  'CriterioAvaliacao.js',
  'Avaliacao.js',
  'AvaliacaoCriterio.js',
  'Notificacao.js',
  'LogsAuditoria.js',
  'SessaoUsuario.js'
];

// Função para remover references de um arquivo
function removeReferences(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');

    // Remover blocos references completos
    content = content.replace(/,\s*references:\s*\{[^}]*\}/g, '');

    fs.writeFileSync(filePath, content);
    console.log(`✅ Corrigido: ${path.basename(filePath)}`);
  } catch (error) {
    console.error(`❌ Erro ao corrigir ${path.basename(filePath)}:`, error.message);
  }
}

// Corrigir todos os modelos
console.log('🔧 Corrigindo modelos...');

modelFiles.forEach(fileName => {
  const filePath = path.join(modelsDir, fileName);
  if (fs.existsSync(filePath)) {
    removeReferences(filePath);
  } else {
    console.log(`⚠️ Arquivo não encontrado: ${fileName}`);
  }
});

console.log('🎉 Correção concluída!');

