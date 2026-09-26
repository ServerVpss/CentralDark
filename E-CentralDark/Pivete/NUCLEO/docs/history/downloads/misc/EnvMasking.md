# OUTRO - EnvMasking.ts
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\worktrees\pivete-centraldark\test\apps\modulos\Bolt\source\app\components\editor\codemirror\EnvMasking.ts
**SHA:** deeb2be1a73b3e4c
**Timestamp:** 2026-08-28T02:56:15.325584
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- const valueStart = line.from + key.length + 1;

### Ouro Bruto (primeiros 5000 chars)
```
import { EditorView, Decoration, type DecorationSet, ViewPlugin, WidgetType } from '@codemirror/view';

// Create a proper WidgetType class for the masked text
class MaskedTextWidget extends WidgetType {
  constructor(private readonly _value: string) {
    super();
  }

  eq(other: MaskedTextWidget) {
    return other._value === this._value;
  }

  toDOM() {
    const span = document.createElement('span');
    span.textContent = '*'.repeat(this._value.length);
    span.className = 'cm-masked-text';

    return span;
  }

  ignoreEvent() {
    return false;
  }
}

export function createEnvMaskingExtension(getFilePath: () => string | undefined) {
  return ViewPlugin.fromClass(
    class {
      decorations: DecorationSet;

      constructor(view: EditorView) {
        this.decorations = this.buildDecorations(view);
      }

      update(update: { docChanged: boolean; view: EditorView; viewportChanged: boolean }) {
        if (update.docChanged || update.viewportChanged) {
          this.decorations = this.buildDecorations(update.view);
        }
      }

      buildDecorations(view: EditorView) {
        const filePath = getFilePath();
        const isEnvFile = filePath?.endsWith('.env') || filePath?.includes('.env.') || filePath?.includes('/.env');

        if (!isEnvFile) {
          return Decoration.none;
        }

        const decorations: any[] = [];
        const doc = view.state.doc;

        for (let i = 1; i <= doc.lines; i++) {
          const line = doc.line(i);
          const text = line.text;

          // Match lines with KEY=VALUE format
          const match = text.match(/^([^=]+)=(.+)$/);

          if (match && !text.trim().startsWith('#')) {
            const [, key, value] = match;
            const valueStart = line.from + key.length + 1;

            // Create a decoration that replaces the value with asterisks
            decorations.push(
              Decoration.replace({
                inclusive: true,
                widget: new MaskedTextWidget(value),
              }).range(valueStart, line.to),
            );
          }
        }

        return Decoration.set(decorations);
      }
    },
    {
      decorations: (v) => v.decorations,
    },
  );
}

```