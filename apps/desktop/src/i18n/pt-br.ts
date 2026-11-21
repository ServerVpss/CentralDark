// Português (Brasil) bundled catalog — same translation owner as the Hermes language-pack plugin.
// Source: StudioCodeAI/hermes-lang-pt-br (MIT © 2026 StudioCodeAI); see PT-BR-LICENSE.txt.
// The Desktop no longer depends on a gateway/plugin RPC to render its saved locale.
import {
  adaptStringOverrides, mergeTranslations, unflattenMessages, type TranslationOverride
} from '@hermes/shared/i18n'

import { en } from './en'
import messages from './pt-br.messages.json'
import type { Translations } from './types'

const overrides = adaptStringOverrides(
  en, unflattenMessages(messages, en)
) as TranslationOverride<Translations>

const base = mergeTranslations<Translations>(en, overrides)

export const ptBr: Translations = {
  ...base,
  // Text packs only carry string leaves; keep non-string UI copy translated here.
  composer: {
    ...base.composer,
    newSessionPlaceholders: [
      'O que vamos construir?',
      'Dê uma tarefa ao Hermes',
      'O que você está pensando?',
      'Descreva o que precisa',
      'O que vamos resolver?',
      'Pergunte qualquer coisa',
      'Comece com um objetivo'
    ],
    followUpPlaceholders: [
      'Envie uma continuação',
      'Adicione mais contexto',
      'Refine o pedido',
      'Qual é o próximo passo?',
      'Vamos continuar',
      'Vamos aprofundar',
      'Ajuste ou continue'
    ]
  },
  sidebar: {
    ...base.sidebar,
    projects: {
      ...base.sidebar.projects,
      branchOff: () => ({ before: 'criar branch a partir de ', after: '' })
    }
  },
  // Backup & Transfer has two structured lists that a flat string catalog cannot carry.
  // Keep these in the existing pt-br TypeScript owner, alongside other structured overrides.
  settings: {
    ...base.settings,
    backup: {
      ...base.settings.backup,
      replaces: [
        'Memória',
        'Personalidade',
        'Habilidades',
        'Conversas',
        'Tarefas agendadas',
        'Configurações',
        'Chaves de API e credenciais'
      ],
      keeps: [
        'Acesso ao Nous Portal',
        'Modelo e provedor',
        'Ferramentas do Hermes Cloud',
        'Configurações do agendador'
      ]
    }
  }
}
