import { describe, expect, it } from 'vitest'

import { TRANSLATIONS } from './catalog'
import desktopKeys from '../../../../locales/_keys.desktop.json'
import ptBrMessages from './pt-br.messages.json'
import { DEFAULT_LOCALE, isLocale, isSupportedLocaleValue, LOCALE_OPTIONS, normalizeLocale, resolveInitialLocale } from './languages'

describe('desktop i18n languages', () => {
  it('normalizes supported locale aliases', () => {
    expect(normalizeLocale('en')).toBe('en')
    expect(normalizeLocale('EN-US')).toBe('en')
    expect(normalizeLocale('zh')).toBe('zh')
    expect(normalizeLocale('zh-CN')).toBe('zh')
    expect(normalizeLocale('zh-Hans')).toBe('zh')
    expect(normalizeLocale(' zh_hans_cn ')).toBe('zh')
    expect(normalizeLocale('zh-Hant')).toBe('zh-hant')
    expect(normalizeLocale('zh-TW')).toBe('zh-hant')
    expect(normalizeLocale('zh_HK')).toBe('zh-hant')
    expect(normalizeLocale('ja')).toBe('ja')
    expect(normalizeLocale('ja-JP')).toBe('ja')
    expect(normalizeLocale('ar')).toBe('ar')
    expect(normalizeLocale('AR-SA')).toBe('ar')
    expect(normalizeLocale(' ar_eg ')).toBe('ar')
    expect(normalizeLocale('ru')).toBe('ru')
    expect(normalizeLocale('RU-RU')).toBe('ru')
    expect(normalizeLocale(' ru_ru ')).toBe('ru')
    expect(normalizeLocale('Русский')).toBe('ru')
    expect(normalizeLocale('fr')).toBe('fr')
    expect(normalizeLocale('FR-CA')).toBe('fr')
    expect(normalizeLocale(' fr_fr ')).toBe('fr')
    expect(normalizeLocale('Français')).toBe('fr')
    expect(normalizeLocale('de')).toBe('de')
    expect(normalizeLocale('DE-AT')).toBe('de')
    expect(normalizeLocale(' de_ch ')).toBe('de')
    expect(normalizeLocale('Deutsch')).toBe('de')
    expect(normalizeLocale('es')).toBe('es')
    expect(normalizeLocale('ES-419')).toBe('es')
    expect(normalizeLocale(' es_mx ')).toBe('es')
    expect(normalizeLocale('Español')).toBe('es')
  })

  it('falls back to Brazilian Portuguese for empty or unsupported values', () => {
    expect(normalizeLocale(null)).toBe(DEFAULT_LOCALE)
    expect(normalizeLocale('')).toBe(DEFAULT_LOCALE)
    expect(normalizeLocale('it')).toBe(DEFAULT_LOCALE)
  })

  it('uses pt-br on a new install and preserves an explicitly saved language', () => {
    expect(DEFAULT_LOCALE).toBe('pt-br')
    expect(resolveInitialLocale(undefined, 'en-US')).toBe('pt-br')
    expect(resolveInitialLocale(null, 'es-MX')).toBe('pt-br')
    expect(resolveInitialLocale('en', 'pt-BR')).toBe('en')
    expect(resolveInitialLocale('es', 'en-US')).toBe('es')
    expect(TRANSLATIONS[DEFAULT_LOCALE].language.label).toBe('Idioma')
  })

  it('distinguishes exact locale ids from supported config aliases', () => {
    expect(isSupportedLocaleValue('zh-CN')).toBe(true)
    expect(isSupportedLocaleValue('zh-TW')).toBe(true)
    expect(isSupportedLocaleValue('ja-JP')).toBe(true)
    expect(isSupportedLocaleValue('ru-RU')).toBe(true)
    expect(isSupportedLocaleValue('de-DE')).toBe(true)
    expect(isSupportedLocaleValue('it')).toBe(false)
    expect(isLocale('zh-CN')).toBe(false)
    expect(isLocale('zh')).toBe(true)
    expect(isLocale('zh-hant')).toBe(true)
    expect(isLocale('ja')).toBe(true)
    expect(isLocale('ar')).toBe(true)
    expect(isLocale('ru')).toBe(true)
    expect(isLocale('fr')).toBe(true)
    expect(isLocale('de')).toBe(true)
    expect(isLocale('es')).toBe(true)
  })

  it('covers every translatable English Desktop key in pt-br without dropping structured values', () => {
    // Four inherited structural keys and the two new backup lists are provided
    // as typed values rather than string keys in pt-br.messages.json.
    const structuredKeys = new Set([
      'composer.followUpPlaceholders',
      'composer.newSessionPlaceholders',
      'intro.custom',
      'sidebar.projects.branchOff',
      'settings.backup.keeps',
      'settings.backup.replaces'
    ])
    const missing = desktopKeys.keys.filter(
      key => !structuredKeys.has(key) && !Object.hasOwn(ptBrMessages, key)
    )
    expect(missing).toEqual([])
    const backup = TRANSLATIONS['pt-br'].settings.backup
    expect(backup.replaces).toContain('Memória')
    expect(backup.keeps).toContain('Acesso ao Nous Portal')
    expect(backup.confirmTitle('Teste')).toContain('Teste')
    expect(backup.botsOff('Telegram', 'Agente')).toContain('Agente')
    expect(backup.backupHelp).toContain('local protegido')
    expect(TRANSLATIONS['pt-br'].settings.nav.backup).toBe('Backup e transferência')
  })

  it('keeps CentralDark product and agent names distinct without renaming engine commands', () => {
    expect(TRANSLATIONS['pt-br'].updates.appName).toBe('CentralDark · OS')
    expect(ptBrMessages['updates.availableBody']).toContain('CentralDark · OS')
    expect(ptBrMessages['updates.applyingBody']).toContain('CentralDark · OS')
    expect(ptBrMessages['updates.stages.update']).toBe('Atualizando CentralDark · OS…')
    expect(ptBrMessages['notifications.updateHermes']).toBe('Atualizar CentralDark · OS')
    expect(ptBrMessages['appTour.messaging.text']).toContain('CentralDark · Agente')
    expect(ptBrMessages['assistant.thread.errorCodes.SESSION_OWNER_BUSY.title']).toContain('CentralDark · Agente')
    expect(ptBrMessages['boot.ready']).toBe('CentralDark · OS pronto')

    // These are protocol/compatibility identities, not branding labels.
    expect(ptBrMessages['updates.applyStatus.owed']).toContain('`hermes update`')
    expect(ptBrMessages['assistant.catalogInstall.requiresHermes']).toBe('Hermes {0}')

    const uiUpdaterStrings = Object.entries(ptBrMessages).filter(([key]) => key.startsWith('updates.'))
    for (const [key, value] of uiUpdaterStrings) {
      expect(value, key).not.toMatch(/\\bHermes\\b/)
    }
  })

  it('round-trips every picker option through its display.language value to a registered catalog', () => {
    for (const option of LOCALE_OPTIONS) {
      expect(normalizeLocale(option.configValue)).toBe(option.id)
      expect(TRANSLATIONS[option.id]).toBeDefined()
    }

    expect(Object.keys(TRANSLATIONS).sort()).toEqual(LOCALE_OPTIONS.map(option => option.id).sort())
  })
})
