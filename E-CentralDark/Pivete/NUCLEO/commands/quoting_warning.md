# COMANDO - quoting_warning.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\shlex-2.0.1\src\quoting_warning.md
**SHA:** f546c856f6db2aa8
**Timestamp:** 2026-08-28T02:35:42.407139
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- // TODO: add more about copy-paste and human readability.

### Ouro Bruto (primeiros 5000 chars)
```
// vim: textwidth=99
/*
Meta note: This file is loaded as a .rs file by rustdoc only.
*/
/*!

A more detailed version of the [warning at the top level](super#warning) about the `quote`/`join`
family of APIs.

In general, passing the output of these APIs to a shell should recover the original string(s).
This page lists cases where it fails to do so.

In noninteractive contexts, there are only minor issues.  'Noninteractive' includes shell scripts
and `sh -c` arguments, or even scripts `source`d from interactive shells.  The issues are:

- [Nul bytes](#nul-bytes)

- [Overlong commands](#overlong-commands)

If you are writing directly to the stdin of an interactive (`-i`) shell (i.e., if you are
pretending to be a terminal), or if you are writing to a cooked-mode pty (even if the other end is
noninteractive), then there is a **severe** security issue:

- [Control characters](#control-characters-interactive-contexts-only)

Finally, there are some [solved issues](#solved-issues).

# List of issues

## Nul bytes

For non-interactive shells, the most problematic input is nul bytes (bytes with value 0).  The
convenience functions all default to returning [`QuoteError::Nul`] when encountering them, but
[`Quoter::allow_nul`] or [`bytes::Quoter::allow_nul`] can be used to leave them as-is.

In Unix, nul bytes can't appear in command arguments, environment variables, or filenames.  It's
not a question of proper quoting; they just can't be used at all.  This is a consequence of Unix's
system calls all being designed around nul-terminated C strings.

Shells inherit that limitation.  Most of them do not accept nul bytes in strings even internally.
Even when they do, it's pretty much useless or even dangerous, since you can't pass them to
external commands.

In some cases, you might fail to pass the nul byte to the shell in the first place.  For example,
the following code uses [`Quoter::join`] to tunnel a command over an SSH connection:

```rust
std::process::Command::new("ssh")
    .arg("myhost")
    .arg("--")
    .arg(Quoter::new().allow_nul(true).join(my_cmd_args).unwrap())
```

If any argument in `my_cmd_args` contains a nul byte, then `join(my_cmd_args)` will contain a nul
byte.  But `join(my_cmd_args)` is itself being passed as an argument to a command (the ssh
command), and command arguments can't contain nul bytes!  So this will simply result in the
`Command` failing to launch.

Still, there are other ways to smuggle nul bytes into a shell.  How the shell reacts depends on the
shell and the method of smuggling.  For example, here is Bash 5.2.21 exhibiting three different
behaviors:

- With ANSI-C quoting, the string is truncated at the first nul byte:
  ```bash
  $ echo $'foo\0bar' | hexdump -C
  00000000  66 6f 6f 0a                                       |foo.|
  ```

- With command substitution, nul bytes are removed with a warning:
  ```bash
  $ echo $(printf 'foo\0bar') | hexdump -C
  bash: warning: command substitution: ignored null byte in input
  00000000  66 6f 6f 62 61 72 0a                              |foobar.|
  ```

- When a nul byte appears directly in a shell script, it's removed with no warning:
  ```bash
  $ printf 'echo "foo\0bar"' | bash | hexdump -C
  00000000  66 6f 6f 62 61 72 0a                              |foobar.|
  ```

Zsh, in contrast, actually allows nul bytes internally, in shell variables and even arguments to
builtin commands.  But if a variable is exported to the environment, or if an argument is used for
an external command, then the child process will see it silently truncated at the first nul.  This
might actually be more dangerous, depending on the use case.

## Overlong commands

If you pass a long string into a shell, several things might happen:

- It might succeed, yet the shell might have trouble actually doing anything with it.  For example:

  ```bash
  x=$(printf '%010000000d' 0); /bin/echo $x
  bash: /bin/echo: Argument list too long
  ```

- If you're using certain shells (e.g. Busybox Ash) *and* using a pty for communication, then the
  shell will impose a line length limit, ignoring all input past the limit.

- If you're using a pty in cooked mode, then by default, if you write so many bytes as input that
  it fills the kernel's internal buffer, the kernel will simply drop those bytes, instead of
  blocking waiting for the shell to empty out the buffer.  In other words, random bits of input can
  be lost, which is obviously insecure.

Future versions of this crate may add an option to [`Quoter`] to check the length for you.

## Control characters (*interactive contexts only*)

Control characters are the bytes from `\x00` to `\x1f`, plus `\x7f`.  `\x00` (the nul byte) is
discussed [above](#nul-bytes), but what about the rest?  Well, many of them correspond to terminal
keyboard shortcuts.  For example, when you press Ctrl-A at a shell prompt, your terminal sends the
byte `\x01`.  The shell sees that byte and (if not configured differently) takes the standard
action 
```