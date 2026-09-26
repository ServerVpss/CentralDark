# OUTRO - config.ts
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\Codex\2026-06-10\prior-conversation-with-codex-conversation-role\work\CentralDark-local\CentralDark\apps\mcp\src\config.ts
**SHA:** 59b1aa95bde07aed
**Timestamp:** 2026-08-26T19:34:24.989545
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- allowedRestart: Array.from(new Set(["MCP-CentralDark", ...csv("PM2_ALLOWED_RESTART")])),

### Ouro Bruto (primeiros 5000 chars)
```
// Configuração lida do ambiente. Validação fail-fast no boot.

function req(name: string): string {
  const v = process.env[name];
  if (!v || v.trim() === "") {
    throw new Error(`[MCP] Variável de ambiente obrigatória ausente: ${name}`);
  }
  return v.trim();
}

function opt(name: string, fallback: string): string {
  const v = process.env[name];
  return v && v.trim() !== "" ? v.trim() : fallback;
}

function csv(name: string): string[] {
  return opt(name, "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

export const config = {
  port: Number(opt("MCP_PORT", "9100")),
  publicUrl: opt("MCP_PUBLIC_URL", "http://127.0.0.1:9100"),

  github: {
    clientId: req("GITHUB_CLIENT_ID"),
    clientSecret: process.env.GITHUB_CLIENT_SECRET?.trim() ?? "",
    callbackUrl: req("GITHUB_OAUTH_CALLBACK"),
    scopes: opt("GITHUB_OAUTH_SCOPES", "repo workflow read:org"),
    owner: opt("GITHUB_OWNER", "ServerVpss"),
    repo: opt("GITHUB_REPO", "clone-deck"),
  },

  sessionSecret: req("MCP_SESSION_SECRET"),

  vps: {
    repoPath: opt("VPS_REPO_PATH", "<caminho-vps>"),
    // Modo criação controlado: o próprio MCP fica sempre permitido.
    // Serviços extras continuam dependendo da lista explícita via PM2_ALLOWED_RESTART.
    allowedRestart: Array.from(new Set(["MCP-CentralDark", ...csv("PM2_ALLOWED_RESTART")])),
  },

  log: {
    level: opt("LOG_LEVEL", "info"),
    dir: opt("LOG_DIR", "<caminho-vps>"),
  },
} as const;

export type Config = typeof config;

```

---

# OUTRO - config.yml
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\base64-0.22.1\.circleci\config.yml
**SHA:** c44defbad42a19f8
**Timestamp:** 2026-08-28T02:32:51.369101
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- - run:
- - run:
- - run:
- - run:
- - run:
- - run:
- - run:
- - run:
- - run:
- - run:

