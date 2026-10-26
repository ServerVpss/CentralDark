# 🗺️ MAPA DE PIDs — Serviços em Casa SEGREDO

## 📊 Resumo Executivo

```
Total de processos node.exe: 43
Portas identificadas:
  ✅ 3000   → PID ? (Cockpit/instinto-superior)
  ✅ 443    → PID ? (HTTPS)
  ✅ 9100   → PID ? (Node monitoring)
  ❌ 8081   → NÃO ENCONTRADO (DESLIGADO)
```

---

## 📋 Todos os PIDs Node.exe Rodando

```
PID      | Processo          | Memória  | Status
---------|-------------------|----------|----------
21268    | node.exe          | 28.7 MB  | RUNNING
3568     | node.exe          | 17.9 MB  | RUNNING
21928    | node.exe          | 32.3 MB  | RUNNING
22896    | node.exe          | 34.9 MB  | RUNNING
25640    | node.exe          | 38.0 MB  | RUNNING
26084    | node.exe          | 61.1 MB  | RUNNING
24212    | node.exe          | 40.4 MB  | RUNNING
24696    | node.exe          | 61.8 MB  | RUNNING
25508    | node.exe          | 33.7 MB  | RUNNING
25008    | node.exe          | 40.6 MB  | RUNNING
7540     | node.exe          | 36.7 MB  | RUNNING
27528    | node.exe          | 41.3 MB  | RUNNING
20656    | node.exe          | 31.4 MB  | RUNNING
12384    | node.exe          | 40.2 MB  | RUNNING
28492    | node.exe          | 48.2 MB  | RUNNING
23956    | node.exe          | 40.1 MB  | RUNNING
24528    | node.exe          | 55.6 MB  | RUNNING
25880    | node.exe          | 62.4 MB  | RUNNING
36344    | node.exe          | 63.4 MB  | RUNNING
34128    | node.exe          | 58.6 MB  | RUNNING
19996    | node.exe          | 58.5 MB  | RUNNING
22260    | node.exe          | 63.4 MB  | RUNNING
1120     | node.exe          | 64.2 MB  | RUNNING
34392    | node.exe          | 77.8 MB  | RUNNING
2728     | node.exe          | 55.5 MB  | RUNNING
11916    | node.exe          | 65.3 MB  | RUNNING
35984    | node.exe          | 71.7 MB  | RUNNING
31496    | node.exe          | 75.1 MB  | RUNNING
32556    | node.exe          | 103.3 MB | RUNNING ⚠️ Alto uso
3208     | node.exe          | 130.0 MB | RUNNING ⚠️ MAIS ALTO
19468    | node.exe          | 63.6 MB  | RUNNING
25148    | node.exe          | 89.5 MB  | RUNNING
33732    | node.exe          | 89.5 MB  | RUNNING
2904     | node.exe          | 88.8 MB  | RUNNING
36468    | node.exe          | 70.0 MB  | RUNNING
15240    | node.exe          | 89.7 MB  | RUNNING
9988     | node.exe          | 85.2 MB  | RUNNING
29952    | node.exe          | 124.4 MB | RUNNING ⚠️ MUITO ALTO
12600    | node.exe          | 71.4 MB  | RUNNING
14852    | node.exe          | 70.5 MB  | RUNNING
28328    | node.exe          | 94.8 MB  | RUNNING
```

---

## 🔍 Processos Listening (Portas Mapeadas)

### Serviços Identificados

```
Porta    | PID      | Processo | Serviço
---------|----------|----------|------------------------------------------
3000     | ?        | node ?   | ✅ Cockpit/instinto-superior (RODANDO)
443      | 5584     | tailscaled.exe | HTTPS (Tailscale)
9100     | 5584     | tailscaled.exe | Node metrics/monitoring
3030     | 22364    | node.exe | Possível outro serviço
7070     | 5616     | ?        | Outro serviço
```

---

## 🔴 PORTA 8081 — STATUS CRÍTICO

```
❌ Porta 8081: NÃO ESTÁ LISTENING
❌ Serviço sala-controle: DESLIGADO
❌ Sem PID associado

Possíveis Causas:
  1. Processo morreu (crash)
  2. Ainda não foi iniciado
  3. Configurado para rodai em outra porta (3000?)
  4. Timeout no startup
```

---

## 🎯 Próximas Ações

### Opção 1: Identificar qual PID está rodando Cockpit/sala-controle

```bash
# Verificar qual PID está em 3000
wmic process where "ProcessId=<PID>" get CommandLine
```

### Opção 2: Ligar sala-controle explicitamente em 8081

```bash
# Dentro de K:\apps\instinto-superior\
npm run dev -- --port 8081

# Ou via node direto:
node server.js --port 8081
```

### Opção 3: Matar o PID atual (se em 3000) e reinicar em 8081

```bash
taskkill /PID <PID> /F
# Depois:
npm run dev -- --port 8081
```

---

## 📊 Memória Total Consumida

```
43 processos node.exe × ~60 MB (média) = ~2.5 GB RAM
Picos:
  - PID 3208: 130.0 MB
  - PID 29952: 124.4 MB
  - PID 34392: 77.8 MB
```

---

## 🔗 Referências

- Cockpit (3000): K:\apps\instinto-superior
- Esperado (8081): sala-controle (NÃO ENCONTRADO)
- Logs: K:\apps\instinto-superior\.output ou K:\...\server.log

**NEXT_CURSOR:** Identificar qual `node.exe` roda Cockpit em 3000 e verificar se 8081 é rota diferente no mesmo processo.

