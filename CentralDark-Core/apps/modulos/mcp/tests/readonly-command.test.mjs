import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { classifyReadOnlyCommand, READONLY_COMMANDS } from "../src/lib/readonly-command.js";

const base = fs.mkdtempSync(path.join(os.tmpdir(), "cd-readonly-"));
fs.writeFileSync(path.join(base, "a.txt"), "x\n");
fs.writeFileSync(path.join(base, "prod.env"), "A=1\n");
fs.symlinkSync(path.join(base, "prod.env"), path.join(base, "innocent.txt"));
const c = (cmd) => classifyReadOnlyCommand(cmd, { baseDir: base });

test("leituras provadas sao classificadas como somente leitura", () => {
  for (const cmd of [
    "echo diagnostico", "hostname", "hostname -f", "whoami", "pwd", "uptime", "date -u", "date +%F",
    "uname -a", "id -u", "df -h", "free -m", "ls", "ls -la", "ls -la a.txt", "cat a.txt", "head -n 5 a.txt",
    "head -n5 a.txt", "tail -n 20 a.txt", "wc -l a.txt", "stat a.txt",
    "git status --short", "git log --oneline -n5", "git log -n5 origin/main", "git rev-parse --short HEAD",
    "git branch --show-current", "git remote -v", "git worktree list", "git diff --no-ext-diff --stat",
    "systemctl is-active nginx", "systemctl list-timers --no-pager", "journalctl -u nginx -n 50 --no-pager",
    "ps aux", "ss -tlnp", "which node", "grep -rn needle a.txt",
  ]) assert.equal(c(cmd).readOnly, true, cmd);
});

test("encadeamento, redirecionamento, substituicao e expansao nunca sao leitura", () => {
  for (const cmd of [
    "echo a; hostname", "echo a && hostname", "echo a || hostname", "echo a | tee x", "echo a > x", "echo a >> x",
    "cat a.txt > b", "echo $(id)", "echo `id`", "echo ${HOME}", "echo $HOME", "echo a & ", "echo a\nrm x",
    "cat <(id)", "echo 'a'", "echo \"a\"", "ls *", "ls a?", "ls [a]", "echo ~", "echo a\\ b", "FOO=1 hostname",
    "echo !!", "echo {a,b}", "cat a.txt #c", "", " ", "echo  dois-espacos",
  ]) assert.equal(c(cmd).readOnly, false, JSON.stringify(cmd));
});

test("comandos de escrita, execucao indireta e interpretadores ficam fora da allowlist", () => {
  for (const cmd of [
    "rm a.txt", "touch x", "mkdir x", "mv a b", "cp a b", "chmod 777 a.txt", "tee x", "sed -i s/a/b/ a.txt",
    "awk BEGIN{system(1)}", "find . -delete", "find . -exec id", "xargs id", "bash -c id", "sh -c id",
    "node -e 1", "python3 -c 1", "curl http://x", "wget http://x", "env", "printenv", "sudo id", "kill 1",
    "systemctl restart nginx", "systemctl stop nginx", "git push", "git commit -m x", "git reset --hard",
    "git checkout main", "git clean -fd", "git branch -D x", "git branch novo", "git remote add x y",
    "git worktree remove x", "git -c core.pager=id log", "git diff --output=x", "git log --output=x",
    "git diff --stat", "git diff --no-index a b", "git log --ext-diff",
    "hostname novo-nome", "date 010100002026", "date -s 2026-01-01", "tail -f a.txt", "tail -F a.txt",
    "journalctl --vacuum-size=1M", "journalctl --rotate", "journalctl -f", "crontab -l", "dd if=a of=b",
  ]) assert.equal(c(cmd).readOnly, false, cmd);
});

test("caminhos sensiveis, traversal e symlink para segredo ficam bloqueados", () => {
  for (const cmd of [
    "cat /etc/shadow", "cat /proc/1/environ", "cat .env", "cat prod.env", "cat innocent.txt",
    "cat ../a.txt", "cat /root/.ssh/id_rsa", "cat /root/.hermes/x", "cat secrets/x", "cat token.txt",
    "ls /dev", "head -n 1 /dev/zero", "grep -r x /root/.config",
  ]) assert.equal(c(cmd).readOnly, false, cmd);
});

test("entrada invalida e allowlist congelada", () => {
  for (const v of [undefined, null, 5, {}, ["echo a"]]) assert.equal(classifyReadOnlyCommand(v).readOnly, false);
  assert.equal(c("echo " + "a".repeat(600)).readOnly, false);
  assert.equal(c("echo " + Array(30).fill("a").join(" ")).readOnly, false);
  assert.equal(c("__proto__").readOnly, false);
  assert.equal(c("constructor").readOnly, false);
  assert.equal(c("toString").readOnly, false);
  for (const banned of ["rm", "bash", "sh", "sed", "awk", "find", "env", "node", "curl", "tee", "xargs"]) {
    assert.ok(!READONLY_COMMANDS.includes(banned), banned);
  }
  assert.ok(Object.isFrozen(READONLY_COMMANDS));
});
