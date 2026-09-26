# OUTRO - parallel-groups.ts
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.bun\install\cache\pi-subagents@0.57.0@@@1\src\runs\background\parallel-groups.ts
**SHA:** e4d8323ae801a303
**Timestamp:** 2026-08-28T02:24:53.396003
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- return typeof start === "number"

### Ouro Bruto (primeiros 5000 chars)
```
import type { AsyncParallelGroupStatus } from "../../shared/types.ts";

function isValidParallelGroup(group: unknown, stepCount: number, chainStepCount: number): group is AsyncParallelGroupStatus {
	if (typeof group !== "object" || group === null) return false;
	const { start, count, stepIndex } = group as Partial<AsyncParallelGroupStatus>;
	return typeof start === "number"
		&& typeof count === "number"
		&& typeof stepIndex === "number"
		&& Number.isInteger(start)
		&& Number.isInteger(count)
		&& Number.isInteger(stepIndex)
		&& start >= 0
		&& count > 0
		&& stepIndex >= 0
		&& stepIndex < chainStepCount
		&& start + count <= stepCount;
}

export function normalizeParallelGroups(groups: unknown, stepCount: number, chainStepCount: number): AsyncParallelGroupStatus[] {
	if (!Array.isArray(groups)) return [];
	return groups
		.filter((group): group is AsyncParallelGroupStatus => isValidParallelGroup(group, stepCount, chainStepCount))
		.sort((left, right) => left.stepIndex - right.stepIndex || left.start - right.start);
}

export function flatToLogicalStepIndex(flatIndex: number, chainStepCount: number, groups: AsyncParallelGroupStatus[]): number {
	let logicalIndex = 0;
	let cursor = 0;
	for (const group of groups) {
		while (cursor < group.start && logicalIndex < chainStepCount) {
			if (cursor === flatIndex) return logicalIndex;
			cursor++;
			logicalIndex++;
		}
		if (flatIndex >= group.start && flatIndex < group.start + group.count) return group.stepIndex;
		cursor = group.start + group.count;
		logicalIndex = group.stepIndex + 1;
	}
	while (cursor <= flatIndex && logicalIndex < chainStepCount) {
		if (cursor === flatIndex) return logicalIndex;
		cursor++;
		logicalIndex++;
	}
	return Math.max(0, chainStepCount - 1);
}

```