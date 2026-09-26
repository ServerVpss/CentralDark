# COMANDO - atomic-refactor-execute.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\aiox-core\squads\design-studio\tasks\atomic-refactor-execute.md
**SHA:** aec4c0597428f962
**Timestamp:** 2026-08-28T13:25:04.259892
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Padroes
- - Pattern: `use{Domain}{Feature}` (e.g., `useCoursesFilters`)

### Ouro Bruto (primeiros 5000 chars)
```
# Atomic Design Refactoring Execute

> Task ID: atomic-refactor-execute
> Agent: Brad Frost (Design System)
> Version: 2.0.0
>
> **ATUALIZADO Jan/2026:** Adicionados gates anti-over-engineering.

## ⛔ GATES OBRIGATÓRIOS (LER PRIMEIRO)

### GATE 0: Devo Atomizar?
```bash
wc -l {arquivo}
# Se <500 → NÃO atomize, apenas organize inline
```

### GATE 1: Antes de Cada Hook
```
PERGUNTA: Esse hook será usado em OUTRO componente?
SE NÃO → não crie o hook, mantenha useState inline
```

### GATE 2: Validação Final
```bash
find {pasta-criada} -name "*.ts" -o -name "*.tsx" | xargs wc -l | tail -1
# Se linhas_depois > linhas_antes → FALHA, simplificar
```

## Description

Executes Atomic Design refactoring on a single component, decomposing a monolithic template into types, hooks, atoms, molecules, organisms, and an orchestrating template.

**IMPORTANTE:** Apenas criar hooks que serão REUSADOS. useState específicos devem ficar inline.

## Prerequisites

- Target component identified (e.g., `CoursesTemplate.tsx`)
- Reference pattern exists (e.g., `app/components/ops/users/`)
- Shared components available in `app/components/shared/` (if needed)

## Workflow

### Interactive Elicitation

1. **Select Target Component**
   - Component file path
   - Confirm line count and complexity

2. **Review Current Structure**
   - List `useState` hooks (→ custom hooks)
   - List `render{X}()` functions (→ organisms)
   - Identify UI patterns (→ molecules)
   - Identify small UI elements (→ atoms)

3. **Confirm Output Structure**
   - Target folder path
   - File naming conventions
   - Dependencies on shared components

### Steps

1. **Analyze Component**
   - Read entire file
   - Extract all `useState` declarations
   - Extract all `render{X}()` functions
   - Identify JSX patterns repeated 2+ times
   - Validation: Analysis complete, patterns identified

2. **Create Folder Structure**
   ```
   {domain}/{component-name}/
   ├── types.ts
   ├── index.ts
   ├── {ComponentName}Template.tsx
   ├── hooks/
   │   └── index.ts
   ├── atoms/
   │   └── index.ts (if needed)
   ├── molecules/
   │   └── index.ts
   └── organisms/
       └── index.ts
   ```
   - Validation: Directory structure created

3. **Extract Types**
   - Create `types.ts` with all interfaces
   - Include prop types for all sub-components
   - Add type exports
   - Validation: TypeScript compiles

4. **Extract Hooks** ⚠️ GATE 1
   - **ANTES de criar cada hook:** Esse hook será usado em OUTRO componente?
   - Se NÃO → **NÃO CRIE**, mantenha useState inline com comentários
   - Group related `useState` into custom hooks **APENAS SE REUSÁVEIS**
   - Pattern: `use{Domain}{Feature}` (e.g., `useCoursesFilters`)
   - Each hook handles one concern
   - Export from `hooks/index.ts`
   - Validation: Hooks compile, no circular deps, **0 hooks órfãos**

5. **Extract Atoms** (if needed)
   - Small, stateless UI elements
   - Examples: Avatar, Badge, Icon wrapper
   - Only if not already in `shared/atoms/`
   - Validation: Atoms render correctly

6. **Extract Molecules**
   - Combinations of atoms/primitives
   - Examples: SearchInput, StatCard, AlertMessage
   - Check shared/ first before creating
   - Validation: Molecules render correctly

7. **Extract Organisms**
   - One organism per `render{X}()` function
   - Named `{X}View.tsx` or `{X}Section.tsx`
   - Receives props, renders molecules
   - Export from `organisms/index.ts`
   - Validation: Organisms render correctly

8. **Create Template Orchestrator**
   - Main component, ~100-200 lines max
   - Imports and uses all hooks
   - Renders organisms in layout
   - Handles top-level state coordination
   - Validation: Full component renders

9. **Update Imports**
   - Update any files importing the old component
   - Change from direct import to folder import
   - Validation: No broken imports

10. **Verify TypeScript**
    - Run `npx tsc --noEmit`
    - Fix any type errors
    - Validation: Zero TypeScript errors

11. **Update Documentation**
    - Mark component as done in ROADMAP.md
    - Update file count in status
    - Validation: Documentation updated

## Output

For a component like `CoursesTemplate.tsx` (1,987 lines):

```
app/components/creator/courses/
├── types.ts                    # ~80 lines
├── index.ts                    # ~5 lines
├── CoursesTemplate.tsx         # ~150 lines ✨
├── hooks/
│   ├── index.ts
│   ├── useCoursesData.ts       # ~60 lines
│   ├── useCoursesFilters.ts    # ~40 lines
│   ├── useNewCourseForm.ts     # ~80 lines
│   └── useCoursePipeline.ts    # ~50 lines
├── molecules/
│   ├── index.ts
│   ├── CourseCard.tsx          # ~80 lines
│   ├── PipelineStepBadge.tsx   # ~40 lines
│   └── CourseStatusBadge.tsx   # ~35 lines
└── organisms/
    ├── index.ts
    ├── CoursesHeader.tsx       # ~60 lines
    ├── CoursesListView.tsx     # ~120 lines
    ├── CourseDetailView.tsx    # ~150 lines
    ├── NewCourseView.tsx       # ~180 lines
    ├── BriefEditorView.tsx     # ~200 lines
    └── PipelineView.tsx
```