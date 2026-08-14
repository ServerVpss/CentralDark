# Mapas Mermaid — recuperação, prova e aplicação segura

## 1. Cadeia de custódia da evidência

```mermaid
flowchart TD
    A[Execução técnica em andamento] --> B{Resposta da interface ficou visível?}
    B -- Sim --> C[Registrar resposta + artefatos]
    B -- Não / conteúdo ocultado --> D[Não concluir que o arquivo desapareceu]
    D --> E[Mapear superfícies persistentes]
    E --> F[Conversa / Library / workspace / anexos]
    F --> G[Localizar artefato pelo nome, tamanho e contexto]
    G --> H[Calcular SHA-256]
    H --> I[Extrair em diretório limpo]
    I --> J[Reexecutar sintaxe, testes, contraprovas e seal]
    J --> K{Todos os gates fechados?}
    K -- Não --> L[BLOCKED com causa concreta]
    K -- Sim --> M[PASS_LOCAL_DETERMINISTIC]
    M --> N[Montar pacote completo da sessão]
    N --> O[Registrar documentos + ZIPs no PR]
    O --> P[Revisão humana]
    P --> Q{Merge autorizado?}
    Q -- Não --> R[CANDIDATO, não canônico]
    Q -- Sim --> S[Aprendizado canônico na main]
```

## 2. Máquina de estados anti-falso-verde

```mermaid
stateDiagram-v2
    [*] --> DESCONHECIDO
    DESCONHECIDO --> LOCALIZADO: arquivo encontrado
    LOCALIZADO --> IDENTIDADE_PROVADA: nome + tamanho + SHA-256
    IDENTIDADE_PROVADA --> REVALIDADO: extração limpa + execução
    REVALIDADO --> EMPACOTADO: sessão + manifestos + receipts
    EMPACOTADO --> PR_CANDIDATO: branch + commit + PR
    PR_CANDIDATO --> BLOQUEADO: falha, drift ou segredo real
    BLOQUEADO --> PR_CANDIDATO: correção mínima + nova prova
    PR_CANDIDATO --> CANONICO: merge humano autorizado
    CANONICO --> [*]
```

## 3. Fronteiras de confiança

```mermaid
flowchart LR
    subgraph UI[Interface não confiável como armazenamento]
      U1[Resposta exibida]
      U2[Resposta ocultada/interrompida]
    end
    subgraph PERSIST[Superfícies persistentes verificáveis]
      L[Library]
      W[Workspace]
      A[Anexos]
      R[Repositório privado]
    end
    subgraph PROVA[Prova independente]
      H[SHA-256]
      Z[CRC + path safety]
      T[Testes reais]
      C[Contraprovas]
      S[Code seal]
    end
    U1 --> PERSIST
    U2 --> PERSIST
    PERSIST --> PROVA
    PROVA --> R
```

## 4. Aplicação na CentralDark

```mermaid
sequenceDiagram
    participant P as Pivete/SEGREDO-CHEFE
    participant IA as IA executora
    participant FS as Arquivos/Library
    participant V as Verificador determinístico
    participant GH as GitHub PR
    participant H as Revisor humano

    P->>IA: Exige sessão completa, não mini artefato
    IA->>FS: Localiza artefato interrompido e pacote agregado
    FS-->>IA: ZIPs + receipts + validações
    IA->>V: Hash, CRC, path safety, sintaxe, testes, contraprovas
    V-->>IA: PASS ou BLOCKED com causa
    IA->>GH: Commit de ZIPs + Markdown + Mermaid + YAML + JSON + Canvas
    GH-->>H: PR candidato, sem merge automático
    H->>GH: Revisa evidência e decide
```
