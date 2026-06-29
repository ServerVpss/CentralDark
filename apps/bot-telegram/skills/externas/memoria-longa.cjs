const fs = require('fs');
const path = require('path');

const CONSCIENCIA_DIR = path.resolve('/root/CentralDark/docs/CONSCIENCIA');

function listarArquivos() {
  if (!fs.existsSync(CONSCIENCIA_DIR)) return [];
  return fs.readdirSync(CONSCIENCIA_DIR).filter(f => f.endsWith('.md')).sort();
}

function lerArquivo(filename) {
  const filePath = path.join(CONSCIENCIA_DIR, filename);
  if (!fs.existsSync(filePath)) return null;
  return fs.readFileSync(filePath, 'utf8');
}

function anexarAoArquivo(filename, content) {
  const filePath = path.join(CONSCIENCIA_DIR, filename);
  const timestamp = new Date().toISOString().replace('T', ' ').slice(0, 19);
  const bloco = `\n\n---\n<!-- appended: ${timestamp} -->\n${content}`;
  fs.appendFileSync(filePath, bloco, 'utf8');
  return filePath;
}

function buscarNosArquivos(query) {
  const arquivos = listarArquivos();
  const resultados = [];
  const termo = query.toLowerCase();
  for (const filename of arquivos) {
    const conteudo = lerArquivo(filename);
    if (!conteudo) continue;
    const linhas = conteudo.split('\n');
    const encontradas = linhas
      .map((linha, idx) => ({ linha, idx: idx + 1 }))
      .filter(({ linha }) => linha.toLowerCase().includes(termo));
    if (encontradas.length > 0) {
      resultados.push({ filename, ocorrencias: encontradas });
    }
  }
  return resultados;
}

module.exports = {
  name: 'memoria-longa',
  description: 'Lê e escreve no Cérebro Vivo (docs/CONSCIENCIA/)',
  category: 'memory',

  async execute(params = {}) {
    const { op, filename, content, query, n } = params;

    if (op === 'list') {
      const arquivos = listarArquivos();
      if (arquivos.length === 0) {
        return { text: '📂 Nenhum arquivo .md encontrado em CONSCIENCIA.' };
      }
      const lista = arquivos.map((f, i) => `${i + 1}. ${f}`).join('\n');
      return {
        text: `<b>Cérebro Vivo — arquivos disponíveis:</b>\n<pre>${lista}</pre>`,
        arquivos,
      };
    }

    if (op === 'read') {
      if (!filename) return { error: 'Informe filename para op=read' };
      const conteudo = lerArquivo(filename);
      if (conteudo === null) {
        return { error: `Arquivo não encontrado: ${filename}` };
      }
      const preview = conteudo.slice(0, 3000);
      const truncado = conteudo.length > 3000;
      return {
        text: `<b>${filename}</b>\n<pre>${preview}${truncado ? '\n...[truncado]' : ''}</pre>`,
        filename,
        truncado,
        totalChars: conteudo.length,
      };
    }

    if (op === 'write') {
      if (!filename) return { error: 'Informe filename para op=write' };
      if (!content) return { error: 'Informe content para op=write' };
      const filePath = anexarAoArquivo(filename, content);
      return {
        text: `✅ Conteúdo anexado ao final de <code>${filename}</code> com timestamp.`,
        filePath,
      };
    }

    if (op === 'search') {
      if (!query) return { error: 'Informe query para op=search' };
      const resultados = buscarNosArquivos(query);
      if (resultados.length === 0) {
        return { text: `🔍 Nenhum resultado para "<code>${query}</code>" nos arquivos de CONSCIENCIA.` };
      }
      const limite = typeof n === 'number' ? n : 5;
      let saida = `<b>Resultados para "${query}":</b>\n`;
      for (const r of resultados.slice(0, limite)) {
        saida += `\n<b>${r.filename}</b>`;
        for (const { linha, idx } of r.ocorrencias.slice(0, 3)) {
          saida += `\n  L${idx}: <code>${linha.trim().slice(0, 120)}</code>`;
        }
      }
      const totalArquivos = resultados.length;
      if (totalArquivos > limite) {
        saida += `\n\n...e mais ${totalArquivos - limite} arquivo(s) com resultados.`;
      }
      return { text: saida, totalArquivos };
    }

    return {
      error: 'Op inválida. Use: list | read | write | search',
      usage: {
        list: '{ op: "list" }',
        read: '{ op: "read", filename: "01-REGRAS.md" }',
        write: '{ op: "write", filename: "01-REGRAS.md", content: "novo bloco" }',
        search: '{ op: "search", query: "webhook", n: 5 }',
      },
    };
  },
};
