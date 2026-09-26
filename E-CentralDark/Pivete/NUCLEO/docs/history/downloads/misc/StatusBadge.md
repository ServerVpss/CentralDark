# OUTRO - StatusBadge.css
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\.aios-core\scripts\diagnostics\health-dashboard\src\components\shared\StatusBadge.css
**SHA:** b0c1b630dab59cbf
**Timestamp:** 2026-08-28T02:02:23.593782
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- gap: var(--spacing-xs);

### Ouro Bruto (primeiros 5000 chars)
```
.badge {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--radius-full);
  font-weight: 500;
  text-transform: capitalize;
}

.badge--sm {
  font-size: 0.75rem;
  padding: 2px var(--spacing-xs);
}

.badge--md {
  font-size: 0.875rem;
}

.badge--lg {
  font-size: 1rem;
  padding: var(--spacing-sm) var(--spacing-md);
}

/* Status variants */
.badge--healthy,
.badge--passed {
  background-color: rgba(34, 197, 94, 0.15);
  color: var(--color-healthy);
}

.badge--degraded,
.badge--warning {
  background-color: rgba(234, 179, 8, 0.15);
  color: var(--color-degraded);
}

.badge--critical,
.badge--failed {
  background-color: rgba(239, 68, 68, 0.15);
  color: var(--color-critical);
}

.badge--skipped {
  background-color: rgba(100, 116, 139, 0.15);
  color: var(--color-text-muted);
}

/* Severity variants */
.badge--severity-critical {
  background-color: rgba(239, 68, 68, 0.15);
  color: var(--color-severity-critical);
}

.badge--severity-high {
  background-color: rgba(249, 115, 22, 0.15);
  color: var(--color-severity-high);
}

.badge--severity-medium {
  background-color: rgba(234, 179, 8, 0.15);
  color: var(--color-severity-medium);
}

.badge--severity-low {
  background-color: rgba(34, 197, 94, 0.15);
  color: var(--color-severity-low);
}

.badge--severity-info {
  background-color: rgba(59, 130, 246, 0.15);
  color: var(--color-info);
}

.badge-icon {
  font-size: 0.875em;
}

```