import { describe, expect, it } from 'vitest'
import { flattenMessageKeys } from '@hermes/shared/i18n'

import { TRANSLATIONS } from './catalog'
import { en } from './en'
import { normalizeLocale } from './languages'
import messages from './pt-br.messages.json'

describe('Português (Brasil) integrado ao Desktop', () => {
  it('reconhece o idioma sem depender de um pacote do gateway', () => {
    expect(normalizeLocale('pt-BR')).toBe('pt-br')
    expect(normalizeLocale('português')).toBe('pt-br')
  })

  it('traduz as telas de aparência e atualização da interface', () => {
    const pt = TRANSLATIONS['pt-br']
    expect(pt.settings.appearance.introSplashTitle).toBe('Tela de abertura')
    expect(pt.settings.appearance.modelPricingTitle).toBe('Preços dos modelos')
    expect(pt.settings.appearance.resumeLastSessionTitle).not.toBe(en.settings.appearance.resumeLastSessionTitle)
    expect(pt.updates).not.toBe(en.updates)
    expect(pt.composer.newSessionPlaceholders[0]).toBe('O que vamos construir?')
    expect(pt.composer.followUpPlaceholders[0]).toBe('Envie uma continuação')
  })

  it('cobre todas as chaves textuais do catálogo inglês; elementos estruturados ficam tipados', () => {
    const missing = flattenMessageKeys(en).filter(key => !(key in messages))
    expect(missing.sort()).toEqual([
      'composer.followUpPlaceholders',
      'composer.newSessionPlaceholders',
      'intro.custom',
      'sidebar.projects.branchOff'
    ])
  })
})