### Ouro Bruto (primeiros 5000 chars)
```
version: '2.1'

workflows:
  version: 2
  build:
    jobs:
      - build:
          matrix:
            parameters:
              rust_img: [
                # Yes, a single-parameter axis, but means it can be referred to as a cache parameter easily without
                # duplicating the magic version number throughout this file.
                # The default rust images (not -slim or -alpine) are based on buildpack-deps. Hopefully this will
                # be easier on the CI hosts since presumably those fat lower layers will already be cached, and
                # therefore faster than a minimal, customized alpine.
                # MSRV
                'rust:1.48.0'
              ]
              # a hacky scheme to work around CircleCI's inability to deal with mutable docker tags, forcing us to
              # get a nightly or stable toolchain via rustup instead of a mutable docker tag
              toolchain_override: [
                '__msrv__', # won't add any other toolchains, just uses what's in the docker image
                '1.70.0', # minimum needed to build dev-dependencies
                'stable',
                'beta',
                'nightly'
              ]

jobs:
  build:
    parameters:
      rust_img:
        type: string
      toolchain_override:
        type: string
    docker:
      - image: << parameters.rust_img >>
    steps:
      - checkout
      - restore_cache:
          key: project-cache-v5-<< parameters.rust_img >>-<< parameters.toolchain_override >>-{{ checksum "Cargo.toml" }}
      - run:
          name: Setup toolchain
          command: |
            if [[ '<< parameters.toolchain_override >>' != '__msrv__' ]]
            then
              rustup toolchain add '<< parameters.toolchain_override >>'
              rustup default '<< parameters.toolchain_override >>'
            fi
      - run:
          name: Log rustc version
          command: rustc --version
      - run:
          name: Build main target
          # update first to select dependencies appropriate for this toolchain
          command: |
            cargo update
            cargo build
      - run:
          name: Check formatting
          command: |
            rustup component add rustfmt
            cargo fmt -- --check
      - run:
          name: Check clippy lints
          # we only care about stable clippy -- nightly clippy is a bit wild
          command: |
            if [[ '<< parameters.toolchain_override >>' == 'stable' ]]
            then
              rustup component add clippy
              cargo clippy --all-targets
            fi
      - run:
          name: Build all targets
          command: |
            if [[ '<< parameters.toolchain_override >>' != '__msrv__' ]]
            then
              cargo build --all-targets
            fi
      - run:
          name: Build without default features
          command: |
            cargo build --no-default-features
            if [[ '<< parameters.toolchain_override >>' != '__msrv__' ]]
            then
              cargo build --no-default-features --all-targets
            fi
      - run:
          name: Build with only alloc
          command: |
            cargo build --no-default-features --features alloc
            if [[ '<< parameters.toolchain_override >>' != '__msrv__' ]]
            then
              cargo build --no-default-features --features alloc --all-targets
            fi
      - run:
          name: Add arm toolchain
          command: rustup target add thumbv6m-none-eabi
      - run:
          name: Build ARM without default features (no_std)
          command: cargo build --target thumbv6m-none-eabi --no-default-features
      - run:
          name: Build ARM with only alloc feature
          command: cargo build --target thumbv6m-none-eabi --no-default-features --features alloc
      - run:
          # dev dependencies can't build on 1.48.0
          name: Run tests
          command: |
            if [[ '<< parameters.toolchain_override >>' != '__msrv__' ]]
            then
              cargo test --no-default-features
              cargo test
            fi
      - run:
          name: Build docs
          command: cargo doc --verbose
      - run:
          name: Confirm fuzzers can run
          # TERM=dumb prevents cargo fuzz list from printing with color
          environment:
            TERM: dumb
          command: |
            if [[ '<< parameters.toolchain_override >>' = 'nightly' ]]
            then
              cargo install cargo-fuzz
              cargo fuzz list | xargs -I FUZZER cargo fuzz run FUZZER -- -max_total_time=1
            fi

      - save_cache:
          key: project-cache-v5-<< parameters.rust_img >>-<< parameters.toolchain_override >>-{{ checksum "Cargo.toml" }}
          paths:
            # rust docker img doesn't use $HOME/[.cargo,.rustup]
            - /usr/local/cargo
            - /usr/local/rustup
            - ./target

```

---

# OUTRO - config.yml
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\infer-0.19.0\.chglog\config.yml
**SHA:** 1b72b1468816096c
**Timestamp:** 2026-08-28T02:34:30.903217
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Padroes
- pattern: "^(\\w*)?\\:\\s(.*)$"

### Ouro Bruto (primeiros 5000 chars)
```
style: github
template: CHANGELOG.tpl.md
info:
  title: CHANGELOG
  repository_url: https://github.com/bojand/infer
options:
  commits:
    filters:
      Type:
        - docs
        - enhance
        - feat
        - fix
        - build
  commit_groups:
    title_maps:
      docs: Documentation
      enhance: Enhancements
      feat: Features
      fix: Bug Fixes
      build: Build
  header:
    pattern: "^(\\w*)?\\:\\s(.*)$"
    pattern_maps:
      - Type
      - Subject
  notes:
    keywords:
      - BREAKING CHANGE
```

---

# OUTRO - config.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\worktrees\pivete-centraldark\centraldark\apps\modulos\mcp\dist\config.js
**SHA:** e9247243a05b0252
**Timestamp:** 2026-08-28T02:54:45.970883
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- allowedRestart: Array.from(new Set(["MCP-CentralDark", ...csv("PM2_ALLOWED_RESTART")])),

