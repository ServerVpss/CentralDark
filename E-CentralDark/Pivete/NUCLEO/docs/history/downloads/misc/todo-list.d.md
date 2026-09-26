# OUTRO - todo-list.d.ts
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cursor\skills-cursor\canvas\sdk\todo-list.d.ts
**SHA:** 065378a572a79b70
**Timestamp:** 2026-08-28T02:38:08.442111
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- onTodoClick?: (todo: TodoItem) => void;
- onTodoClick?: (todo: TodoItem) => void;

### Ouro Bruto (primeiros 5000 chars)
```
import type { CSSProperties, JSX } from "react";
export type TodoStatus = "pending" | "in_progress" | "completed" | "cancelled";
export interface TodoItem {
    readonly id: string;
    readonly content: string;
    readonly status: TodoStatus;
}
export type TodoListProps = {
    todos: readonly TodoItem[];
    dimmedTodoIds?: ReadonlySet<string>;
    /** Called when a todo row is clicked (entire row is a button). */
    onTodoClick?: (todo: TodoItem) => void;
    style?: CSSProperties;
};
/**
 * Task list with status icons and wrapping text. Each row is a **clickable**
 * button; use `onTodoClick` to handle selection or navigation.
 *
 * @example
 * ```tsx
 * <TodoList
 *   todos={items}
 *   onTodoClick={(todo) => setActiveId(todo.id)}
 * />
 * ```
 */
export declare function TodoList({ todos, dimmedTodoIds, onTodoClick, style }: TodoListProps): JSX.Element | null;
export type TodoListCardProps = {
    todos: readonly TodoItem[];
    dimmedTodoIds?: ReadonlySet<string>;
    defaultExpanded?: boolean;
    onTodoClick?: (todo: TodoItem) => void;
    style?: CSSProperties;
};
/**
 * Bordered, collapsible todo list with summary header (N of M Done). Compose
 * with `onTodoClick` for row actions.
 *
 * @example
 * ```tsx
 * <TodoListCard
 *   todos={items}
 *   defaultExpanded
 *   onTodoClick={(todo) => console.log(todo.id)}
 * />
 * ```
 */
export declare function TodoListCard({ todos, dimmedTodoIds, defaultExpanded, onTodoClick, style }: TodoListCardProps): JSX.Element | null;
//# sourceMappingURL=todo-list.d.ts.map
```