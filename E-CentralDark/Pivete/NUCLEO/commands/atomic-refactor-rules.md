# COMANDO - atomic-refactor-rules.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\aiox-core\squads\design\data\atomic-refactor-rules.md
**SHA:** 4ef1f3218b0fbe79
**Timestamp:** 2026-08-28T13:24:56.848437
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Contratos
- onNavigate: (view: CourseView) => void;  // CourseView not defined yet!
- onNavigate: (view: CourseView) => void;  // OK
- onNavigate: (view: 'overview' | 'research') => void;
- onNavigate: (view: 'overview' | 'research') => void;
- onNavigate: (view: string) => void;  // Incompatible!
- onNavigate: (view: CourseView) => void;
- onNavigate: (view: CourseView) => void;  // Same type

### Ouro Bruto (primeiros 5000 chars)
```
# Atomic Design Refactoring Rules

> Validation rules and best practices for Atomic Design refactoring.
> Based on 18+ refactored components with 91% average reduction.
>
> **v2.0 - Jan/2026:** Adicionados gates anti-over-engineering após análise mostrar +111% código em alguns casos.

---

## ⛔ GATES ANTI-OVER-ENGINEERING (LER PRIMEIRO!)

> **LIÇÃO JAN/2026:** Atomizamos 22 componentes. Em alguns casos, FragmentsTab foi de 475 → 1003 linhas (+111%) com 73% dos hooks sem reuso externo.

### GATE 0: Devo Atomizar?

| Linhas | useState | Decisão |
|--------|----------|---------|
| >800 | qualquer | **SIM** - atomizar |
| 500-800 | >7 | **SIM** - atomizar |
| 500-800 | ≤7 | **TALVEZ** - só se hooks serão reusados |
| <500 | qualquer | **NÃO** - organizar inline |

### GATE 1: Antes de Criar Cada Hook

```
PERGUNTA OBRIGATÓRIA: Esse hook será usado em OUTRO componente?

SE SIM → criar o hook (listar onde será usado)
SE NÃO → NÃO criar, manter useState inline com comentários organizados
```

**Exemplo de useState inline organizado (melhor que hook órfão):**
```typescript
const MyComponent = () => {
  // === STATE: Data ===
  const { data, isLoading } = useMyData(id);

  // === STATE: UI ===
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  // === STATE: Filters ===
  const [search, setSearch] = useState('');
  const filteredData = useMemo(() => data?.filter(...), [data, search]);

  // ... resto
};
```

### GATE 2: Validação Final (OBRIGATÓRIO)

```bash
# Após terminar, verificar linhas TOTAIS
find {pasta-criada} -name "*.ts" -o -name "*.tsx" | xargs wc -l | tail -1

# Se linhas_depois > linhas_antes → FALHA, simplificar ou reverter
```

| Métrica | Limite | Se Falhar |
|---------|--------|-----------|
| Linhas totais | ≤ original | Simplificar |
| Arquivos | ≤7 por feature | Consolidar |
| Hooks órfãos | 0 | Mover inline |

---

## Required Rules (MUST)

### 1. Line Limits

| Type | Max | Ideal |
|------|--------|-------|
| Template (orchestrator) | **100** | 50-80 |
| Organism | 200 | 100-150 |
| Molecule | 100 | 50-80 |
| Hook | 150 | 80-120 |
| types.ts | No limit | - |
| data/*.ts | No limit | - |

**Validation:**
```bash
# Check largest file (except types.ts and data/)
find . -name "*.tsx" -o -name "*.ts" | grep -v types.ts | grep -v /data/ | xargs wc -l | sort -rn | head -5
```

### 2. Folder Structure

```
{domain}/{feature}/
├── types.ts           # REQUIRED
├── index.ts           # REQUIRED
├── {Feature}Template.tsx  # REQUIRED (orchestrator)
├── hooks/
│   └── index.ts       # REQUIRED if has hooks
├── molecules/
│   └── index.ts       # REQUIRED if has molecules
└── organisms/
    └── index.ts       # REQUIRED
```

### 3. Naming Conventions

| Type | Pattern | Example |
|------|---------|---------|
| Template | `{Feature}Template.tsx` | `CoursesTemplate.tsx` |
| Organism | `{Feature}{Type}.tsx` | `CoursesListView.tsx` |
| Molecule | `{Name}.tsx` | `StatCard.tsx` |
| Hook (data) | `use{Feature}Data.ts` | `useCoursesData.ts` |
| Hook (filters) | `use{Feature}Filters.ts` | `useCoursesFilters.ts` |
| Hook (dialog) | `use{Name}Dialog.ts` | `useCreateDialog.ts` |
| Types | `types.ts` | `types.ts` |
| Index | `index.ts` | `index.ts` |

### 4. Required Extraction

**ALWAYS extract:**
- [ ] `render{X}()` → `{X}View.tsx` or `{X}Section.tsx`
- [ ] `useState` grouped by concern → custom hook
- [ ] Color/icon configs → `types.ts`
- [ ] Mock/static data → `data/`

### 5. TypeScript

- [ ] `npx tsc --noEmit` must pass with 0 errors
- [ ] No `any` types (except when unavoidable)
- [ ] Props typed with interfaces in `types.ts`
- [ ] Hooks with explicit or inferred return type

### 6. Types Consistency

**RULE:** Every type imported in `data/*.ts` MUST exist in `types.ts`

```typescript
// ❌ WRONG - import type that doesn't exist
// data/my-data.ts
import type { FaqItem, CourseModule } from '../types';
// but types.ts doesn't have FaqItem or CourseModule → ERROR!

// ✅ CORRECT - types.ts has all interfaces
// types.ts
export interface FaqItem { ... }
export interface CourseModule { ... }

// data/my-data.ts
import type { FaqItem, CourseModule } from '../types'; // OK!
```

**Validation:**
```bash
# Check imported vs exported types
grep -h "from '../types'" {folder}/data/*.ts
grep "export interface\|export type" {folder}/types.ts
```

### 7. AppRoutes.tsx Updates

**RULE:** If moving a Template to a new folder, MUST update `AppRoutes.tsx`

```typescript
// If moving: books/templates/BookDetailTemplate.tsx
//        to: books/book-detail/BookDetailTemplate.tsx

// BEFORE in AppRoutes.tsx:
const BookDetailTemplate = React.lazy(() => import('./books/templates/BookDetailTemplate'));

// AFTER in AppRoutes.tsx:
const BookDetailTemplate = React.lazy(() => import('./books/book-detail/BookDetailTemplate'));
```

**Validation:**
```bash
# Check if import exists in new path
grep "BookDetailTemplate" app/components/AppRoutes.tsx
npm run typecheck | grep
```