### Ouro Bruto (primeiros 5000 chars)
```
// Configuração lida do ambiente.
//
// V2.0: imports devem ser fail-safe. O servidor nao deve cair so porque uma
// variavel de OAuth/GitHub esta ausente; endpoints que precisarem dela devem
// falhar em runtime com erro claro. Isso permite build, typecheck, /health e
// catalogo funcionarem em ambientes de teste/CI sem secrets.
function req(name) {
    const v = process.env[name];
    return v && v.trim() !== "" ? v.trim() : `__MISSING_${name}__`;
}
function opt(name, fallback) {
    const v = process.env[name];
    return v && v.trim() !== "" ? v.trim() : fallback;
}
function csv(name) {
    return opt(name, "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
}
export const config = {
    port: Number(opt("MCP_PORT", "9100")),
    publicUrl: opt("MCP_PUBLIC_URL", "https://mcp.centralldark.com"),
    github: {
        clientId: req("GITHUB_CLIENT_ID"),
        clientSecret: process.env.GITHUB_CLIENT_SECRET?.trim() ?? "",
        callbackUrl: req("GITHUB_OAUTH_CALLBACK"),
        scopes: opt("GITHUB_OAUTH_SCOPES", "repo workflow read:org"),
        owner: opt("GITHUB_OWNER", "ServerVpss"),
        repo: opt("GITHUB_REPO", "CentralDark"),
    },
    sessionSecret: req("MCP_SESSION_SECRET"),
    vps: {
        repoPath: opt("VPS_REPO_PATH", "/root/CentralDark"),
        allowedRestart: Array.from(new Set(["MCP-CentralDark", ...csv("PM2_ALLOWED_RESTART")])),
    },
    log: {
        level: opt("LOG_LEVEL", "info"),
        dir: opt("LOG_DIR", "/root/CentralDark/logs"),
    },
};
//# sourceMappingURL=config.js.map
//# sourceMappingURL=config.js.map
```

---

# OUTRO - config.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\worktrees\pivete-centraldark\centraldark\apps\modulos\mcp\src\config.js
**SHA:** d60ebf1860b29acf
**Timestamp:** 2026-08-28T02:54:58.652410
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- allowedRestart: Array.from(new Set(["MCP-CentralDark", ...csv("PM2_ALLOWED_RESTART")])),

### Ouro Bruto (primeiros 5000 chars)
```
// Configuração lida do ambiente.
//
// V2.0: imports devem ser fail-safe. O servidor nao deve cair so porque uma
// variavel de OAuth/GitHub esta ausente; endpoints que precisarem dela devem
// falhar em runtime com erro claro. Isso permite build, typecheck, /health e
// catalogo funcionarem em ambientes de teste/CI sem secrets.
function req(name) {
    const v = process.env[name];
    return v && v.trim() !== "" ? v.trim() : `__MISSING_${name}__`;
}
function opt(name, fallback) {
    const v = process.env[name];
    return v && v.trim() !== "" ? v.trim() : fallback;
}
function csv(name) {
    return opt(name, "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
}
export const config = {
    port: Number(opt("MCP_PORT", "9100")),
    publicUrl: opt("MCP_PUBLIC_URL", "https://mcp.centralldark.com"),
    github: {
        clientId: req("GITHUB_CLIENT_ID"),
        clientSecret: process.env.GITHUB_CLIENT_SECRET?.trim() ?? "",
        callbackUrl: req("GITHUB_OAUTH_CALLBACK"),
        scopes: opt("GITHUB_OAUTH_SCOPES", "repo workflow read:org"),
        owner: opt("GITHUB_OWNER", "ServerVpss"),
        repo: opt("GITHUB_REPO", "CentralDark"),
    },
    sessionSecret: req("MCP_SESSION_SECRET"),
    vps: {
        repoPath: opt("VPS_REPO_PATH", "/root/CentralDark"),
        allowedRestart: Array.from(new Set(["MCP-CentralDark", ...csv("PM2_ALLOWED_RESTART")])),
    },
    log: {
        level: opt("LOG_LEVEL", "info"),
        dir: opt("LOG_DIR", "/root/CentralDark/logs"),
    },
};
//# sourceMappingURL=config.js.map
```