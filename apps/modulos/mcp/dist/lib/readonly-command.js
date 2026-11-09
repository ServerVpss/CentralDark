import fs from "node:fs";
import path from "node:path";
// Classificador ESTRITO de comando somente leitura para execute_command.
// Regra: so e leitura se TODA a linha for provada leitura. Qualquer duvida
// devolve readOnly=false e o guard destrutivo continua exigindo confirmacao.
// Nao ha aspas, expansao, encadeamento, redirecionamento, glob nem env-prefix:
// a linha so pode conter palavras simples separadas por espaco.
const SAFE_LINE = /^[A-Za-z0-9_./:=,@+%^-]+( [A-Za-z0-9_./:=,@+%^-]+)*$/;
const MAX_LEN = 500;
const MAX_TOKENS = 24;
const SENSITIVE_PATH = /(^|\/)(\.env[^/]*|[^/]*\.env|secrets?|credenciais|tokens?|sessions?|sessao|cofre|\.ssh|\.gnupg|\.git-credentials|\.netrc|\.npmrc|\.hermes|\.config|shadow|gshadow|passwd-?|sudoers[^/]*|environ|id_[a-z0-9]+|proc|dev|sys|auth_info_baileys|wwebjs_auth)(\/|$)|\.(pem|key|p12|pfx|sqlite3?|db|dump|bak|backup|kdbx)$|(token|secret|credential|password|passwd|apikey|api_key)/i;
const NUM = /^[0-9]{1,6}$/;
const UNIT = /^[A-Za-z0-9_.@-]{1,100}$/;
function flagsIn(allowed) {
    const set = new Set(allowed);
    return (token) => set.has(token);
}
// Cada spec valida o vetor de argumentos inteiro. Deve devolver true so se provado.
function validPathArg(arg, ctx) {
    if (!arg || arg.startsWith("-") || arg.includes(".."))
        return false;
    if (SENSITIVE_PATH.test(arg))
        return false;
    const abs = path.resolve(ctx.baseDir, arg);
    if (SENSITIVE_PATH.test(abs))
        return false;
    try {
        const real = fs.realpathSync(abs);
        if (SENSITIVE_PATH.test(real))
            return false;
    }
    catch { /* inexistente: leitura apenas falha */ }
    return true;
}
function flagsThenPaths({ flags, valueFlags = {}, maxPaths = 8, minPaths = 0 }) {
    const isFlag = flagsIn(flags);
    return (args, ctx) => {
        let i = 0;
        while (i < args.length && args[i].startsWith("-")) {
            const a = args[i];
            if (isFlag(a)) {
                i += 1;
                continue;
            }
            const vf = valueFlags[a];
            if (vf && NUM.test(args[i + 1] ?? "")) {
                i += 2;
                continue;
            }
            const glued = /^-([nc])([0-9]{1,6})$/.exec(a);
            if (glued && valueFlags[`-${glued[1]}`]) {
                i += 1;
                continue;
            }
            return false;
        }
        const paths = args.slice(i);
        if (paths.length < minPaths || paths.length > maxPaths)
            return false;
        return paths.every((p) => validPathArg(p, ctx));
    };
}
const GIT_FLAGS = new Set([
    "--oneline", "--stat", "--name-only", "--name-status", "--short", "--porcelain", "--branch",
    "--no-color", "--cached", "--staged", "--abbrev-commit", "--graph", "--decorate", "--no-decorate",
    "-s", "-b", "-u", "-uno", "-p", "-q", "--shortstat", "--numstat", "--no-patch", "--no-pager",
]);
const GIT_VALUE = /^(-n[0-9]{1,4}|-[0-9]{1,4}|--max-count=[0-9]{1,4}|--pretty=(oneline|short|medium|full)|--format=[A-Za-z0-9%:|,_ -]{1,60}|--since=[A-Za-z0-9._:-]{1,40}|--until=[A-Za-z0-9._:-]{1,40}|--diff-filter=[ACDMRTUXB]{1,9})$/;
const GIT_REF = /^[A-Za-z0-9_][A-Za-z0-9_./@^-]{0,120}$/;
function gitSpec(args, ctx) {
    const [sub, ...rest] = args;
    if (!sub || sub.startsWith("-"))
        return false; // bloqueia git -c / --exec-path / -C
    const positional = (list) => list.every((a) => (GIT_REF.test(a) && !a.includes("..") && !SENSITIVE_PATH.test(a)) || validPathArg(a, ctx));
    const flagged = (list) => {
        const pos = [];
        for (const a of list) {
            if (a.startsWith("-")) {
                if (!(GIT_FLAGS.has(a) || GIT_VALUE.test(a)))
                    return null;
            }
            else
                pos.push(a);
        }
        return pos;
    };
    switch (sub) {
        case "status":
        case "log":
        case "diff":
        case "show":
        case "ls-files":
        case "shortlog": {
            if (sub === "ls-files" && rest.some((a) => a.startsWith("-") && a !== "--cached" && a !== "-s"))
                return false;
            // git diff executa diff.external se configurado: exige --no-ext-diff.
            if (sub === "diff" && !rest.includes("--no-ext-diff"))
                return false;
            const pos = flagged(rest.filter((a) => a !== "--no-ext-diff"));
            return pos !== null && positional(pos);
        }
        case "rev-parse": {
            const ok = rest.every((a) => ["--short", "--abbrev-ref", "--show-toplevel", "--is-inside-work-tree", "--git-dir"].includes(a) || (!a.startsWith("-") && GIT_REF.test(a)));
            return ok;
        }
        case "branch":
            return rest.length === 0 || (rest.length === 1 && ["--show-current", "-a", "-r", "-v", "-vv", "--list"].includes(rest[0]));
        case "remote":
            return rest.length === 0 || (rest.length === 1 && rest[0] === "-v");
        case "worktree":
            return rest.length === 1 && rest[0] === "list" || (rest.length === 2 && rest[0] === "list" && rest[1] === "--porcelain");
        default:
            return false;
    }
}
const SPECS = {
    echo: () => true,
    pwd: (a) => a.length === 0,
    whoami: (a) => a.length === 0,
    uptime: (a) => a.length === 0 || (a.length === 1 && ["-p", "-s"].includes(a[0])),
    hostname: (a) => a.every((x) => ["-f", "-s", "-i", "-I", "-d", "-A"].includes(x)),
    date: (a) => a.every((x) => x === "-u" || x === "-I" || x.startsWith("+")),
    uname: (a) => a.every((x) => ["-a", "-s", "-r", "-m", "-n", "-o", "-v"].includes(x)),
    id: (a) => a.every((x) => ["-u", "-g", "-n"].includes(x)),
    free: (a) => a.every((x) => ["-m", "-h", "-g", "-b"].includes(x)),
    df: flagsThenPaths({ flags: ["-h", "-T", "-i", "-P", "-k", "-m"], maxPaths: 4 }),
    ls: flagsThenPaths({ flags: ["-l", "-a", "-A", "-h", "-1", "-t", "-r", "-S", "-d", "-F", "-la", "-lh", "-lah", "-al", "-ltr", "-lt", "-R"] }),
    cat: flagsThenPaths({ flags: ["-n"], minPaths: 1, maxPaths: 4 }),
    stat: flagsThenPaths({ flags: [], minPaths: 1, maxPaths: 4 }),
    wc: flagsThenPaths({ flags: ["-l", "-c", "-w"], minPaths: 1, maxPaths: 4 }),
    head: flagsThenPaths({ flags: [], valueFlags: { "-n": true, "-c": true }, minPaths: 1, maxPaths: 4 }),
    tail: flagsThenPaths({ flags: [], valueFlags: { "-n": true, "-c": true }, minPaths: 1, maxPaths: 4 }), // sem -f/-F
    git: gitSpec,
    which: (a) => a.length >= 1 && a.length <= 4 && a.every((x) => /^[A-Za-z0-9_.-]{1,60}$/.test(x)),
    systemctl: (a) => {
        const [sub, ...rest] = a;
        if (["is-active", "is-enabled", "status", "show"].includes(sub)) {
            return rest.length >= 1 && rest.length <= 3 && rest.every((x) => x === "--no-pager" || UNIT.test(x) && !x.startsWith("-"));
        }
        if (["list-units", "list-timers", "list-unit-files"].includes(sub))
            return rest.every((x) => x === "--no-pager" || x === "--all");
        return false;
    },
    journalctl: (a) => {
        for (let i = 0; i < a.length; i += 1) {
            if (a[i] === "--no-pager" || a[i] === "-r")
                continue;
            if ((a[i] === "-n" && NUM.test(a[i + 1] ?? "")) || (a[i] === "-u" && UNIT.test(a[i + 1] ?? "") && !a[i + 1].startsWith("-"))) {
                i += 1;
                continue;
            }
            return false; // sem --vacuum/--rotate/--flush/-f
        }
        return a.includes("-n") || a.includes("-u");
    },
    ps: (a) => a.length === 0 || (a.length === 1 && ["aux", "-ef", "-e", "-A", "ax"].includes(a[0])),
    ss: (a) => a.every((x) => ["-t", "-l", "-n", "-p", "-u", "-a", "-tln", "-tlnp", "-ltn", "-lntp", "-tulnp", "-tuln"].includes(x)),
    grep: (a, ctx) => {
        let i = 0;
        const FL = new Set(["-r", "-R", "-n", "-i", "-l", "-c", "-w", "-F", "-H", "-h", "-v", "-rn", "-rni", "-ri", "-in"]);
        while (i < a.length && a[i].startsWith("-")) {
            if (FL.has(a[i])) {
                i += 1;
                continue;
            }
            if (a[i] === "-m" && NUM.test(a[i + 1] ?? "")) {
                i += 2;
                continue;
            }
            return false;
        }
        const pattern = a[i];
        if (!pattern || pattern.startsWith("-"))
            return false;
        const paths = a.slice(i + 1);
        return paths.length >= 1 && paths.length <= 4 && paths.every((p) => validPathArg(p, ctx));
    },
};
export const READONLY_COMMANDS = Object.freeze(Object.keys(SPECS).sort());
export function classifyReadOnlyCommand(command, { baseDir = process.cwd() } = {}) {
    if (typeof command !== "string")
        return { readOnly: false, reason: "not_string" };
    if (command.length === 0 || command.length > MAX_LEN)
        return { readOnly: false, reason: "length" };
    if (!SAFE_LINE.test(command))
        return { readOnly: false, reason: "unsafe_syntax" };
    const tokens = command.split(" ");
    if (tokens.length > MAX_TOKENS)
        return { readOnly: false, reason: "too_many_tokens" };
    const [bin, ...args] = tokens;
    const spec = Object.prototype.hasOwnProperty.call(SPECS, bin) ? SPECS[bin] : null;
    if (!spec)
        return { readOnly: false, reason: "command_not_allowlisted" };
    let ok = false;
    try {
        ok = spec(args, { baseDir }) === true;
    }
    catch {
        ok = false;
    }
    return ok ? { readOnly: true, reason: "allowlisted_readonly", command: bin } : { readOnly: false, reason: "arguments_not_proven_readonly" };
}
//# sourceMappingURL=readonly-command.js.map